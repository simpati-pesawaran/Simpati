import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { supabaseAdmin } from "@/app/lib/supabase";

// Enable debug logging
const DEBUG = process.env.NEXTAUTH_DEBUG === 'true' || process.env.NODE_ENV === 'development';
if (DEBUG) {
  console.log('🔍 [NEXTAUTH DEBUG] NextAuth initializing...');
  console.log('🔍 [NEXTAUTH DEBUG] GOOGLE_CLIENT_ID:', process.env.GOOGLE_CLIENT_ID ? 'SET' : 'NOT SET');
  console.log('🔍 [NEXTAUTH DEBUG] GOOGLE_CLIENT_SECRET:', process.env.GOOGLE_CLIENT_SECRET ? 'SET' : 'NOT SET');
  console.log('🔍 [NEXTAUTH DEBUG] NEXTAUTH_SECRET:', process.env.NEXTAUTH_SECRET ? 'SET' : 'NOT SET');
  console.log('🔍 [NEXTAUTH DEBUG] NEXTAUTH_URL:', process.env.NEXTAUTH_URL || 'NOT SET');
}

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
      console.log('=== [CALLBACK] signIn ===');
      console.log('user.email:', user?.email);
      console.log('user.name:', user?.name);
      console.log('account.provider:', account?.provider);
      console.log('account.access_token:', account?.access_token ? 'EXISTS' : 'NULL');
      console.log('profile:', profile);

      // Superadmin auto-approve: Create profile if not exists
      if (user.email?.toLowerCase() === SUPERADMIN_EMAIL.toLowerCase()) {
        console.log('SUPERADMIN DETECTED:', user.email);
        try {
          // Check if profile exists
          const { data: existingProfile } = await supabaseAdmin
            .from('profiles')
            .select('id, status')
            .eq('email', user.email)
            .single();

          console.log('existingProfile:', existingProfile);

          if (!existingProfile) {
            console.log('Creating NEW superadmin profile...');
            // Create superadmin profile with approved status
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
              console.log('Superadmin profile CREATED');
            }
          } else if (existingProfile.status !== 'approved') {
            console.log('Re-approving superadmin...');
            // Re-approve if rejected
            await supabaseAdmin
              .from('profiles')
              .update({
                status: 'approved',
                approved_at: new Date().toISOString(),
                approved_by: user.email,
                rejected_by: null,
                rejected_at: null,
                rejection_reason: null,
              })
              .eq('email', user.email);
          } else {
            console.log('Superadmin already approved');
          }
        } catch (error) {
          console.error("Error in superadmin signIn:", error);
        }
      }

      console.log('signIn returning: true');
      return true;
    },

    async jwt({ token, account, profile }) {
      console.log("=== [CALLBACK] jwt ===");

      if (account && profile) {
        token.accessToken = account.access_token;
        token.id = profile.sub;

        token.email = profile.email;
        token.name = profile.name;
        token.picture = profile.picture;
      }

      console.log("token after:", token);

      return token;
    },

    async session({ session, token }) {
      console.log("SESSION CALLBACK");
      console.log("token =", token);
      console.log("session =", session);
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
