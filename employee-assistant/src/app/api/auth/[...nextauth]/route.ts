import NextAuth from "next-auth";
import OktaProvider from "next-auth/providers/okta";

// Validate required environment variables
const requiredEnvVars = {
  OKTA_CLIENT_ID: process.env.OKTA_CLIENT_ID,
  OKTA_CLIENT_SECRET: process.env.OKTA_CLIENT_SECRET,
  OKTA_ISSUER: process.env.OKTA_ISSUER,
  NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
  NEXTAUTH_URL: process.env.NEXTAUTH_URL,
};

// Check for missing environment variables
const missingVars = Object.entries(requiredEnvVars)
  .filter(([_, value]) => !value)
  .map(([key]) => key);

if (missingVars.length > 0) {
  throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
}

export const authOptions = {
  providers: [
    OktaProvider({
      clientId: requiredEnvVars.OKTA_CLIENT_ID!,
      clientSecret: requiredEnvVars.OKTA_CLIENT_SECRET!,
      issuer: requiredEnvVars.OKTA_ISSUER,
      authorization: {
        params: {
          scope: "openid profile email",
        },
      },
    }),
  ],
  callbacks: {
    async jwt({ token, account, profile }: any) {
      // Persist the OAuth access_token and or the user id to the token right after signin
      if (account) {
        token.accessToken = account.access_token;
        token.idToken = account.id_token;
      }
      if (profile) {
        token.profile = profile;
      }
      return token;
    },
    async session({ session, token }: any) {
      // Send properties to the client, like an access_token and user id from a provider.
      session.accessToken = token.accessToken;
      session.idToken = token.idToken;
      session.user = {
        ...session.user,
        id: token.sub,
        name: token.name || token.profile?.name,
        email: token.email || token.profile?.email,
      };
      return session;
    },
  },
  pages: {
    signIn: "/",
    signOut: "/",
    error: "/",
  },
  session: {
    strategy: "jwt" as const,
  },
  // Additional security settings
  secret: requiredEnvVars.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST }; 