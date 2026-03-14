"use client";
import React from "react";
import { useRouter } from "next/navigation";

type Grocery = {
  _id: string;
  name: string;
  category: string;
  price: number;
  unit: string;
  description: string;
  stock: number;
  imageUrl: string;
};

const ViewGrocery = () => {
  const router = useRouter();

  const [groceries, setGroceries] = React.useState<Grocery[]>([]);
  const [loading, setLoading] = React.useState<boolean>(false);
  const [error, setError] = React.useState<string | null>(null);

  const [isEditOpen, setIsEditOpen] = React.useState<boolean>(false);
  const [selectedGrocery, setSelectedGrocery] = React.useState<Grocery | null>(
    null
  );

  // Form state for editing
  const [name, setName] = React.useState("");
  const [category, setCategory] = React.useState("");
  const [price, setPrice] = React.useState<string>("0");
  const [unit, setUnit] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [stock, setStock] = React.useState<string>("0");

  // Image state: one for backend (File) and one for frontend (preview URL)
  const [imageFile, setImageFile] = React.useState<File | null>(null);
  const [imagePreview, setImagePreview] = React.useState<string | null>(null);

  const [search, setSearch] = React.useState<string>("");

  const openEdit = (grocery: Grocery) => {
    setSelectedGrocery(grocery);
    setName(grocery.name);
    setCategory(grocery.category);
    setPrice(grocery.price.toString());
    setUnit(grocery.unit);
    setDescription(grocery.description);
    setStock(grocery.stock.toString());
    setImageFile(null);
    setImagePreview(grocery.imageUrl || null);
    setIsEditOpen(true);
  };

  const closeEdit = () => {
    setIsEditOpen(false);
    setSelectedGrocery(null);
    setImageFile(null);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    const url = URL.createObjectURL(file);
    setImagePreview(url);
  };

  const getGroceries = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/admin/get-groceries");
      if (!res.ok) {
        throw new Error("Failed to fetch groceries");
      }
      const data: Grocery[] = await res.json();
      setGroceries(data);
    } catch (err: any) {
      console.error("Failed to fetch groceries", err);
      setError(err.message || "Failed to fetch groceries");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGrocery) return;

    try {
      setLoading(true);
      setError(null);

      const formData = new FormData();
      formData.append("id", selectedGrocery._id);
      formData.append("name", name);
      formData.append("category", category);
      formData.append("price", price);
      formData.append("unit", unit);
      formData.append("description", description);
      formData.append("stock", stock);
      if (imageFile) {
        formData.append("image", imageFile);
      }

      const res = await fetch("/api/admin/edit-grocery", {
        method: "POST",
        body: formData,
      });

      const result = await res.json();
      if (!res.ok) {
        throw new Error(result.message || "Failed to update grocery");
      }

      const updated: Grocery = result.grocery;
      setGroceries((prev) =>
        prev.map((g) => (g._id === updated._id ? updated : g))
      );
      closeEdit();
    } catch (err: any) {
      console.error("Failed to update grocery", err);
      setError(err.message || "Failed to update grocery");
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    getGroceries();
  }, []);

  const filteredGroceries = React.useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return groceries;
    return groceries.filter((g) => {
      return (
        g.name.toLowerCase().includes(term) ||
        g.category.toLowerCase().includes(term)
      );
    });
  }, [groceries, search]);

  return (
    <div className="min-h-screen bg-slate-50 px-6 py-8">
      <div className="mx-auto max-w-6xl">
        <button
              type="button"
              onClick={() => router.back()}
              className="inline-flex h-9 w-19 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:bg-slate-100 hover:text-slate-900 px-3 py-2 mb-10"
            >
              <span className="sr-only">Back</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                className="h-4 w-4"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.75 19.5L8.25 12l7.5-7.5"
                />
              </svg> Back
            </button>
        <header className="mb-6 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div>
              <h1 className="text-2xl font-semibold text-slate-900">
                Grocery Inventory
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                View and manage all grocery items in your store.
              </p>
            </div>
          </div>

          <div className="w-full max-w-xs">
            <div className="relative">
              <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-slate-400">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  className="h-4 w-4"
                >
                  <circle cx="11" cy="11" r="6" />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M16 16l3.5 3.5"
                  />
                </svg>
              </span>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name or category..."
                className="w-full rounded-full border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm text-slate-800 outline-none placeholder:text-slate-400 focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
              />
            </div>
          </div>
        </header>

        {error && (
          <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {loading && groceries.length === 0 ? (
          <div className="flex h-40 items-center justify-center text-slate-500">
            Loading groceries...
          </div>
        ) : filteredGroceries.length === 0 ? (
          <div className="flex h-40 items-center justify-center text-slate-500">
            {search.trim()
              ? "No groceries match your search."
              : "No groceries found."}
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredGroceries.map((g) => (
              <div
                key={g._id}
                className="group flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="relative h-65 w-full overflow-hidden bg-slate-100">
                  {g.imageUrl ? (
                    <img
                      src={g.imageUrl}
                      alt={g.name}
                      className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-slate-400">
                      No Image
                    </div>
                  )}
                </div>
                <div className="flex flex-1 flex-col p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h2 className="text-base font-semibold text-slate-900">
                        {g.name}
                      </h2>
                      <p className="mt-1 text-xs font-medium uppercase tracking-wide text-emerald-600">
                        {g.category}
                      </p>
                    </div>
                    <span className="rounded-full bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-700">
                      {g.price.toFixed(2)} / {g.unit}
                    </span>
                  </div>

                  <p className="mt-2 line-clamp-2 text-sm text-slate-500">
                    {g.description}
                  </p>

                  <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
                    <span>
                      Stock: <span className="font-semibold">{g.stock}</span>
                    </span>
                  </div>

                  <div className="mt-4 flex justify-end">
                    <button
                      type="button"
                      onClick={() => openEdit(g)}
                      className="inline-flex items-center rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-slate-800"
                    >
                      Edit
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {isEditOpen && selectedGrocery && (
          <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 px-4">
            <div className="relative w-full max-w-2xl rounded-2xl bg-white p-6 shadow-xl">
              <button
                type="button"
                onClick={closeEdit}
                className="absolute right-4 top-4 rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <span className="sr-only">Close</span>
                ✕
              </button>

              <h2 className="mb-1 text-xl font-semibold text-slate-900">
                Edit Grocery
              </h2>
              <p className="mb-4 text-sm text-slate-500">
                Update details for <span className="font-semibold">{selectedGrocery.name}</span>.
              </p>

              <form onSubmit={handleUpdate} className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-xs font-medium text-slate-600">
                      Name
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
                      required
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-medium text-slate-600">
                      Category
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
                      required
                    >
                      <option value="">Select category</option>
                      <option value="Fruits">Fruits</option>
                      <option value="Vegetables">Vegetables</option>
                      <option value="Dairy">Dairy</option>
                      <option value="Meat">Meat</option>
                      <option value="Bakery">Bakery</option>
                      <option value="Beverages">Beverages</option>
                    </select>
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-medium text-slate-600">
                      Price
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
                      required
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-medium text-slate-600">
                      Unit
                    </label>
                    <select
                      value={unit}
                      onChange={(e) => setUnit(e.target.value)}
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
                      required
                    >
                      <option value="">Select unit</option>
                      <option value="kg">kg</option>
                      <option value="g">g</option>
                      <option value="liter">liter</option>
                      <option value="ml">ml</option>
                      <option value="piece">piece</option>
                    </select>
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-medium text-slate-600">
                      Stock
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={stock}
                      onChange={(e) => setStock(e.target.value)}
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
                      required
                    />
                  </div>

                  <div className="md:col-span-1">
                    <label className="mb-1 block text-xs font-medium text-slate-600">
                      Image
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="block w-full text-xs text-slate-600 file:mr-3 file:rounded-md file:border-0 file:bg-slate-900 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-white hover:file:bg-slate-800"
                    />
                    {imagePreview && (
                      <div className="mt-2 h-24 w-32 overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="h-full w-full object-cover"
                        />
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-600">
                    Description
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
                    required
                  />
                </div>

                <div className="mt-2 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={closeEdit}
                    className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="inline-flex items-center rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
                  >
                    {loading ? "Saving..." : "Save changes"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ViewGrocery;
