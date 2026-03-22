import { signUp } from "@/services/authService";
import { addStudent } from "@/services/studentService";
import { NextResponse } from "next/server";

/**
 * API Route for creating students in bulk or individually.
 * Useful for seeding test data via Postman.
 * 
 * Payload structure:
 * {
 *   "students": [
 *     { "name": "...", "username": "...", "password": "...", "school_id": "...", "class_id": "..." }
 *   ]
 * }
 * OR
 * { "name": "...", "username": "...", "password": "...", "school_id": "...", "class_id": "..." }
 */
export async function POST(req) {
  try {
    const body = await req.json();
    let studentsToCreate = [];

    if (body.students && Array.isArray(body.students)) {
      studentsToCreate = body.students;
    } else {
      studentsToCreate = [body];
    }

    const results = [];

    for (const student of studentsToCreate) {
      const { name, username, password, school_id, class_id } = student;

      if (!name || !username || !password || !school_id || !class_id) {
        results.push({
          username,
          status: "failed",
          error: "Missing required fields (name, username, password, school_id, class_id)"
        });
        continue;
      }

      try {
        // Enforce the email format if it's just a username
        const email = username.includes("@") ? username : `${username}@test.com`;

        // 1. Auth Signup
        const { data: authData, error: authError } = await signUp(email, password);
        
        if (authError) {
          results.push({ username, status: "failed", error: authError.message });
          continue;
        }

        if (!authData?.user) {
          results.push({ username, status: "failed", error: "Auth signup failed - no user returned" });
          continue;
        }

        // 2. Create student records
        const res = await addStudent(
          authData.user.id,
          school_id,
          name,
          email,
          password,
          class_id
        );

        if (res) {
          results.push({ username, status: "success", id: res.id, user_id: authData.user.id });
        } else {
          results.push({ username, status: "failed", error: "Failed to create student database records" });
        }

      } catch (err) {
        results.push({ username, status: "failed", error: err.message });
      }
    }

    return NextResponse.json({ results });

  } catch (error) {
    console.error("Error in students API:", error);
    return NextResponse.json(
      { error: "Internal server error", message: error.message },
      { status: 500 }
    );
  }
}
