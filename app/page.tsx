import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "./api/auth/[...nextauth]/route";

// ============================================
// LOGGING - Root Page Execution
// ============================================
console.log('=== [ROOT PAGE] app/page.tsx EXECUTED ===');
console.log('getServerSession called...');

export default async function HomePage() {
  const session = await getServerSession(authOptions);

  console.log('=== [ROOT PAGE] session result ===');
  console.log('session:', JSON.stringify(session));
  console.log('session exists:', session ? 'YES' : 'NO');
  console.log('session.user:', session?.user ? 'EXISTS' : 'NULL');

  if (!session) {
    console.log('ROOT PAGE: session is NULL');
    console.log('ROOT PAGE: Redirect -> /login (no session)');
    redirect("/login");
  }

  // Check profile status
  const email = session.user?.email?.toLowerCase();
  const profile = (session.user as any)?.profile;

  console.log('ROOT PAGE: email:', email);
  console.log('ROOT PAGE: profile:', JSON.stringify(profile));

  // Superadmin always goes to dashboard
  if (email === "siagapesasakan@gmail.com") {
    console.log('ROOT PAGE: Superadmin detected');
    console.log('ROOT PAGE: Redirect -> /dashboard (superadmin)');
    redirect("/dashboard");
  }

  // Check profile status
  if (profile) {
    console.log('ROOT PAGE: Profile exists with status:', profile.status);
    if (profile.status === "approved") {
      console.log('ROOT PAGE: Redirect -> /dashboard (approved)');
      redirect("/dashboard");
    } else if (profile.status === "pending") {
      console.log('ROOT PAGE: Redirect -> /login/pending (pending)');
      redirect("/login/pending");
    } else if (profile.status === "rejected") {
      console.log('ROOT PAGE: Redirect -> /login/rejected (rejected)');
      redirect("/login/rejected");
    }
  }

  // Default redirect
  console.log('ROOT PAGE: No conditions matched, Redirect -> /dashboard (default)');
  redirect("/dashboard");
}
