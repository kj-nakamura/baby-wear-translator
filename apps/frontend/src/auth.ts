import type { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';

// NextAuth の認証設定を定義し、Google Calendar 読み取り権限も要求します。
export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.AUTH_GOOGLE_ID ?? '',
      clientSecret: process.env.AUTH_GOOGLE_SECRET ?? '',
      authorization: {
        params: {
          prompt: 'select_account',
          scope: 'openid email profile https://www.googleapis.com/auth/calendar.readonly',
        },
      },
    }),
  ],
  pages: {
    signIn: '/work',
    error: '/work/error',
  },
  callbacks: {
    // Google から受け取った access token を JWT に保持します。
    async jwt({ token, account }) {
      if (account?.access_token) {
        token.accessToken = account.access_token;
      }

      return token;
    },
    // クライアントから参照する最小限のセッション情報を組み立てます。
    async session({ session, token }) {
      session.accessToken = typeof token.accessToken === 'string' ? token.accessToken : undefined;
      return session;
    },
  },
};
