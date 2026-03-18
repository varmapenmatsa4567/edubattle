import { supabase } from "@/lib/supabaseClient";

export const addClass = async (school_id: string, class_name: string, sections: string[]) => {
    sections.forEach(async section => {
        const { data, error } = await supabase
            .from("classes")
            .insert({
                school_id: school_id,
                class_name: class_name,
                section: section
            });
        if (error) {
            console.error(error.message);
            return null;
        }
    })

}

export const getClasses = async (school_id: string) => {
    const { data, error } = await supabase
        .from("classes")
        .select("*")
        .eq("school_id", school_id);
    if (error) {
        console.error(error.message);
        return null;
    }
    return data;
}
    