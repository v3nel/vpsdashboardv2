import "server-only";

import bcrypt from "bcryptjs";
import type { NextAuthOptions } from "next-auth";
import { getServerSession } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

import { prisma } from "@/lib/prisma";

async function verifyHcaptcha(token: string | undefined) {
  if (!process.env.HCAPTCHA_SECRET) {
    return true;
  }

  if (!token) {
    return false;
  }

  const body = new URLSearchParams({
    secret: process.env.HCAPTCHA_SECRET,
    response: token,
  });

  const response = await fetch("https://hcaptcha.com/siteverify", {
    method: "POST",
    body,
  });

  if (!response.ok) {
    return false;
  }

  const result = (await response.json()) as { success?: boolean };
  return Boolean(result.success);
}

async function bootstrapAdminIfNeeded() {
  const count = await prisma.user.count();

  if (count > 0 || !process.env.ADMIN_EMAIL || !process.env.ADMIN_PASSWORD) {
    return;
  }

  const passwordHash = await bcrypt.hash(process.env.ADMIN_PASSWORD, 12);
  await prisma.user.create({
    data: {
      email: process.env.ADMIN_EMAIL.toLowerCase(),
      passwordHash,
      name: "Admin",
    },
  });
}

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers: [
    CredentialsProvider({
      name: "Email",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        hcaptchaToken: { label: "hCaptcha", type: "text" },
      },
      async authorize(credentials) {
        await bootstrapAdminIfNeeded();

        const captchaOk = await verifyHcaptcha(credentials?.hcaptchaToken);
        if (!captchaOk) {
          return null;
        }

        const email = credentials?.email?.toLowerCase().trim();
        const password = credentials?.password;

        if (!email || !password) {
          return null;
        }

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
          return null;
        }

        const validPassword = await bcrypt.compare(password, user.passwordHash);
        if (!validPassword) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name ?? user.email,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user?.id) {
        token.sub = user.id;
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
      }

      return session;
    },
  },
};

export async function auth() {
  return getServerSession(authOptions);
}

export async function requireUser() {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error("Non authentifie");
  }

  return session.user;
}
