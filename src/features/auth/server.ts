import "server-only";
import { redirect } from "next/navigation";
import { getSession } from "@/server/session";

/** Auth pages are for guests: signed-in users go straight to the dashboard. */
export async function redirectIfSignedIn() {
  if (await getSession()) redirect("/dashboard");
}
