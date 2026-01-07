/**
 * ============================================
 * TEMPORARY: Razorpay Verification Login Form
 * ============================================
 *
 * This component is ONLY for Razorpay payment gateway verification.
 * DELETE THIS ENTIRE FILE after Razorpay verification is complete.
 *
 * Also remove the import and usage from Login.tsx
 */

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { apiClient } from "@/lib/api";
import { useAuth } from "@/hooks";
import { Loader2, Mail, Lock } from "lucide-react";

export function useVerifyLoginStatus() {
  const [isEnabled, setIsEnabled] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const response = (await apiClient.get("/auth/verify-login/status")) as {
          enabled: boolean;
        };
        setIsEnabled(response.enabled);
      } catch (error) {
        // If endpoint doesn't exist or fails, assume disabled
        setIsEnabled(false);
      } finally {
        setChecking(false);
      }
    };
    checkStatus();
  }, []);

  return { isEnabled, checking };
}

export function VerifyLoginForm() {
  const navigate = useNavigate();
  const { refetchUser } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error("Please enter email and password");
      return;
    }

    setLoading(true);

    try {
      const response = (await apiClient.post("/auth/verify-login", {
        email,
        password,
      })) as { token: string; user: unknown };

      // Store token
      localStorage.setItem("auth_token", response.token);

      // Refetch user to update auth state
      await refetchUser();

      toast.success("Login successful!");
      navigate("/dashboard");
    } catch (error: unknown) {
      console.error("Login error:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Invalid email or password";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="verify-email">Email</Label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id="verify-email"
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
            autoComplete="email"
            className="pl-10"
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="verify-password">Password</Label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id="verify-password"
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
            autoComplete="current-password"
            className="pl-10"
          />
        </div>
      </div>
      <Button
        type="submit"
        variant="outline"
        className="w-full"
        disabled={loading}
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Signing in...
          </>
        ) : (
          "Sign In with Email"
        )}
      </Button>
    </form>
  );
}
