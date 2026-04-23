import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getManagerCookieName } from "@/lib/managerAuth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST() {
  const jar = await cookies();
  jar.set({
    name: getManagerCookieName(),
    value: "",
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });

  return NextResponse.redirect(new URL("/manager/login", process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"), {
    status: 303,
  });
}
