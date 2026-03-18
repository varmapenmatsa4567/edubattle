// components/auth/login-form.tsx
"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { login } from "@/services/authService";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Spinner } from "../ui/spinner";
import { getUserRole } from "@/services/userService";

export default function LoginForm() {
  const router = useRouter();

  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const handleLogin = async () => {
    if (!email || !password) {
      toast.error("Email and password required");
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await login(email, password);

      if (error) throw error;

      toast.success("Login successful");

      // 🔥 redirect to dashboard (temporary)
      const userRole = await getUserRole(data.user.id);
      if(userRole != null) {
        router.push(`/${userRole}`);
      } else {
        toast.error("User role not found");
      }

    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-[320px] space-y-4">
      <h2 className="text-xl font-semibold">School Login</h2>

      <Input
        placeholder="Email"
        onChange={(e) => setEmail(e.target.value)}
      />

      <Input
        type="password"
        placeholder="Password"
        onChange={(e) => setPassword(e.target.value)}
      />

      <Button onClick={handleLogin} disabled={loading}>
        {loading && <Spinner className="mr-2" />}
        Login
      </Button>

      <p className="text-sm text-center">
        Don’t have an account?{" "}
        <a href="/signup" className="text-blue-500">
          Sign up
        </a>
      </p>
    </div>
  );
}