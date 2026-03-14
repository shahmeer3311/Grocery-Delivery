"use client";

import React, { use, useState } from "react";
import { motion } from "motion/react";
import Image from "next/image";
import { ArrowLeft, Eye, EyeOff, Lock, LogIn, Mail, Leaf, Loader2 } from "lucide-react";
import googleImage from "@/assets/google.png";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";


export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const session=useSession();
  console.log("Session data:", session.data); 

  const handleLogin = async () => {
    setIsLoading(true);
    setError("");
    try {
      const res = await signIn("credentials", { redirect: false, email, password });
      if (res && (res as any).error) {
        console.error("Login error:", (res as any).error);
        setError("Invalid email or password. Please try again.");
      } else if (res && res.ok) {
        // successful sign in
        router.push("/");
      }
    } catch (err) {
      console.error(err);
      setError("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-6 py-10 bg-white relative">

      <motion.h1
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-4xl md:text-5xl font-extrabold text-green-700"
      >
        Welcome Back
        <p className="text-lg mt-5 text-gray-600 flex items-center justify-center gap-2 text-center">
          Sign in to continue
          <Leaf className="w-5 h-5 text-green-600" />
        </p>
      </motion.h1>

      <motion.form
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.5 }}
        className="flex flex-col gap-5 w-full max-w-sm mt-10"
        onSubmit={(e: React.FormEvent<HTMLFormElement>) => {
          e.preventDefault();
          handleLogin();
        }}
      >
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-green-600" />
          <input
            type="email"
            placeholder="Email"
            className="w-full pl-12 pr-4 py-2 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-green-500"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isLoading}
          />
        </div>

        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-green-600" />
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            className="w-full pl-12 pr-4 py-2 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-green-500"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isLoading}
          />
          {showPassword ? (
            <EyeOff
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 cursor-pointer select-none"
              onClick={() => setShowPassword(false)}
            />
          ) : (
            <Eye
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 cursor-pointer select-none"
              onClick={() => setShowPassword(true)}
            />
          )}
        </div>

        {error && (
          <div className="text-red-600 text-sm text-center mt-2 bg-red-50 p-2 rounded-lg">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading || !email.trim() || !password.trim()}
          className={`mt-5 px-6 py-3 bg-green-600 text-white rounded-full shadow-lg transition-colors duration-300 w-full ${
            !isLoading && email.trim() && password.trim() ? "hover:bg-green-700 cursor-pointer" : "opacity-50 cursor-not-allowed"
          }`}
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 className="animate-spin h-4 w-4 text-white" />
              Signing in...
            </span>
          ) : (
            "Sign In"
          )}
        </button>

        <div className="text-center text-gray-500 mt-4 flex items-center justify-center gap-2">
          <span className="flex-1 h-px bg-gray-200"></span>
          OR
          <span className="flex-1 h-px bg-gray-200"></span>
        </div>

        <div
          onClick={(()=>signIn("google",{ callbackUrl: "/" }))}
          className="w-full mt-5 px-6 py-3 border border-gray-300 rounded-full shadow-lg flex items-center justify-center gap-3 hover:bg-gray-100 transition-colors duration-300"
        >
          <Image src={googleImage} alt="Google sign-in" width={24} height={24} />
          Continue with Google
        </div>
      </motion.form>

      <p
      onClick={()=>router.push("/register?step=2")}
      className="text-gray-600 mt-6 text-sm flex items-center gap-2 cursor-pointer">
        Want to create an account? <LogIn className="w-4 h-4" />
        <span className="cursor-pointer text-green-600">Register</span>
      </p>
    </div>
  );
}
