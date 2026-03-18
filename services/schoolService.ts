import { supabase } from "@/lib/supabaseClient";

export const createSchool = async (userId: string, name: string) => {
    const { data, error } = await supabase
        .from("schools")
        .insert({
            user_id: userId,
            name: name
        })

    if (error) {
        console.error(error.message);
        return null;
    }

    return data;
}