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

export const updateSchool = async (schoolId: string, updates: any) => {
    const { data, error } = await supabase
        .from("schools")
        .update(updates)
        .eq("id", schoolId);

    if (error) {
        console.log(error.message);
        return null;
    }

    return "Success";
}

export const isUserNameAvailable = async (username: string) => {
    const { data, error } = await supabase
        .from("schools")
        .select("*")
        .eq("username", username)
        .single();

    if (error) {
        return true; // No record found, so it is available
    }

    return false; // Record found, so it is NOT available
}