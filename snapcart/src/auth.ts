// auth.ts
import NextAuth, { Account, Session, User as NextAuthUser } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { JWT } from "next-auth/jwt";
import { connectDB } from "./lib/db";
import UserModel from "./models/user.model";
import bcrypt from "bcryptjs";
import type { NextAuthConfig } from "next-auth";

/**
 * Interfaces for strongly typed user, token, and session
 */
interface AuthUser extends NextAuthUser {
  id: string;
  role: string;
  image?: string;
  images?: string;
}

interface AuthToken extends JWT {
  id?: string;
  role?: string;
  name?: string;
  email?: string;
  image?: string;
}

interface AuthSession extends Session {
  user: AuthUser;
}

/**
 * Helper function to create or return an existing user
 */
async function findOrCreateUser(user: AuthUser) {
  await connectDB();

  const existingUser = await UserModel.findOne({ email: user.email });
  if (existingUser) {
    user.id = existingUser._id.toString();
    user.role = existingUser.role;
    user.image = existingUser.images || user.image;
    return user;
  }

  const newUser = new UserModel({
    name: user.name,
    email: user.email,
    images: user.image,
  });

  await newUser.save();
  user.id = newUser._id.toString();
  user.role = newUser.role;
  user.image = newUser.images || user.image;

  return user;
}

/**
 * NextAuth configuration
 */
const authOptions: NextAuthConfig = {
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const { email, password } = (credentials || {}) as { email?: string; password?: string };

        if (!email || !password) return null;

        await connectDB();
        const userDoc = await UserModel.findOne({ email });
        if (!userDoc) return null;

        const hashedPassword = userDoc.password;
        if (!hashedPassword) return null;

        const isPasswordValid = await bcrypt.compare(password, hashedPassword);
        if (!isPasswordValid) return null;

        return {
          id: userDoc._id.toString(),
          name: userDoc.name,
          email: userDoc.email,
          role: userDoc.role,
        } as AuthUser;
      },
    }),
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],

  callbacks: {
    async signIn({ user, account }) {
      const authUser = user as AuthUser;

      if (account?.provider === "google") {
        if (!authUser.email) return false;
        await findOrCreateUser(authUser);
      }
      return true;
    },

    async jwt({ token, user, trigger, session }) {
      const authToken = token as AuthToken;
      const authUser = user as AuthUser | undefined;
      const authSession = session as AuthSession | undefined;

      if (authUser) {
        authToken.id = authUser.id;
        authToken.role = authUser.role;
        authToken.name = authUser.name;
        authToken.email = authUser.email;
        authToken.image = authUser.image || authUser.images;
      }

      if (trigger === "update") {
        authToken.role = authSession?.user.role || authToken.role;
      }
      return authToken;
    },

    async session({ session, token }) {
      const authSession = session as AuthSession;
      const authToken = token as AuthToken;

      authSession.user.id = authToken.id!;
      authSession.user.name = authToken.name!;
      authSession.user.email = authToken.email!;
      authSession.user.role = authToken.role!;
      authSession.user.image = authToken.image;
      return authSession;
    },
  },

  pages: {
    signIn: "/login",
    error: "/login",
  },

  session: {
    strategy: "jwt",
    maxAge: 10 * 24 * 60 * 60, // 10 days
  },

  secret: process.env.AUTH_SECRET,
};

/**
 * Export NextAuth handlers
 */
const { handlers, auth, signIn, signOut } = NextAuth(authOptions);
export { handlers, auth, signIn, signOut, authOptions };