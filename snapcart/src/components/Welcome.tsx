"use client";

import React from 'react'
import { motion } from "motion/react"
import { ArrowRight, BikeIcon, ShoppingBasket } from 'lucide-react';

type propType = {
  nextStep: (step: number) => void;
}
 
const Welcome = ({nextStep}: propType) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center p-6" >
        <motion.div
        className='flex items-center gap-5 flex-row-reverse'  
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }} 
        >
           <h1 className='text-4xl md:text-5xl font-extrabold text-green-700'>Welcome to Snapcart</h1>
           <ShoppingBasket className='w-15 h-15 text-green-600' />
        </motion.div>

        <motion.p
        className='mt-5 text-green-700 text-lg md:text-xl max-w-2xl'
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.5 }} 
        >
        Your ultimate shopping companion! Snap a picture of your shopping list and let Snapcart do the rest. Instantly generate a categorized list, complete with estimated prices and store suggestions, making your shopping experience faster and more efficient.
        </motion.p>

        <motion.div
         initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, delay: 0.6 }} 
        className='flex items-center gap-15'
        >
         <ShoppingBasket className='w-25 h-25 text-green-400 mt-10' />
         <BikeIcon className='w-25 h-25 text-orange-500 mt-10' />
        </motion.div>

        <motion.button 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 1 }}
        onClick={()=>nextStep(2)}
        className='mt-10 px-6 py-3 bg-green-600 text-white rounded-full shadow-lg hover:bg-green-700 transition-colors duration-300 cursor-pointer'
        >
         Next
         <ArrowRight className='inline-block w-5 h-5 ml-2' />
        </motion.button>
    </div>
  )
}

export default Welcome
