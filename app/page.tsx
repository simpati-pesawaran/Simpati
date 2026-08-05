import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "./api/auth/[...nextauth]/route";

export default async function HomePage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  // Check profile status
  const email = session.user?.email?.toLowerCase();
  const profile = (session.user as any)?.profile;

  // Superadmin always goes to dashboard
  if (email === "siagapesawaran@gmail.com") {
    redirect("/dashboard");
  }

  // Check profile status
  if (profile) {
    if (profile.status === "approved") {
      redirect("/dashboard");
    } else if (profile.status === "pending") {
      redirect("/login/pending");
    } else if (profile.status === "rejected") {
      redirect("/login/rejected");
    }
  }

  // Default redirect
  redirect("/dashboard");
}
