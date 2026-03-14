"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowLeft, Plus, X } from "lucide-react";

const categories = [
  "Fruits",
  "Vegetables",
  "Dairy",
  "Meat",
  "Bakery",
  "Beverages",
];
const units = ["kg", "g", "liter", "ml", "piece"];

export default function AddGrocery() {
  const [name, setName] = useState("");
  const [category, setCategory] = useState(categories[0]);
  const [unit, setUnit] = useState(units[0]);
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const field = {
    hidden: { opacity: 0, y: 8 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.18 } },
  };

  useEffect(() => {
    if (!image) return;
    const url = URL.createObjectURL(image);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [image]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    setLoading(true);

    if (!name.trim() || !description.trim() || !price || !stock) {
      setMessage("Please fill all required fields");
      setLoading(false);
      return;
    }

    try {
      const form = new FormData();
      form.append("name", name);
      form.append("category", category);
      form.append("unit", unit);
      form.append("price", String(price));
      form.append("stock", String(stock));
      form.append("description", description);
      if (image) form.append("image", image);

      const res = await fetch("/api/admin/add-grocery", {
        method: "POST",
        body: form,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "Failed to save");

      setMessage("Grocery added successfully");
      setName("");
      setCategory(categories[0]);
      setUnit(units[0]);
      setPrice("");
      setStock("");
      setDescription("");
      setImage(null);
      setPreview(null);
    } catch (err: any) {
      setMessage(err?.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-green-50 px-6 py-5">
      <Link
        href="/"
        className="flex items-center gap-2 text-green-700 mb-4 bg-white w-fit p-3 rounded-full"
      >
        <ArrowLeft className="w-5 h-5" />
        <span className="hidden md:block">Back to Home</span>
      </Link>

      <div className="flex justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-3xl bg-white rounded-2xl shadow-lg p-8"
        >
          <div className="text-center mb-4">
            <div className="inline-flex items-center justify-center p-2 bg-white rounded-full mb-4 shadow-sm border border-gray-100">
              <Plus className="text-green-600 w-8 h-8" />
            </div>
            <h2 className="text-3xl font-extrabold">Add Grocery</h2>
            <p className="text-gray-500 text-sm max-w-lg mx-auto">
              Create a new grocery item — add details, pricing and an attractive
              image so customers can discover it easily.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <motion.input
              variants={field}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Grocery name"
              className="w-full mt-1 px-4 py-3 border border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-green-100 focus:outline-none text-gray-800"
            />
            <motion.textarea
              variants={field}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              placeholder="Description"
              className="w-full mt-1 px-4 py-3 border border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-green-100 focus:outline-none text-gray-700"
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-green-100"
              >
                {categories.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>

              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-green-100"
              >
                {units.map((u) => (
                  <option key={u}>{u}</option>
                ))}
              </select>

              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="Price"
                className="w-full mt-1 px-4 py-3 border border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-green-100"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="number"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                placeholder="Stock"
                className="w-full mt-1 px-4 py-3 border border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-green-100"
              />

              <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                <div className="flex items-center justify-center border-2 border-dashed border-gray-200 rounded-xl p-6 bg-gray-50">
                  <label className="flex flex-col items-center cursor-pointer">
                    <span className="text-sm font-medium text-gray-700">Upload Image</span>
                    <span className="text-xs text-gray-400 mt-2">PNG, JPG — max 5MB</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setImage(e.target.files?.[0] || null)}
                      className="hidden"
                    />
                    <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-white border rounded-md shadow-sm">
                      <Plus className="w-4 h-4 text-green-600" />
                      <span className="text-sm text-green-600">Choose file</span>
                    </div>
                  </label>
                </div>

                <div className="relative flex items-center justify-center bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
                  {preview ? (
                    <>
                      <button
                        type="button"
                        onClick={() => {
                          setPreview(null);
                          setImage(null);
                        }}
                        className="absolute top-3 right-3 bg-white rounded-full p-1 shadow"
                      >
                        <X className="w-4 h-4 text-gray-600" />
                      </button>
                      <img src={preview} alt="preview" className="max-h-52 object-contain rounded-md" />
                    </>
                  ) : (
                    <div className="text-center text-gray-400">No image selected</div>
                  )}
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition disabled:opacity-60 flex items-center justify-center gap-3"
            >
              {loading ? (
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                </svg>
              ) : null}
              <span>{loading ? "Saving..." : "Add Grocery"}</span>
            </button>
            {message && (
              <p className={`text-center text-sm ${
                message.toLowerCase().includes("success") ? "text-green-600" : "text-red-600"
              }`}>{message}</p>
            )}
          </form>
        </motion.div>
      </div>
    </div>
  );
}
