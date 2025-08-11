import NextAuth from "next-auth/next";
import AzureADProvider, { AzureADProfile } from "next-auth/providers/azure-ad";
import type { JWT } from "next-auth/jwt";
import { ENV } from "../../../env";

export default NextAuth({
  providers: [
    AzureADProvider({
      clientId: ENV.AZURE_AD_CLIENT_ID,
      clientSecret: ENV.AZURE_AD_CLIENT_SECRET,
      tenantId: ENV.AZURE_AD_TENANT_ID,
      authorization: {
        params: {
          scope:
            "openid profile email offline_access https://graph.microsoft.com/User.Read",
        },
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, account, profile }) {
      if (account && user) {
        token.accessToken = account.access_token;
        const azureAdId = (profile as AzureADProfile)?.oid || "";
        token.azureAdId = azureAdId;
        token.email = user.email;
      }
      return token;
    },
    async session({ session, token }: { session: any; token: JWT }) {
      if (typeof token.azureAdId === "string") {
        session.accessToken = token.accessToken;
        session.user.azureAdId = token.azureAdId;
      }
       return session;
    },
  },
});
