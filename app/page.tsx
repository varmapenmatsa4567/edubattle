"use client";

import { useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function TestPage() {
  useEffect(() => {
    const test = async () => {
      const { data, error } = await supabase
        .from("test")
        .select("*");

      console.log(data, error);
    };

    test();
  }, []);

  return <div>Check console</div>;
}