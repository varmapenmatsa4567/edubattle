import { supabase } from "@/lib/supabaseClient"

export const getUserRole = async (userId: string) => {
    const { data, error } = await supabase
        .from("users")
        .select("role")
        .eq("id", userId)
        .single()

    if (error) {
        console.error(error.message);
        return null;
    }

    return data?.role;
}

export const createUser = async (userId: string, email: string, role: string) => {
    const { data, error } = await supabase
        .from("users")
        .insert({
            id: userId,
            email: email,
            role: role
        })

    if (error) {
        console.error(error.message);
        return null;
    }

    return data;
}
    
    