import type { Express, RequestHandler } from "express";
import session from "express-session";
import memorystore from "memorystore";
import { storage } from "./storage";
import { authenticator } from "otplib";
import QRCode from "qrcode";
import { sendMail } from "./mailer";
import bcrypt from "bcryptjs";

// Simple local session-based auth (no external provider)
// - GET /api/login: creates a demo user session in development and redirects to /
// - POST /api/login: accepts { email, firstName, lastName } to create/login a user
// - GET /api/logout: destroys session and redirects to /

export function getSession() {
  const sessionTtlMs = 7 * 24 * 60 * 60 * 1000;
  const MemoryStore = memorystore(session);
  return session({
    secret: process.env.SESSION_SECRET || "dev-session-secret",
    store: new MemoryStore({ checkPeriod: sessionTtlMs }),
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: false,
      maxAge: sessionTtlMs,
    },
  });
}

export async function setupAuth(app: Express) {
  app.set("trust proxy", 1);
  app.use(getSession());

  // Bridge req.session.user -> req.user for compatibility with existing code
  app.use((req: any, _res, next) => {
    if (req.session && req.session.user) {
      req.user = req.session.user;
    }
    next();
  });

  // Development auto-login route to keep existing flows working
  app.get("/api/login", async (req: any, res) => {
    try {
      const demoId = "demo-user";
      await storage.upsertUser({
        id: demoId,
        email: "demo@example.com",
        firstName: "Demo",
        lastName: "User",
        profileImageUrl: undefined,
      });
      req.session.user = { claims: { sub: demoId } };
      res.redirect("/");
    } catch (_e) {
      res.status(500).json({ message: "Failed to create demo session" });
    }
  });

  // Login endpoint - password-based authentication
  app.post("/api/auth/login", async (req: any, res) => {
    try {
      const { email, password } = req.body || {};
      
      console.log("[Login] 🔄 Login attempt for:", email);
      
      // Validate input
      if (!email || !password) {
        console.log("[Login] ❌ Missing email or password");
        return res.status(400).json({ 
          success: false,
          message: "Email and password are required" 
        });
      }

      const userId = email.toLowerCase().trim();
      
      // Get user from database
      const user = await storage.getUser(userId);
      if (!user) {
        console.log("[Login] ❌ User not found:", userId);
        return res.status(401).json({ 
          success: false,
          message: "Invalid email or password" 
        });
      }

      // Check if user has a password set
      if (!user.passwordHash) {
        console.log("[Login] ❌ User has no password set:", userId);
        return res.status(401).json({ 
          success: false,
          message: "Invalid email or password" 
        });
      }

      // Verify password
      const passwordMatch = await bcrypt.compare(String(password), user.passwordHash);
      if (!passwordMatch) {
        console.log("[Login] ❌ Invalid password for:", userId);
        return res.status(401).json({ 
          success: false,
          message: "Invalid email or password" 
        });
      }

      console.log("[Login] ✅ Password verified for:", userId);

      // Create session
      req.session.user = { 
        claims: { 
          sub: userId 
        } 
      };

      console.log("[Login] ✅ Session created for:", userId);

      res.json({ 
        success: true,
        message: "Login successful",
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          twoFactorEnabled: user.twoFactorEnabled
        }
      });

    } catch (error) {
      console.error("[Login] ❌ Error:", error);
      res.status(500).json({ 
        success: false,
        message: "Login failed. Please try again." 
      });
    }
  });

  // Optional: credential-based login (POST) - Legacy/Demo
  app.post("/api/login", async (req: any, res) => {
    try {
      const { email, firstName, lastName, password } = req.body || {};
      if (!email) {
        return res.status(400).json({ message: "Email is required" });
      }
      const userId = email.toLowerCase();

      // If password is provided, perform password verification
      if (password) {
        const user = await storage.getUser(userId);
        if (!user || !user.passwordHash) {
          return res.status(400).json({ message: "Invalid credentials" });
        }
        const ok = await bcrypt.compare(String(password), user.passwordHash);
        if (!ok) {
          return res.status(400).json({ message: "Invalid credentials" });
        }
        req.session.user = { claims: { sub: userId } };
        return res.json({ success: true });
      }

      // Fallback legacy: upsert by email only (dev/demo)
      await storage.upsertUser({ id: userId, email, firstName, lastName });
      req.session.user = { claims: { sub: userId } };
      res.json({ success: true });
    } catch (_e) {
      res.status(500).json({ message: "Login failed" });
    }
  });

  app.post("/api/signup", async (req: any, res) => {
    try {
      const { email, firstName, lastName, password } = req.body || {};
      if (!email) {
        return res.status(400).json({ message: "Email is required" });
      }
      const userId = (email as string).toLowerCase();

      // If password provided, validate strength and create a password account
      if (password) {
        const pwd = String(password);
        const strong = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,12}$/;
        if (!strong.test(pwd)) {
          return res.status(400).json({ message: "Password must be 8-12 chars and include letters, numbers, and symbols" });
        }
        const hash = await bcrypt.hash(pwd, 10);
        await storage.upsertUser({
          id: userId,
          email,
          firstName,
          lastName,
          passwordHash: hash,
          emailVerified: true as any,
          emailVerificationCode: null as any,
          emailVerificationExpires: null as any,
        });
        req.session.user = { claims: { sub: userId } };
        return res.json({ success: true });
      }

      // Default: OTP email verification flow (kept for optional use)
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      const expires = new Date(Date.now() + 10 * 60 * 1000);
      await storage.upsertUser({
        id: userId,
        email,
        firstName,
        lastName,
        emailVerified: false as any,
        emailVerificationCode: code,
        emailVerificationExpires: expires as any,
      });
      const appName = "BSE Trading Platform";
      const html = `<p>Your ${appName} verification code is:</p><h2>${code}</h2><p>This code expires in 10 minutes.</p>`;
      await sendMail(email, `${appName} Email Verification Code`, html, `Your code is ${code}`);
      res.json({ pendingVerification: true });
    } catch (_e) {
      res.status(500).json({ message: "Signup failed" });
    }
  });

  // Verify Email via OTP
  app.post("/api/verify-email", async (req: any, res) => {
    try {
      const { email, code } = req.body || {};
      if (!email || !code) {
        return res.status(400).json({ message: "Email and code are required" });
      }
      const userId = (email as string).toLowerCase();
      const user = await storage.getUser(userId);
      if (!user) return res.status(400).json({ message: "User not found" });

      // Validate code and expiry
      if (user.emailVerified) {
        return res.status(400).json({ message: "Email already verified" });
      }
      if (!user.emailVerificationCode || !user.emailVerificationExpires) {
        return res.status(400).json({ message: "No verification pending" });
      }
      const now = new Date();
      const exp = new Date(user.emailVerificationExpires as any);
      if (String(code) !== String(user.emailVerificationCode)) {
        return res.status(400).json({ message: "Invalid code" });
      }
      if (now > exp) {
        return res.status(400).json({ message: "Code expired" });
      }

      // Mark verified and clear code fields
      await storage.upsertUser({
        id: userId,
        emailVerified: true as any,
        emailVerificationCode: null as any,
        emailVerificationExpires: null as any,
      });

      // Create session
      req.session.user = { claims: { sub: userId } };
      res.json({ success: true });
    } catch (_e) {
      res.status(500).json({ message: "Verification failed" });
    }
  });

  app.get("/api/logout", (req: any, res) => {
    if (req.session) {
      req.session.destroy(() => res.redirect("/"));
    } else {
      res.redirect("/");
    }
  });

  // 2FA: Enroll - Generate TOTP secret and QR code for Microsoft Authenticator
  app.post("/api/2fa/enroll", async (req: any, res) => {
    try {
      // Verify user is authenticated
      if (!req.session?.user?.claims?.sub) {
        console.log("[2FA Enroll] ❌ Unauthorized - no session");
        return res.status(401).json({ 
          success: false,
          message: "Unauthorized - Please login first" 
        });
      }
      
      const userId = req.session.user.claims.sub;
      console.log(`[2FA Enroll] 🔄 Starting enrollment for user: ${userId}`);
      
      // Get user details first
      let user;
      try {
        user = await storage.getUser(userId);
        if (!user) {
          console.log(`[2FA Enroll] ❌ User not found: ${userId}`);
          return res.status(404).json({ 
            success: false,
            message: "User not found" 
          });
        }
        console.log(`[2FA Enroll] ✅ User found: ${user.email}`);
      } catch (dbError) {
        console.error("[2FA Enroll] ❌ Database error fetching user:", dbError);
        return res.status(500).json({ 
          success: false,
          message: "Database error - Could not fetch user" 
        });
      }
      
      // Generate Base32 TOTP secret (compatible with Microsoft Authenticator)
      // Uses standard TOTP parameters: 6 digits, 30-second intervals, SHA1
      let secret;
      try {
        secret = authenticator.generateSecret();
        console.log(`[2FA Enroll] ✅ Secret generated (length: ${secret.length})`);
      } catch (secretError) {
        console.error("[2FA Enroll] ❌ Error generating secret:", secretError);
        return res.status(500).json({ 
          success: false,
          message: "Failed to generate secret" 
        });
      }
      
      // Store secret in database (temporarily until verified)
      try {
        await storage.upsertUser({ id: userId, totpSecret: secret });
        console.log(`[2FA Enroll] ✅ Secret stored in database for user: ${userId}`);
      } catch (dbError) {
        console.error("[2FA Enroll] ❌ Database error storing secret:", dbError);
        return res.status(500).json({ 
          success: false,
          message: "Database error - Could not store secret" 
        });
      }
      
      // Create otpauth URI for Microsoft Authenticator
      // Format: otpauth://totp/BSE Trading Platform:email?secret=SECRET&issuer=BSE Trading Platform
      const accountName = user.email || userId;
      let otpauth;
      try {
        otpauth = authenticator.keyuri(accountName, "BSE Trading Platform", secret);
        console.log(`[2FA Enroll] ✅ OTPAuth URI created for: ${accountName}`);
      } catch (uriError) {
        console.error("[2FA Enroll] ❌ Error creating OTPAuth URI:", uriError);
        return res.status(500).json({ 
          success: false,
          message: "Failed to create authentication URI" 
        });
      }
      
      // Generate QR code as base64 data URL
      let qr;
      try {
        qr = await QRCode.toDataURL(otpauth, {
          errorCorrectionLevel: 'M',
          type: 'image/png',
          width: 300,
          margin: 1
        });
        console.log(`[2FA Enroll] ✅ QR code generated (length: ${qr.length})`);
      } catch (qrError) {
        console.error("[2FA Enroll] ❌ Error generating QR code:", qrError);
        return res.status(500).json({ 
          success: false,
          message: "Failed to generate QR code" 
        });
      }
      
      // Return both QR code and secret (for manual entry)
      const response = { 
        success: true,
        otpauth,        // Full otpauth URI
        qr,             // Base64 QR code image
        secret,         // Base32 secret for manual entry
        accountName     // Email/username for display
      };
      
      console.log(`[2FA Enroll] ✅ Successfully enrolled user: ${userId}`);
      console.log(`[2FA Enroll] 📱 QR code ready for Microsoft Authenticator`);
      
      res.json(response);
      
    } catch (e) {
      console.error("[2FA Enroll] ❌ Unexpected error:", e);
      console.error("[2FA Enroll] Error stack:", e instanceof Error ? e.stack : "No stack");
      res.status(500).json({ 
        success: false,
        message: "Internal server error during 2FA enrollment" 
      });
    }
  });

  // 2FA: Verify 6-digit code from Microsoft Authenticator and enable 2FA
  app.post("/api/2fa/verify", async (req: any, res) => {
    try {
      // Verify user is authenticated
      if (!req.session?.user?.claims?.sub) {
        console.log("[2FA Verify] ❌ Unauthorized - no session");
        return res.status(401).json({ 
          success: false,
          message: "Unauthorized - Please login first" 
        });
      }
      
      const userId = req.session.user.claims.sub;
      const code = String(req.body?.code || "").trim();
      
      console.log(`[2FA Verify] 🔄 Verifying code for user: ${userId}`);
      console.log(`[2FA Verify] 📥 Code received: ${code} (length: ${code.length})`);
      
      // Validate code format (must be 6 digits)
      if (!/^\d{6}$/.test(code)) {
        console.log("[2FA Verify] ❌ Invalid code format - must be 6 digits");
        return res.status(400).json({ 
          success: false,
          message: "Code must be exactly 6 digits" 
        });
      }
      
      // Get user and verify secret exists
      let user;
      try {
        user = await storage.getUser(userId);
        if (!user) {
          console.log(`[2FA Verify] ❌ User not found: ${userId}`);
          return res.status(404).json({ 
            success: false,
            message: "User not found" 
          });
        }
        
        if (!user.totpSecret) {
          console.log("[2FA Verify] ❌ No secret found - user not enrolled");
          return res.status(400).json({ 
            success: false,
            message: "2FA not set up. Please scan the QR code first." 
          });
        }
        
        console.log(`[2FA Verify] ✅ User found with secret`);
      } catch (dbError) {
        console.error("[2FA Verify] ❌ Database error:", dbError);
        return res.status(500).json({ 
          success: false,
          message: "Database error - Could not fetch user" 
        });
      }
      
      console.log(`[2FA Verify] 🔐 Verifying TOTP code...`);
      
      // Verify TOTP code using standard parameters:
      // - 6 digits
      // - 30-second time window
      // - SHA1 hash algorithm (default)
      let isValid;
      try {
        isValid = authenticator.check(code, user.totpSecret);
        console.log(`[2FA Verify] Verification result: ${isValid}`);
      } catch (verifyError) {
        console.error("[2FA Verify] ❌ Error during verification:", verifyError);
        return res.status(500).json({ 
          success: false,
          message: "Error verifying code" 
        });
      }
      
      if (!isValid) {
        console.log("[2FA Verify] ❌ Invalid code - verification failed");
        return res.status(400).json({ 
          success: false,
          message: "Invalid code. Please check your Microsoft Authenticator app and try again." 
        });
      }
      
      console.log(`[2FA Verify] ✅ Code verified successfully for user: ${userId}`);
      
      // Enable 2FA in database
      try {
        await storage.upsertUser({ 
          id: userId, 
          twoFactorEnabled: true, 
          twoFactorVerifiedAt: new Date() as any 
        });
        console.log(`[2FA Verify] ✅ 2FA enabled in database for user: ${userId}`);
      } catch (dbError) {
        console.error("[2FA Verify] ❌ Database error enabling 2FA:", dbError);
        return res.status(500).json({ 
          success: false,
          message: "Database error - Could not enable 2FA" 
        });
      }
      
      // Mark session as 2FA verified (keep user logged in)
      req.session.twoFactorVerified = true;
      
      const response = {
        success: true,
        message: "2FA enabled successfully! Your account is now protected.",
        twoFactorEnabled: true
      };
      
      console.log(`[2FA Verify] ✅ Successfully enabled 2FA for user: ${userId}`);
      console.log(`[2FA Verify] 🔒 Account is now protected with 2FA`);
      
      res.json(response);
      
    } catch (e) {
      console.error("[2FA Verify] ❌ Unexpected error:", e);
      console.error("[2FA Verify] Error stack:", e instanceof Error ? e.stack : "No stack");
      res.status(500).json({ 
        success: false,
        message: "Internal server error during verification" 
      });
    }
  });

  // 2FA: Challenge during login
  app.post("/api/2fa/challenge", async (req: any, res) => {
    try {
      const pending = req.session?.pending2FA;
      if (!pending) return res.status(400).json({ message: "No pending challenge" });
      const user = await storage.getUser(pending);
      const code = String(req.body?.code || "");
      if (!user?.twoFactorEnabled || !user?.totpSecret) return res.status(400).json({ message: "2FA not enabled" });
      const ok = authenticator.check(code, user.totpSecret);
      if (!ok) return res.status(400).json({ message: "Invalid code" });
      // Promote to full session
      req.session.user = { claims: { sub: pending } };
      req.session.pending2FA = undefined;
      req.session.twoFactorVerified = true;
      res.json({ success: true });
    } catch (e) {
      res.status(500).json({ message: "2FA challenge failed" });
    }
  });

  // 2FA: Disable 2FA
  app.post("/api/2fa/disable", async (req: any, res) => {
    try {
      if (!req.session?.user?.claims?.sub) return res.status(401).json({ message: "Unauthorized" });
      const userId = req.session.user.claims.sub;
      await storage.upsertUser({ 
        id: userId, 
        twoFactorEnabled: false, 
        totpSecret: null,
        twoFactorVerifiedAt: null 
      });
      req.session.twoFactorVerified = false;
      res.json({ success: true });
    } catch (e) {
      res.status(500).json({ message: "Failed to disable 2FA" });
    }
  });

  // 2FA: Skip 2FA setup during signup/login flow
  app.post("/api/2fa/skip", async (req: any, res) => {
    try {
      if (!req.session?.user?.claims?.sub) return res.status(401).json({ message: "Unauthorized" });
      // Mark session as verified (skip 2FA for this session)
      req.session.twoFactorVerified = true;
      res.json({ success: true, message: "2FA setup skipped" });
    } catch (e) {
      res.status(500).json({ message: "Failed to skip 2FA" });
    }
  });
}

export const isAuthenticated: RequestHandler = (req: any, res, next) => {
  if (req.session && req.session.user && req.session.user.claims?.sub) {
    // If user has 2FA enabled, ensure session is verified (non-breaking for users without 2FA)
    if (req.session.twoFactorVerified === false) {
      return res.status(401).json({ message: "Two-factor verification required" });
    }
    return next();
  }
  return res.status(401).json({ message: "Unauthorized" });
};
