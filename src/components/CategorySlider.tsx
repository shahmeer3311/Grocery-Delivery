"use client";
import { dir } from "console";
import {
  Apple,
  Carrot,
  Milk,
  Egg,
  Beef,
  Croissant,
  Coffee,
  IceCream,
  Candy,
  Leaf,
  Fish,
  ChevronLast,
  ChevronLeft,
} from "lucide-react";
import { motion } from "motion/react";
import { useRef, useState, useEffect } from "react";

export const categories = [
  {
    id: "fruits_veg",
    name: "Fruits & Vegetables",
    icon: Leaf,
    color: "text-green-600",
    bg: "bg-green-100",
  },
  {
    id: "dairy_eggs",
    name: "Dairy & Eggs",
    icon: Milk,
    color: "text-blue-600",
    bg: "bg-blue-100",
  },
  {
    id: "meat",
    name: "Meat & Poultry",
    icon: Beef,
    color: "text-red-600",
    bg: "bg-red-100",
  },
  {
    id: "seafood",
    name: "Seafood",
    icon: Fish,
    color: "text-cyan-600",
    bg: "bg-cyan-100",
  },
  {
    id: "bakery",
    name: "Bakery",
    icon: Croissant,
    color: "text-yellow-700",
    bg: "bg-yellow-100",
  },
  {
    id: "beverages",
    name: "Beverages",
    icon: Coffee,
    color: "text-amber-700",
    bg: "bg-amber-100",
  },
  {
    id: "snacks",
    name: "Snacks",
    icon: Candy,
    color: "text-pink-600",
    bg: "bg-pink-100",
  },
  {
    id: "frozen",
    name: "Frozen Foods",
    icon: IceCream,
    color: "text-indigo-600",
    bg: "bg-indigo-100",
  },
  {
    id: "organic",
    name: "Organic",
    icon: Apple,
    color: "text-lime-600",
    bg: "bg-lime-100",
  },
  {
    id: "health",
    name: "Health & Wellness",
    icon: Carrot,
    color: "text-orange-600",
    bg: "bg-orange-100",
  },
];

const CategorySlider = () => {
    const ref = useRef<HTMLDivElement>(null);
    const [showLeft, setShowLeft] = useState(false);
    const [showRight, setShowRight] = useState(false);

    const scroll = (direction: "left" | "right") => {
      if (!ref.current) return;
      const scrollAmount = direction === "left" ? -300 : 300;
      ref.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    };

    const updateButtons = () => {
      const el = ref.current;
      if (!el) return;
      const { scrollLeft, scrollWidth, clientWidth } = el;
      setShowLeft(scrollLeft > 0);
      setShowRight(scrollLeft + clientWidth < scrollWidth-5);
    };

    useEffect(()=>{
       let id=setInterval(()=>{
          if(!ref.current) return;
          const { scrollLeft, scrollWidth, clientWidth } = ref.current;
          if(scrollLeft + clientWidth >= scrollWidth-5){
            ref.current.scrollTo({left: 0, behavior: "smooth"});
          } else {
            ref.current.scrollBy({ left: 300, behavior: "smooth" });
          }
       },2000);
         return ()=>clearInterval(id);
    },[]);

    useEffect(() => {
      updateButtons();
      const handleResize = () => updateButtons();
      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
    }, []);

  return (
    <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{opacity: 1, y: 0}}
    transition={{duration: 0.6}}
    viewport={{once: false, amount: 0.5}}
    className="w-[90%] md:w-[80%] mx-auto mt-10 relative"
    >
    <h2 className="text-2xl md:text-3xl font-bold mb-4 text-green-700 text-center">🛒 Shop by Category</h2>
    {showLeft && (
    <motion.button
    initial={{ opacity: 0, x: -12 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: -12 }}
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    transition={{ duration: 0.25 }}
    aria-label="scroll left"
    className="absolute -left-10  top-[70%] -translate-y-1/2 bg-white rounded-full p-1 shadow-md hover:bg-gray-100 transition-colors size-10 flex items-center justify-center"
    onClick={()=>scroll("left")}
    >
      <ChevronLeft size={24} className="size-6 text-green-700" />
    </motion.button>
    )}
    {showRight && (
    <motion.button
    initial={{ opacity: 0, x: 12 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: 12 }}
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    transition={{ duration: 0.25 }}
    aria-label="scroll right"
    className="absolute -right-10 top-[70%] -translate-y-1/2 bg-white rounded-full p-1 shadow-md hover:bg-gray-100 transition-colors size-10 flex items-center justify-center"
    onClick={()=>scroll("right")}
    >
      <ChevronLast size={24} className="size-6 text-green-700" />
    </motion.button>
    )}
    <div 
    ref={ref}
    onScroll={updateButtons}
    className="flex gap-6 overflow-x-auto px-10 pb-4 scroll-smooth scroll-hidden">
        {categories.map((category) => {
          const Icon = category.icon;
          return (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, amount: 0.4 }}
              whileHover={{ scale: 1.06 }}
              whileTap={{ scale: 0.98 }}
              transition={{ duration: 0.35 }}
              className={`min-w-37 md:min-w-45  flex flex-col items-center justify-center gap-5 p-5 rounded-lg cursor-pointer ${category.bg} ${category.color} hover:scale-105 transition-transform`}
            >
              <Icon size={32} />
              <span className="text-sm font-medium">{category.name}</span>
            </motion.div>
          );
        })}
    </div>
    </motion.div>
  );
};

export default CategorySlider;
