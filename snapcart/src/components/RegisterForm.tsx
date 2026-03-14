"use client";

import { ArrowLeft, Eye, EyeOff, Leaf, Lock, LogIn, Mail, User, Loader2 } from "lucide-react";
import React, { useState } from "react";
import { motion } from "motion/react";
import Image from "next/image";
import googleImage from "@/assets/google.png";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";

type propType = {
  previousStep: (step: number) => void;
};

const RegisterForm = ({ previousStep }: propType) => {
    const [name,setName]=useState("");
    const [email,setEmail]=useState("");
    const [password,setPassword]=useState("");
    const [showPassword,setShowPassword]=useState(false);

    const router=useRouter();

    async function registerRequest(payload: { name: string; email: string; password: string }) {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Registration failed");
      }
      return res.json();
    }

    type RegisterPayload = { name: string; email: string; password: string };

    const { mutate, isPending } = useMutation<any, Error, RegisterPayload>({
      mutationFn: (payload: RegisterPayload) => registerRequest(payload),
      onSuccess(data) {
        console.log("Registration success:", data);
        router.push("/login");
      },
      onError(error) {
        console.error("Registration error:", error);
      },
    });

    const handleRegister = () => {
      mutate({ name: name.trim(), email: email.trim(), password: password.trim() });
    };

    const isPasswordValid = password.trim().length >= 6;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-6 py-10 bg-white relative">
      <div
        className="absolute top-6 left-6 flex items-center gap-3 text-green-700 
     hover:text-green-800 transition-colors  cursor-pointer"
        onClick={() => previousStep(1)}
      >
        <ArrowLeft className="size-5" />
        <span className="font-medium">Back</span>
      </div>

      <motion.h1
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-4xl md:text-5xl font-extrabold text-green-700"
      >
        Create Your Account
        <p className="text-lg mt-5 text-gray-600 flex items-center justify-center gap-2 text-center">
          Join us today and start your journey!{" "}
          <Leaf className="w-5 h-5 text-green-600" />
        </p>
      </motion.h1>

      <motion.form
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.5 }}
        className="flex flex-col gap-5 w-full max-w-sm mt-10"
        onSubmit={(e: React.FormEvent<HTMLFormElement> )=>{
          e.preventDefault();
          handleRegister();
        }}
      >

       <div className="relative">
        <User className="absolute left-3 top-1/2 -translate-y-1/2 text-green-600" />
        <input
          type="text"
          placeholder="Username"
          className="w-full pl-12 pr-4 py-2 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-green-500"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
       </div>

        <div className="relative">
        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-green-600" />
        <input
          type="email"
          placeholder="Email"
          className="w-full pl-12 pr-4 py-2 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-green-500"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
       </div>

        <div className="relative">
        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-green-600" />
        <input
          type={showPassword ? "text" : "password"}
          placeholder="Password"
          minLength={6}
          className="w-full pl-12 pr-4 py-2 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-green-500"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {
            showPassword ?
            <EyeOff
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 cursor-pointer select-none"
            onClick={()=>setShowPassword(false)}
            />
            :
            <Eye
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 cursor-pointer select-none"
            onClick={()=>setShowPassword(true)}
            />
        }

        {password.trim().length > 0 && !isPasswordValid && (
          <p className="mt-2 text-sm text-red-600">Password must be at least 6 characters.</p>
        )}
       </div>

       {/* Because JSX does not allow normal statements, only expressions.Wrap logic in a function (which is an expression) and immediately run it.An IIFE in JSX runs on every render, not once. */}

       {
       ( ()=>{
        const formValidation =
          name.trim() !== "" &&
          email.trim() !== "" &&
          password.trim() !== "" &&
          isPasswordValid;
        return (
          <button
            type="submit"
            disabled={!formValidation || isPending}
            className={`mt-5 px-6 py-3 bg-green-600 text-white rounded-full shadow-lg transition-colors duration-300 w-full ${
              formValidation && !isPending
                ? "hover:bg-green-700 cursor-pointer"
                : "opacity-50 cursor-not-allowed"
            }`}
          >
            {isPending ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="animate-spin h-4 w-4 text-white" />
                Registering...
              </span>
            ) : (
              "Register"
            )}
          </button>
        );
       })()
       }

       <div className="text-center text-gray-500 mt-4 flex items-center justify-center gap-2">
        <span className="flex-1 h-px bg-gray-200"></span>
        OR
        <span className="flex-1 h-px bg-gray-200"></span>
       </div>

       <div
        className="w-full mt-5 px-6 py-3 border border-gray-300 rounded-full shadow-lg flex items-center justify-center gap-3 hover:bg-gray-100 transition-colors duration-300"
        onClick={()=>signIn("google",{ callbackUrl: "/" })}
       >
        <Image  src={googleImage} alt="Google sign-in" width={24} height={24} />
        Continue with Google
       </div>

      </motion.form>

      <p
      onClick={()=>router.push("/login")}
      className="text-gray-600 mt-6 text-sm flex items-center gap-2 cursor-pointer"
      >Already have an account? <LogIn className="w-4 h-4" /> 
      <span className="cursor-pointer text-green-600">Sign In</span>
      </p>
    </div>
  );
};

export default RegisterForm;
