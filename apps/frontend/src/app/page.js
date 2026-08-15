import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { jwtVerify } from "jose";

const TOKEN_COOKIE = "complaint_portal_token";

export default async function Home() {
  const cookieStore = await cookies();
  const token = cookieStore.get(TOKEN_COOKIE)?.value;

  if (!token) {
    redirect("/login");
  }

  const secret = process.env.JWT_SECRET;
  if (!secret) {
    redirect("/login");
  }

  try {
    const { payload } = await jwtVerify(token, new TextEncoder().encode(secret));
    const role = typeof payload.role === "string" ? payload.role : null;
    if (role === "ADMIN") redirect("/admin");
    if (role === "IT_STAFF") redirect("/staff/queue");
    redirect("/dashboard");
  } catch {
    redirect("/login");
  }
}
