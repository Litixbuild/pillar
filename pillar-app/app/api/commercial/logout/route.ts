import { cookies } from "next/headers";
import { getCommercialCookieName, getCommercialDeviceCookieName, getCommercialTempCookieName } from "@/lib/commercialAuth";

export const dynamic = "force-dynamic";

export async function POST() {
  const jar = await cookies();
  jar.delete(getCommercialCookieName());
  jar.delete(getCommercialDeviceCookieName());
  jar.delete(getCommercialTempCookieName());
  return Response.json({ ok: true }, { status: 200 });
}
