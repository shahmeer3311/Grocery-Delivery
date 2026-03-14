"use client";

import axios from "axios";
import { motion } from "framer-motion"
import { ArrowRight, Bike, Leaf, User2, UserCog } from "lucide-react"
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

 
const roles = [
  { id: "admin", label: "Admin", icon: UserCog },
  { id: "user", label: "User", icon: User2 },
  { id: "deliveryBoy", label: "Delivery Boy", icon: Bike },
];

const EditUser = () => {
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [mobile,setMobile] = useState<string>("");

  const router = useRouter();
  const {update,data}=useSession();

  const handleEdit=async()=>{
    try {
      const result=await axios.post("/api/user/edit-role-mobile",{
        role: selectedRole,
        mobile: mobile
      });
      
//  NextAuth uses JWT-based sessions.
// That JWT is created at login and then cached in the browser.
// So if you update a user in the database (name, role, plan, credits, etc), the token does not magically know.
      await update?.({ user: { ...(data?.user as Record<string, any> || {}), role: selectedRole } });
       router.push("/");
    } catch (error) {
      return error;
    }
  }

  return (
    <div className="flex justify-center items-center flex-col w-full p-6 min-h-screen bg-linear-to-b from-green-50 to-white">
      <motion.h1
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-4xl md:text-5xl font-extrabold text-green-700 text-center mt-10"
      >
        Complete Your Profile
      </motion.h1>
      <p className="text-lg mt-5 text-gray-600 flex items-center justify-center gap-2 text-center">
        Please provide the missing information to continue!{" "}
        <Leaf className="w-5 h-5 text-green-600" />
      </p>

    <div className="flex flex-col md:flex-row justify-center items-center gap-6 mt-10">
        {roles.map((role) => {
          const Icon = role.icon;
          const isSelected = selectedRole === role.id;
          return (
            <motion.div
              key={role.id}
              whileTap={{scale: 0.9 }}
              className={`flex flex-col items-center justify-center w-48 h-44 rounded-2xl border-2 transition-all 
              ${
                isSelected
                  ? "border-green-7 00 bg-green-50 shadow-lg"
                  : "border-gray-300 hover:border-green-400 cursor-pointer"
              }
              `}
              onClick={() => setSelectedRole(role.id)}
            >
              <Icon className="w-10 h-10 text-green-600" />
              <span className="mt-3 font-semibold text-gray-700">
                {role.label}
              </span>
            </motion.div>
          );
        })}
    </div>

    <motion.div
    initial={{ opacity: 0, y: 50 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6, delay: 0.3 }}
    className="flex flex-col items-center mt-10"
    >
       <label htmlFor="mobile" className="text-gray-700 mb-2">Mobile Number</label>
        <input 
          type="tel"
          id="mobile"
          className="w-64 px-4 py-2 text-gray-800 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-400"
          placeholder="Enter your mobile number"
          onChange={(e)=>setMobile(e.target.value)}
        />
        
    </motion.div>

    <motion.button
    onClick={handleEdit}
    initial={{ opacity: 0, y: 50 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6, delay: 0.5 }}
    disabled={!selectedRole || mobile.length!==10}
    className={`flex items-center justify-center mt-10 px-5 py-3 rounded-full text-white font-semibold transition-colors w-50 text-center
      ${
        selectedRole && mobile.length === 10 ? "bg-green-600 hover:bg-green-700 cursor-pointer" : "bg-gray-400 cursor-not-allowed"
      }`}>
      Next
      <ArrowRight className="w-5 h-5 ml-2" />
    </motion.button>
   
    </div>
  )
}

export default EditUser
