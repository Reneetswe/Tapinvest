# 2FA Troubleshooting Guide

## Quick Diagnostic Steps

### Step 1: Check Browser Console

1. Open browser DevTools: Press **F12**
2. Go to **Console** tab
3. Click "Enable 2FA" button
4. Look for these messages:

```
🔄 Starting 2FA enrollment...
📍 Current URL: http://127.0.0.1:5050/...
📤 Sending request to /api/2fa/enroll
📥 Response status: [STATUS_CODE]
📥 Response ok: [true/false]
📦 Response data: {...}
```

### Step 2: Check Network Tab

1. In DevTools, go to **Network** tab
2. Click "Enable 2FA" button
3. Find the `/api/2fa/enroll` request
4. Check:
   - **Status Code**: Should be 200
   - **Response**: Should contain `qr`, `secret`, `otpauth`
   - **Request Headers**: Should include cookies

### Step 3: Test Authentication

1. Click the **"Test Auth Status"** button in the Debug Info section
2. Check the alert message:
   - User email should be shown
   - Session should be "Valid"
   - If "Invalid", you're not logged in properly

---

## Common Issues and Solutions

### Issue 1: "Unauthorized" Error (401)

**Symptoms:**
```
❌ 2FA enrollment failed
Status: 401
Error data: { message: "Unauthorized" }
```

**Cause:** User session is not valid

**Solutions:**

1. **Check if logged in:**
   ```javascript
   // In browser console:
   fetch('/api/auth/user', { credentials: 'include' })
     .then(r => r.json())
     .then(console.log)
   ```
   - If error: You're not logged in
   - If success: Session is valid

2. **Re-login:**
   - Logout and login again
   - Clear cookies and login
   - Check if session cookies are being sent

3. **Check server logs:**
   ```
   [2FA Enroll] Unauthorized - no session
   ```

---

### Issue 2: Network Error / CORS

**Symptoms:**
```
❌ Exception during 2FA enrollment: TypeError: Failed to fetch
```

**Cause:** Server not running or CORS issue

**Solutions:**

1. **Check server is running:**
   ```powershell
   # In terminal:
   npm run dev
   ```
   - Should show: `Server running on port 5050`

2. **Check server URL:**
   - Frontend should be on: `http://127.0.0.1:5050`
   - Backend should be on same port
   - Don't mix `localhost` and `127.0.0.1`

3. **Test endpoint directly:**
   ```javascript
   // In browser console:
   fetch('http://127.0.0.1:5050/api/2fa/enroll', {
     method: 'POST',
     credentials: 'include'
   })
     .then(r => r.json())
     .then(console.log)
     .catch(console.error)
   ```

---

### Issue 3: No QR Code / Secret in Response

**Symptoms:**
```
✅ 2FA enrollment successful!
🔑 Secret received: No
🖼️ QR code received: No
❌ Missing QR code in response
```

**Cause:** Server-side error generating QR code

**Solutions:**

1. **Check server logs:**
   ```
   [2FA Enroll] Error: ...
   ```

2. **Verify dependencies installed:**
   ```powershell
   npm list qrcode otplib
   ```
   - Should show both packages installed

3. **Reinstall if missing:**
   ```powershell
   npm install qrcode otplib
   ```

4. **Check database connection:**
   - Server needs to store secret in database
   - Check DATABASE_URL in `.env`

---

### Issue 4: QR Code Not Displaying

**Symptoms:**
- Enrollment succeeds
- No visual QR code appears

**Solutions:**

1. **Check state in console:**
   ```javascript
   // After clicking Enable 2FA:
   console.log("QR URL:", qrCodeUrl);
   console.log("Secret:", twoFactorSecret);
   console.log("Step:", enrollmentStep);
   ```

2. **Check if QR is base64:**
   - Should start with: `data:image/png;base64,`
   - Copy QR URL and paste in browser address bar
   - Should show QR code image

3. **Check enrollment step:**
   - Should be: `"enrolling"`
   - If stuck on `"idle"`, state not updating

---

### Issue 5: "Invalid Code" During Verification

**Symptoms:**
```
❌ 2FA verification failed
Status: 400
Error data: { message: "Invalid code. Please try again." }
```

**Causes & Solutions:**

1. **Time Sync Issue:**
   - Server and phone time must match
   - Check server time: `date` (Linux) or `Get-Date` (Windows)
   - Check phone time in settings
   - Enable automatic time sync

2. **Wrong Secret:**
   - Re-scan QR code
   - Or manually enter secret again
   - Make sure no spaces in secret

3. **Code Expired:**
   - TOTP codes expire every 30 seconds
   - Wait for new code
   - Enter immediately

4. **Wrong Format:**
   - Must be exactly 6 digits
   - No spaces, letters, or special characters

---

## Debugging Commands

### Test Full Flow in Console

```javascript
// 1. Check authentication
fetch('/api/auth/user', { credentials: 'include' })
  .then(r => r.json())
  .then(data => {
    console.log("✅ User:", data);
    return fetch('/api/2fa/enroll', { 
      method: 'POST', 
      credentials: 'include' 
    });
  })
  .then(r => r.json())
  .then(data => {
    console.log("✅ Enrollment:", data);
    console.log("🔑 Secret:", data.secret);
    console.log("🖼️ QR length:", data.qr?.length);
    
    // Test verification (replace with actual code from authenticator)
    const testCode = prompt("Enter 6-digit code from Microsoft Authenticator:");
    return fetch('/api/2fa/verify', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: testCode })
    });
  })
  .then(r => r.json())
  .then(data => {
    console.log("✅ Verification:", data);
  })
  .catch(err => {
    console.error("❌ Error:", err);
  });
```

### Check Server Endpoints

