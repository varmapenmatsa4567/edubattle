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

export const getSchoolDetails = async (userId: string) => {
    const { data, error } = await supabase
        .from("schools")
        .select("*")
        .eq("user_id", userId)
        .single();

    if (error) {
        console.log(error.message);
        return null;
    }

    return data;
}