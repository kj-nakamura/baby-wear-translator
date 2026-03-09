import NextAuth from 'next-auth';
import { authOptions } from '@/auth';

const handler = NextAuth(authOptions);

// NextAuth.js の認証ルートをそのまま公開します。
export { handler as GET, handler as POST };
