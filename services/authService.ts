import { supabase } from "@/lib/supabaseClient";

export const signUp = (email: string, password: string) => {
    return supabase.auth.signUp({
        email,
        password
    });
}

export const login = (email: string, password: string) => {
    return supabase.auth.signInWithPassword({
        email,
        password
    });
}

export const isEmailExists = async (email: string) => {
    console.log("Checking...")
    const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("email", email)

    if (error) {
        console.error(error.message);
        return false;
    }

    return data.length > 0;
}