"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { getUserRole } from "@/services/userService";

export const useRequireRole = (requiredRole: string) => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const checkAccess = async () => {
      const { data, error } = await supabase.auth.getUser();
      const user = data.user;

      if (error || !user) {
        router.push("/login");
        return;
      }

      const role = await getUserRole(user.id);

      if (role !== requiredRole) {
        router.push(`/login`);
      }

      setLoading(false);
      setUser(user);
    };

    checkAccess();
  }, []);
  return { loading, user };
};