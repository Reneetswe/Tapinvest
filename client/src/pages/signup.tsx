import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BarChart3 } from "lucide-react";

export default function Signup() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const handleInput = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      alert("Passwords don't match");
      return;
    }
    // Validate password strength (8-12 chars, letters, numbers, symbols)
    const strong = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,12}$/;
    if (!strong.test(formData.password)) {
      alert("Password must be 8-12 characters and include letters, numbers, and symbols");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(`${window.location.origin}/api/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          email: formData.email,
          firstName: formData.firstName,
          lastName: formData.lastName,
          password: formData.password,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || "Signup failed");
      }
      // Redirect to dashboard on success
      window.location.href = "/";
    } catch (err: any) {
      alert(err?.message || "Signup failed");
    } finally {
      setSubmitting(false);
    }
  };

  const goHome = () => (window.location.href = "/");

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
            <CardTitle className="text-2xl font-bold">Create Account</CardTitle>
            <CardDescription>Start trading on the Botswana Stock Exchange</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>First Name</Label>
                  <Input value={formData.firstName} onChange={(e) => handleInput("firstName", e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label>Last Name</Label>
                  <Input value={formData.lastName} onChange={(e) => handleInput("lastName", e.target.value)} required />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input type="email" value={formData.email} onChange={(e) => handleInput("email", e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label>Password</Label>
                <Input type="password" value={formData.password} onChange={(e) => handleInput("password", e.target.value)} placeholder="8-12 chars, letters, numbers, symbols" required />
              </div>
              <div className="space-y-2">
                <Label>Confirm Password</Label>
                <Input type="password" value={formData.confirmPassword} onChange={(e) => handleInput("confirmPassword", e.target.value)} required />
              </div>
              <Button type="submit" className="w-full" size="lg" disabled={submitting}>
                {submitting ? "Creating..." : "Signup"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
