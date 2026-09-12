import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  // Use the supabase client already imported

  // Exchange the authorization code for a session
  const { data, error } = await supabase.auth.getSession();

  if (error) {
    console.error("Supabase auth error:", error);
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Check if the user has been verified
  const { data: userData, error: userError } = await supabase
    .from("Employee")
    .select("*")
    .eq("id", data.session?.user?.id)
    .single();

  if (userError || !userData) {
    // New user from Supabase auth - create employee record
    const { error: insertError } = await supabase
      .from("Employee")
      .insert({
        id: data.session?.user?.id,
        name: data.session?.user?.email?.split("@")[0] || "Unknown",
        position: "USER",
        department: "QHSE",
        pinCode: "",
        qrCodeData: "",
        certifications: "",
        role: "SUPERVISOR", // Default role, will be updated on first login
        status: "ACTIVE",
      });

    if (insertError) {
      console.error("Error creating employee record:", insertError);
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  // User is now verified - redirect to dashboard
  return NextResponse.redirect(new URL("/dashboard", request.url));
}