import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { supabaseAdmin } from "@/app/lib/supabase";

// Superadmin constant
const SUPERADMIN_EMAIL = "siagapesasakan@gmail.com";

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
        console.log("=== signIn callback ===");
        console.log("user:", user);
        console.log("account:", account);
        console.log("profile:", profile);

        // Superadmin auto-approve: Create profile if not exists
        if (user.email?.toLowerCase() === SUPERADMIN_EMAIL.toLowerCase()) {
          console.log("SUPERADMIN DETECTED:", user.email);
          const { data: existingProfile } = await supabaseAdmin
            .from('profiles')
            .select('id, status')
            .eq('email', user.email)
            .single();

          console.log("existingProfile:", existingProfile);

          if (!existingProfile) {
            const { error: insertError } = await supabaseAdmin
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

            if (insertError) {
              console.error("Error creating superadmin profile:", insertError);
            } else {
              console.log("Superadmin profile CREATED");
            }
          }
        }

        console.log("signIn returning: true");
        return true;
      } catch (error) {
        console.error("OAUTH CALLBACK ERROR signIn:", error);
        console.error((error as Error).stack);
        return false;
      }
    },

    async jwt({ token, account, profile }) {
      try {
        console.log("=== jwt callback ===");
        console.log("account:", account);
        console.log("profile:", profile);
        console.log("token before:", token);

        if (account && profile) {
          token.accessToken = account.access_token;
          token.id = profile.sub;
          token.email = profile.email;
          token.name = profile.name;
          token.picture = profile.picture;
        }

        console.log("token after:", token);
        return token;
      } catch (error) {
        console.error("OAUTH CALLBACK ERROR jwt:", error);
        console.error((error as Error).stack);
        return token;
      }
    },

    async session({ session, token }) {
      try {
        console.log("=== session callback ===");
        console.log("token:", token);
        console.log("session:", session);
        console.log("NEXTAUTH_URL:", process.env.NEXTAUTH_URL);
        console.log("NEXTAUTH_SECRET exists:", !!process.env.NEXTAUTH_SECRET);

        if (session.user) {
          session.user.email = token.email as string;
          session.user.name = token.name as string;
          session.user.image = token.picture as string;

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
        }

        return session;
      } catch (error) {
        console.error("OAUTH CALLBACK ERROR session:", error);
        console.error((error as Error).stack);
        return session;
      }
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
