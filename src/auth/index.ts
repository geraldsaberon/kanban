import crypto from "node:crypto"
import "next-auth/jwt";
import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";

declare module "next-auth/jwt" {
  interface JWT {
    id?: string
  }
}

export const {
  handlers,
  signIn,
  signOut,
  auth
} = NextAuth({
  providers: [GitHub, Google],
  callbacks: {
    jwt: async function({ token, account }) {
      if (account) {
        token.id = crypto
          .createHash("sha256")
          .update(`${account.provider}-${account.providerAccountId}`)
          .digest("base64url")
      }
      return token
    },
    session: async function({ token, session }) {
      if (token.id) {
        session.user.id = token.id
      }
      return session
    }
  }
})
