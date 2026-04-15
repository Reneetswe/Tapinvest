import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BarChart3, Eye, EyeOff, Lock, Mail } from "lucide-react";

export default function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const goHome = () => (window.location.href = "/");
  const goToSignup = () => (window.location.href = "/signup");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    // Validation
    if (!email || !password) {
      setError("Please enter both email and password");
      setSubmitting(false);
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      setSubmitting(false);
      return;
    }

    try {
      console.log("🔄 Attempting login...");
      console.log("📧 Email:", email);

      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });

      console.log("📥 Response status:", res.status);

      if (!res.ok) {
        const data = await res.json().catch(() => ({ message: "Login failed" }));
        console.error("❌ Login failed:", data);
        throw new Error(data.message || "Invalid email or password");
      }

      const data = await res.json();
      console.log("✅ Login successful:", data);

      // Redirect to dashboard
      window.location.href = "/";
    } catch (err: any) {
      console.error("❌ Login error:", err);
      setError(err?.message || "Login failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-white dark:from-gray-900 dark:via-gray-800 dark:to-gray-700">
      <header className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <BarChart3 className="h-8 w-8 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">BSE Trading Platform</h1>
          </div>
          <Button variant="outline" onClick={goHome}>Back</Button>
        </div>
      </header>

      <section className="container mx-auto px-4 py-10 flex justify-center">
        <Card className="w-full max-w-md shadow-2xl border-0 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm">
          <CardHeader className="text-center space-y-2">
            <CardTitle className="text-2xl font-bold">Welcome Back</CardTitle>
            <CardDescription>Sign in to your BSE trading account</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Error Message */}
              {error && (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                </div>
              )}

              {/* Email Field */}
              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Email Address
                </Label>
                <Input 
                  id="email"
                  type="email" 
                  placeholder="your.email@example.com"
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  required 
                  autoComplete="email"
                  className="h-11"
                />
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <Label htmlFor="password" className="flex items-center gap-2">
                  <Lock className="h-4 w-4" />
                  Password
                </Label>
                <div className="relative">
                  <Input 
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    required 
                    autoComplete="current-password"
                    className="h-11 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Minimum 6 characters
                </p>
              </div>

              {/* Submit Button */}
              <Button type="submit" className="w-full" size="lg" disabled={submitting}>
                {submitting ? (
                  <>
                    <span className="mr-2">Signing in...</span>
                    <span className="animate-spin">⏳</span>
                  </>
                ) : (
                  "Sign In"
                )}
              </Button>

              {/* Sign Up Link */}
              <div className="text-center text-sm text-gray-500 dark:text-gray-400">
                Don&apos;t have an account?{" "}
                <button 
                  type="button" 
                  className="text-blue-600 dark:text-blue-400 hover:underline font-medium" 
                  onClick={goToSignup}
                >
                  Create Account
                </button>
              </div>
            </form>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
