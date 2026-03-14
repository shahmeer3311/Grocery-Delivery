"use client";
import { Boxes, ClipboardCheck, LogOut, Menu, Package, PlusIcon, Search, SearchIcon, ShoppingCart, User, X } from 'lucide-react';
import mongoose from 'mongoose';
import { AnimatePresence, motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import React, { useEffect, useRef } from 'react'
import { signOut } from 'next-auth/react';
import { div, nav } from 'framer-motion/m';
import { createPortal } from 'react-dom';
import { useQuery } from "@tanstack/react-query";
import { fetchCart } from "@/api/cart";
import type { CartResponse } from "@/api/types";
import { useRouter } from 'next/navigation';

interface User {
  _id?: mongoose.Types.ObjectId;
  name: string;
  email: string;
  password?: string;
  mobile?: string;
  role: "user" | "deliveryboy" | "admin";
  comparePassword(candidatePassword: string): Promise<boolean>;
  images?: string;
}

const Nav = ({user}: {user: User}) => {
    console.log("Nav User:", user);
    const [open, setOpen] = React.useState(false);
    const menuRef = useRef<HTMLDivElement | null>(null);
    const [searchBarOpen, setSearchBarOpen] = React.useState(false);
    const [menuOpen, setMenuOpen] = React.useState(false);
    const [searchQuery, setSearchQuery] = React.useState(""); 

    const router=useRouter();

    useEffect(() => {
      const handleClickOutside = (e: MouseEvent | TouchEvent) => {
        const target = e.target as Node | null;
        if (menuRef.current && target && !menuRef.current.contains(target)) {
          setOpen(false);
        }
      };

      const handleKey = (e: KeyboardEvent) => {
        if (e.key === 'Escape') setOpen(false);
      };

      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
      document.addEventListener('keydown', handleKey);

      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
        document.removeEventListener('touchstart', handleClickOutside);
        document.removeEventListener('keydown', handleKey);
      };
    }, []);

    const SideBar=menuOpen ? createPortal(
      <AnimatePresence>
        <motion.div
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: -100, opacity: 0 }}
        transition={{ type: "spring"}}
        className="fixed top-0 left-0 w-64 h-full  text-white shadow-lg z-50 p-6 flex flex-col gap-6"
        style={{backgroundColor: "green"}}
        onClick={()=>setMenuOpen(false)}
        >
          <div className="flex items-center gap-3 mb-4">
            {user.images ? (
              <Image src={user.images} alt="User Image" width={64} height={64} className="rounded-full object-cover" />
            ) : (
              <User className='w-14 h-14 text-white/90' />
            )}
            <div>
              <h1 className="text-lg font-bold">Admin Panel</h1>
              <p className="font-semibold">{user.name}</p>
              <p className="text-sm opacity-90 capitalize">{user.role}</p>
            </div>
          </div>

          <nav className="flex flex-col gap-3 mt-2">
            <Link href={"/admin/add-grocery"} className='flex items-center gap-3 py-2 rounded-full bg-white/10 transition hover:bg-white/20'>
              <PlusIcon className='w-5 h-5 ml-2' />
              <span>Add Groceries</span>
            </Link>
            <Link href={""} className='flex items-center gap-3 px-3 py-2 rounded-full bg-white/10 transition hover:bg-white/20'>
              <Boxes className='w-5 h-5 ml-2' />
              <span>View Groceries</span>
            </Link>
            <Link href={""} className='flex items-center gap-3 px-3 py-2 rounded-full bg-white/10 transition hover:bg-white/20'>
              <ClipboardCheck className='w-5 h-5 ml-2' />
              <span>Manage Groceries</span>
            </Link>
          </nav>
         </motion.div>
      </AnimatePresence>,document.body
    ) : null;

    const handleSearch = (e: React.FormEvent) => {
      e.preventDefault();
      if(searchQuery.trim() !== "") {
        router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
        setSearchQuery("");
      }
      
    }

  return (
    <div className="fixed top-4 left-0 right-0 px-4 z-50">
      <nav className="max-w-7xl mx-auto bg-linear-to-r from-green-500 to-green-700 rounded-2xl shadow-lg shadow-black/30 flex items-center justify-between px-6 py-3 text-white h-20">
        <Link href={'/'} className='text-white font-extrabold text-2xl sm:text-3xl tracking-wide hover:scale-105 transition-transform italic'>
          Snapcart
        </Link>

        {user.role === "user" && (
           <form aria-label="Search" className='hidden md:flex items-center bg-white/10 backdrop-blur-md rounded-full px-4 py-2 gap-4 w-1/2 justify-between hover:scale-105 transition-transform'
           onSubmit={handleSearch}
           >
          <SearchIcon className='w-5 h-5 text-white/90' />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder='Search for products, brands and more'
            className='bg-transparent placeholder-gray-100 text-white focus:outline-none w-full'
          />
        </form>
        )}

        <div className='flex items-center gap-3 md:gap-6 relative'>
            {user.role === "user" && (function CartCount() {
              const { data } = useQuery<CartResponse>({
                queryKey: ["cart"],
                queryFn: fetchCart,
              });
              const cart = data?.cart || [];
              const count = cart.filter((i: any) => (i.quantity || 0) > 0).length;
              return (
                <>
                  <div 
             onClick={()=>setSearchBarOpen(prev=>!prev)}
             className='bg-white rounded-full w-11 h-11 flex items-center justify-center shadow-md hover:scale-105 md:hidden'>
            <SearchIcon className='w-5 h-5 text-gray-800' />
        </div>
          <Link href={'/user/cart'} className='relative inline-flex items-center'>
            <ShoppingCart className='w-6 h-6 md:w-7 md:h-7 hover:scale-110 transition-transform cursor-pointer' />
            <span className='absolute -top-2 -right-3 bg-red-500 rounded-full px-1.5 text-xs font-semibold leading-none text-white'>
              {count}
            </span>
          </Link>
                </>
              );
            })()}

            {
              user.role === "admin" && (
                <>
                <div className="hidden md:flex items-center gap-4 backdrop-blur-md rounded-full px-4 py-2">
                  <Link href={"/admin/add-grocery"}
                  className='flex items-center gap-2 bg-white text-green-700 font-medium px-4 py-2 rounded-full hover:bg-green-100 transition-all'
                  > <PlusIcon className='w-5 h-5 ' /> Add Groceries</Link>
                  <Link
                  className='flex items-center gap-2 bg-white text-green-700 font-medium px-4 py-2 rounded-full hover:bg-green-100 transition-all'
                  href={"/admin/view-grocery"}><Boxes className='w-5 h-5'/> View Groceries</Link>
                  <Link
                  className='flex items-center gap-2 bg-white text-green-700 font-medium px-4 py-2 rounded-full hover:bg-green-100 transition-all'
                  href={"/admin/manage-orders"}><ClipboardCheck className='w-5 h-5'/> Manage Groceries</Link>
                </div>
                <div className='md:hidden bg-white rounded-full size-9 flex items-center justify-center shadow-md px-4 py-2'>
                  <Menu className='w-6 h-6 md:w-7 md:h-7 hover:scale-110 text-green-700 transition-transform cursor-pointer md:hidden' onClick={()=>setMenuOpen(prev=>!prev)} />
                </div>
                </>
              )
            }

          <div className='relative' ref={menuRef}>
            <div onClick={() => setOpen(prev => !prev)} className='flex items-center cursor-pointer'>
              {user.images ? (
                <Image src={user.images} alt="User Image" width={40} height={40} className="rounded-full object-cover" />
              ) : (
                <User className='w-8 h-8 md:w-9 md:h-9 hover:scale-110 transition-transform' />
              )}
            </div>

            <AnimatePresence>
              {open && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -10 }}
                  transition={{ duration: 0.18 }}
                  className='absolute top-14 right-0 bg-white rounded-lg shadow-lg w-56 py-2 text-gray-800 flex flex-col z-50'
                >
                  <div className='flex items-center gap-3 px-4 py-3 '>
                    {user.images ? (
                      <Image src={user.images} alt='User' width={48} height={48} className='rounded-full object-cover' />
                    ) : (
                      <User className='w-8 h-8 text-gray-600' />
                    )}
                    <div className='flex flex-col'>
                      <span className='font-semibold text-gray-800'>{user.name}</span>
                      <span className='text-sm text-gray-500 capitalize'>{user.role}</span>
                    </div>
                  </div>

                 {user.role === "user" && (
                   <Link href={"/user/my-order"} onClick={() => setOpen(false)} className='flex items-center gap-3 px-4 py-2 hover:bg-gray-50'>
                    <Package className='w-5 h-5 text-green-600' />
                    <span className='text-sm text-gray-700'>My Orders</span>
                  </Link> 
                 )}

                  <button
                  className='flex items-center gap-3 px-4 py-2 hover:bg-gray-50 text-red-600' 
                  onClick={() => { 
                    setOpen(false);
                    signOut({callbackUrl: "/login"});
                   }}>
                    <LogOut className='w-5 h-5' />
                    <span className='text-sm'>Logout</span>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* search overlay removed from here and rendered after nav for better placement */}
          </div>
        </div>
        <AnimatePresence>
          {searchBarOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className='md:hidden absolute left-0 right-0 top-full mt-3 px-4 z-40'
              onClick={() => setSearchBarOpen(false)}
            >
              <div className='max-w-lg mx-auto'>
                <div className='bg-white rounded-full shadow-lg flex items-center px-4 py-2' onClick={(e) => e.stopPropagation()}>
                  <Search className='w-5 h-5 text-gray-600 mr-3' />
                  <input
                    autoFocus
                    type='search'
                    placeholder='Search for products, brands and more'
                    className='flex-1 bg-transparent outline-none text-gray-800'
                  />
                  <button className='p-2 rounded-full hover:bg-gray-100' onClick={() => setSearchBarOpen(false)}>
                    <X className='w-4 h-4 text-gray-600' />
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
        {SideBar}
    </div>
  )
}

export default Nav
