import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { supabaseAdmin } from "@/app/lib/supabase";

// Superadmin constant
const SUPERADMIN_EMAIL = "siagapesarawan@gmail.com";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
        },
      },
    }),
  ],

  callbacks: {
    async signIn({ user, account, profile }) {
      // Allow sign in
      return true;
    },

    async jwt({ token, account, profile }) {
      if (account) {
        token.accessToken = account.access_token;
        token.id = profile?.sub;
      }
      return token;
    },

    async session({ session, token }) {
      // Add user info to session
      if (session.user) {
        session.user.email = token.email as string;
        session.user.name = token.name as string;
        session.user.image = token.picture as string;

        // Get user profile from database
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
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
