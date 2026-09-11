import { NextResponse } from "next/server";

import { deleteCurrentSession } from "@/lib/session";

export async function POST() {
  try {
    await deleteCurrentSession();

    return NextResponse.json({
      success: true,
      message: "Logout successful.",
    });
  } catch (error) {
    console.error(
      "POST /api/auth/logout error:",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        error: "LOGOUT_FAILED",
        message: "Unable to sign out.",
      },
      { status: 500 },
    );
  }
}