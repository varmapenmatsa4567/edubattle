"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { isEmailExists, signUp } from "@/services/authService";
import { createUser } from "@/services/userService";
import { supabase } from "@/lib/supabaseClient";
import { Spinner } from "../ui/spinner";
import { toast } from "sonner";
import { ROLES } from "@/constants/roles";
import { createSchool } from "@/services/schoolService";

export default function SignupForm() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    if (!email || !password) {
      toast.error("Email and password are required");
      return;
    }

    setLoading(true);

    try {
      // 1. Check if email exists
      const emailExists = await isEmailExists(email);
      if (emailExists) {
        toast.error("Email already exists");
        return;
      }

      // 2. Signup
      const { data, error } = await signUp(email, password);
      if (error) throw error;

      if (!data.user) throw new Error("User creation failed");

      // 3. Create user in DB
      await createUser(data.user.id, data.user.email!, ROLES.SCHOOL);

      // 4. Create school
      await createSchool(data.user.id, "Untitled");

      // 5. Success
      toast.success("Signup successful");

      // 6. Redirect
      router.push("/login");

    } catch (err: any) {
      toast.error(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-[320px] space-y-4">
      <h2 className="text-xl font-semibold">School Signup</h2>

      <Input
        placeholder="School Email"
        onChange={(e) => setEmail(e.target.value)}
      />

      <Input
        type="password"
        placeholder="Password"
        onChange={(e) => setPassword(e.target.value)}
      />

      <Button onClick={handleSignup} disabled={loading}>
        {loading && <Spinner className="mr-2" />}
        Sign Up
      </Button>
    </div>
  );
}