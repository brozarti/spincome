import { NextAuthOptions } from "next-auth";
import GitHubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";
import { prisma } from "./prisma";
import { nanoid } from "nanoid";

export const authOptions: NextAuthOptions = {
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID ?? "",
      clientSecret: process.env.GITHUB_CLIENT_SECRET ?? "",
    }),
    ...(process.env.GOOGLE_CLIENT_ID ? [GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    })] : []),
  ],
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async signIn({ user }) {
      if (!user.email) return false;

      // Find or create Developer record
      const existing = await prisma.developer.findUnique({
        where: { email: user.email },
      });

      if (!existing) {
        const platformKey = process.env.PLATFORM_DEVELOPER_KEY;
        let referredById: string | null = null;

        if (platformKey) {
          const platform = await prisma.developer.findUnique({
            where: { developerKey: platformKey },
          });
          if (platform) referredById = platform.id;
        }

        await prisma.developer.create({
          data: {
            email: user.email,
            developerKey: `dev_${nanoid(32)}`,
            referralCode: nanoid(10),
            referredById,
            name: user.name ?? null,
            avatarUrl: user.image ?? null,
          },
        });
      } else if (user.name || user.image) {
        await prisma.developer.update({
          where: { email: user.email },
          data: {
            name: user.name ?? existing.name,
            avatarUrl: user.image ?? existing.avatarUrl,
          },
        });
      }

      return true;
    },
    async session({ session }) {
      if (session.user?.email) {
        const dev = await prisma.developer.findUnique({
          where: { email: session.user.email },
          select: { id: true, developerKey: true, referralCode: true },
        });
        if (dev) {
          (session as unknown as Record<string, unknown>).developerId = dev.id;
          (session as unknown as Record<string, unknown>).developerKey = dev.developerKey;
          (session as unknown as Record<string, unknown>).referralCode = dev.referralCode;
        }
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};
