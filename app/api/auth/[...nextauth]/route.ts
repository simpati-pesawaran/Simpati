import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { supabaseAdmin } from "@/app/lib/supabase";

// Superadmin constant
const SUPERADMIN_EMAIL = "siagapesasakan@gmail.com";

/**
 * Log activity helper for auth events
 */
async function logAuthActivity(
  userId: string,
  userName: string,
  userEmail: string,
  action: string,
  description: string,
  entityId: string = userId
) {
  const { error } = await supabaseAdmin.from("activity_logs").insert({
    user_id: userId,
    user_name: userName,
    user_email: userEmail,
    action: action,
    entity_type: "auth",
    entity_id: entityId,
    description: description,
  });

  if (error) {
    console.error("Error logging auth activity:", error);
  }

  return !error;
}

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: "select_account",
          access_type: "offline",
          response_type: "code",
        },
      },
    }),
  ],

  callbacks: {
    async signIn({ user, account, profile }) {
      try {
        // Superadmin auto-approve
        if (user.email?.toLowerCase() === SUPERADMIN_EMAIL.toLowerCase()) {
          const { data: existingProfile } = await supabaseAdmin
            .from('profiles')
            .select('id, status')
            .eq('email', user.email)
            .single();

          if (!existingProfile) {
            await supabaseAdmin
              .from('profiles')
              .insert({
                email: user.email,
                name: user.name || 'Superadmin',
                division: 'IT Administration',
                role: 'superadmin',
                status: 'approved',
                approved_at: new Date().toISOString(),
                approved_by: user.email,
              });
          } else {
            // Log login for superadmin
            await logAuthActivity(
              existingProfile.id,
              user.name || 'Superadmin',
              user.email,
              "login",
              `Login ke sistem sebagai Superadmin`
            );
          }
        } else {
          // Log login for regular users
          const { data: existingProfile } = await supabaseAdmin
            .from('profiles')
            .select('id, name, email')
            .eq('email', user.email)
            .single();

          if (existingProfile) {
            await logAuthActivity(
              existingProfile.id,
              existingProfile.name || user.name || 'Unknown',
              existingProfile.email,
              "login",
              `Login ke sistem`
            );
          }
        }
        return true;
      } catch (error) {
        console.error("Error in signIn:", error);
        return false;
      }
    },

    async jwt({ token, account, profile }) {
      if (account && profile) {
        token.accessToken = account.access_token;
        token.id = profile.sub;
        token.email = profile.email;
        token.name = profile.name;
        token.picture = profile.picture;
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.email = token.email as string;
        session.user.name = token.name as string;
        session.user.image = token.picture as string;

        try {
          const { data: profile } = await supabaseAdmin
            .from('profiles')
            .select('id, name, division, role, status, rejection_reason')
            .eq('email', token.email as string)
            .single();

          if (profile) {
            (session.user as any).profile = profile;
            (session.user as any).userId = profile.id;
            (session.user as any).role = profile.role;
            (session.user as any).status = profile.status;
          }
        } catch (error) {
          console.error("Error fetching profile:", error);
        }
      }
      return session;
    },
  },

  pages: {
    signIn: "/login",
    error: "/login",
  },

  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },

  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