```powershell
# Test from command line (Windows PowerShell):

# 1. Test enrollment (need valid session cookie)
Invoke-WebRequest -Uri "http://127.0.0.1:5050/api/2fa/enroll" `
  -Method POST `
  -UseBasicParsing

# 2. Check if server is running
Invoke-WebRequest -Uri "http://127.0.0.1:5050/api/stocks" `
  -UseBasicParsing
```

---

## Server-Side Debugging

### Enable Detailed Logging

The server already has detailed logging. Check terminal output:

**Expected logs for successful enrollment:**
```
[2FA Enroll] Generating secret for user: user@example.com
[2FA Enroll] Secret generated (length: 32)
[2FA Enroll] Secret stored in database for user: user@example.com
[2FA Enroll] OTPAuth URI created for: user@example.com
[2FA Enroll] QR code generated (length: 5000+)
[2FA Enroll] Successfully enrolled user: user@example.com
```

**Error logs to look for:**
```
[2FA Enroll] Unauthorized - no session
[2FA Enroll] Error: [error details]
```

### Check Database

```sql
-- Check if user exists and has 2FA fields
SELECT 
  id,
  email,
  two_factor_enabled,
  totp_secret IS NOT NULL as has_secret,
  two_factor_verified_at
FROM users
WHERE email = 'your-email@example.com';
```

---

## Step-by-Step Diagnostic Procedure

### 1. Verify Server is Running

```powershell
# Check if port 5050 is in use
netstat -ano | findstr :5050

# Should show something like:
# TCP    127.0.0.1:5050    0.0.0.0:0    LISTENING    [PID]
```

### 2. Verify You're Logged In

1. Open: `http://127.0.0.1:5050`
2. Check if you see the dashboard
3. Click "Test Auth Status" button
4. Should show your email

### 3. Open DevTools Before Testing

1. Press **F12**
2. Go to **Console** tab
3. Clear console (trash icon)
4. Go to **Network** tab
5. Check "Preserve log"

### 4. Click "Enable 2FA"

Watch for:
- Console messages (🔄, 📤, 📥, ✅ or ❌)
- Network request to `/api/2fa/enroll`
- Alert messages

### 5. Analyze Results

**If you see:**
- ✅ Success messages → QR should appear
- ❌ 401 Unauthorized → Not logged in
- ❌ 500 Server Error → Check server logs
- ❌ Network error → Server not running

---

## Quick Fixes

### Fix 1: Clear Everything and Restart

```powershell
# Stop server (Ctrl+C in terminal)

# Clear node modules and reinstall
Remove-Item -Recurse -Force node_modules
npm install

# Restart server
npm run dev
```

### Fix 2: Reset Database 2FA Fields

```sql
-- Reset 2FA for a user
UPDATE users 
SET 
  two_factor_enabled = false,
  totp_secret = NULL,
  two_factor_verified_at = NULL
WHERE email = 'your-email@example.com';
```

### Fix 3: Test with Curl (if available)

```bash
# Test enrollment endpoint
curl -X POST http://127.0.0.1:5050/api/2fa/enroll \
  -H "Content-Type: application/json" \
  -b "connect.sid=YOUR_SESSION_COOKIE" \
  -v
```

---

## What to Share When Asking for Help

1. **Browser Console Output:**
   - Copy all messages from clicking "Enable 2FA"
   - Include both ✅ and ❌ messages

2. **Network Tab Info:**
   - Status code of `/api/2fa/enroll` request
   - Response body
   - Request headers (especially cookies)

3. **Server Logs:**
   - Copy terminal output after clicking button
   - Include `[2FA Enroll]` messages

4. **Test Auth Status Result:**
   - Click "Test Auth Status" button
   - Share the alert message

5. **Environment Info:**
   - Browser: Chrome/Edge/Firefox
   - OS: Windows version
   - Node version: `node --version`
   - npm version: `npm --version`

---

## Expected Successful Flow

### Console Output:
```
🔄 Starting 2FA enrollment...
📍 Current URL: http://127.0.0.1:5050/?tab=settings
📤 Sending request to /api/2fa/enroll
📥 Response status: 200
📥 Response ok: true
📦 Response data: {otpauth: "...", qr: "data:image/png;base64,...", secret: "JBSWY3DPEHPK3PXP", success: true}
✅ 2FA enrollment successful!
🔑 Secret received: Yes
🖼️ QR code received: Yes (data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...)
✅ State updated - QR code should now be visible
📱 QR Code ready for Microsoft Authenticator
🏁 2FA enrollment process completed
```

### Server Logs:
```
[2FA Enroll] Generating secret for user: user@example.com
[2FA Enroll] Secret generated (length: 32)
[2FA Enroll] Secret stored in database for user: user@example.com
[2FA Enroll] OTPAuth URI created for: user@example.com
[2FA Enroll] QR code generated (length: 5432)
[2FA Enroll] Successfully enrolled user: user@example.com
```

### Visual Result:
- QR code appears on screen
- Secret key shown below QR
- Input field for 6-digit code
- "Verify" button enabled

---

## Still Not Working?

1. **Take screenshots of:**
   - Browser console (F12 → Console)
   - Network tab showing `/api/2fa/enroll` request
   - The Settings page with Debug Info visible

2. **Copy and share:**
   - Full console output
   - Server terminal output
   - Alert message from "Test Auth Status"

3. **Try alternative:**
   - Use a different browser
   - Try incognito/private mode
   - Clear all cookies and login again

---

## Contact Information

When reporting issues, include:
- [ ] Browser console output
- [ ] Server logs
- [ ] Network tab screenshot
- [ ] Test Auth Status result
- [ ] Screenshots of error messages
- [ ] Node/npm versions
