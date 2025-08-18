import NextAuth from "next-auth/next";
import AzureADProvider, { AzureADProfile } from "next-auth/providers/azure-ad";
import type { JWT } from "next-auth/jwt";
import type { Session } from "next-auth";
import { ENV } from "../../../env";

export default NextAuth({
  providers: [
    AzureADProvider({
      clientId: ENV.AZURE_AD_CLIENT_ID,
      clientSecret: ENV.AZURE_AD_CLIENT_SECRET,
      tenantId: ENV.AZURE_AD_TENANT_ID,
      authorization: {
        params: {
          scope: "openid profile email",
        },
      },
    }),
  ],
  secret: ENV.NEXTAUTH_SECRET,
  debug: false,
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 1 day
  },
  callbacks: {
    async jwt({ token, user, account, profile }) {
      if (account && user) {
        const azureAdId = (profile as AzureADProfile)?.oid || "";
        token.azureAdId = azureAdId;
        token.email = user.email;
      }
      return token;
    },
    async session({ session, token }: { session: Session; token: JWT }) {
      if (typeof token.azureAdId === "string") {
        session.user.azureAdId = token.azureAdId;
      }
       return session;
    },
  },
});
