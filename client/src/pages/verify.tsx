import { useEffect, useMemo, useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function Verify() {
  const [loc, navigate] = useLocation();
  const params = useMemo(() => new URLSearchParams(window.location.search), []);
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const e = params.get("email") || "";
    setEmail(e);
  }, [params]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`${window.location.origin}/api/verify-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, code }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || "Verification failed");
      }
      navigate("/");
    } catch (err: any) {
      setError(err?.message || "Verification failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-white dark:from-gray-900 dark:via-gray-800 dark:to-gray-700">
      <section className="container mx-auto px-4 py-10 flex justify-center">
        <Card className="w-full max-w-md shadow-2xl border-0 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm">
          <CardHeader className="text-center space-y-2">
            <CardTitle className="text-2xl font-bold">Verify Email</CardTitle>
            <CardDescription>Enter the 6-digit code sent to your email</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Email</Label>
                <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label>Verification Code</Label>
                <Input inputMode="numeric" value={code} onChange={(e) => setCode(e.target.value)} placeholder="123456" required />
              </div>
              {error ? (
                <div className="text-sm text-red-600 dark:text-red-400">{error}</div>
              ) : null}
              <Button type="submit" className="w-full" size="lg" disabled={submitting}>
                {submitting ? "Verifying..." : "Verify"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
