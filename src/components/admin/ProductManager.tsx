"use client";

import { useState, useCallback } from "react";
import Image from "next/image";
import {
  Plus,
  Pencil,
  Trash2,
  Loader2,
  Star,
  CheckCircle2,
  Package,
  Search,
  Upload,
  Link as LinkIcon,
  X,
} from "lucide-react";
import { formatMoney } from "@/lib/utils";

interface Category {
  id: string;
  slug: string;
  name: string;
  icon: string;
}

interface Product {
  id: string;
  slug: string;
  title: string;
  description: string;
  category_id: string;
  category_name: string;
  price_cents: number;
  image: string;
  license_payload: string;
  featured: number;
  in_stock: number;
}

interface Props {
  initialProducts: Product[];
  categories: Category[];
}

interface ProductForm {
  title: string;
  description: string;
  categoryId: string;
  price: string;
  image: string;
  license: string;
  featured: boolean;
  inStock: boolean;
}

const EMPTY_FORM: ProductForm = {
  title: "",
  description: "",
  categoryId: "",
  price: "",
  image: "",
  license: "",
  featured: false,
  inStock: true,
};

export function ProductManager({ initialProducts, categories }: Props) {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [editing, setEditing] = useState<Product | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<ProductForm>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [query, setQuery] = useState("");
  const [imageMode, setImageMode] = useState<"upload" | "url">("upload");
  const [uploadingImage, setUploadingImage] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingImage(true);
    setError("");

    try {
      const bodyData = new FormData();
      bodyData.append("file", file);

      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: bodyData,
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Failed to upload image");
        return;
      }

      setForm((prev) => ({ ...prev, image: data.url }));
    } catch {
      setError("Network error during file upload");
    } finally {
      setUploadingImage(false);
    }
  };

  const filtered = query.trim()
    ? products.filter(
        (p) =>
          p.title.toLowerCase().includes(query.trim().toLowerCase()) ||
          p.category_name.toLowerCase().includes(query.trim().toLowerCase())
      )
    : products;

  const openCreate = () => {
    setEditing(null);
    setForm({ ...EMPTY_FORM, categoryId: categories[0]?.id ?? "" });
    setShowForm(true);
    setError("");
  };

  const openEdit = (p: Product) => {
    setEditing(p);
    setForm({
      title: p.title,
      description: p.description,
      categoryId: p.category_id,
      price: (p.price_cents / 100).toString(),
      image: p.image,
      license: p.license_payload,
      featured: p.featured === 1,
      inStock: p.in_stock === 1,
    });
    setShowForm(true);
    setError("");
  };

  const flash = (msg: string) => {
    setNotice(msg);
    setTimeout(() => setNotice(""), 2500);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      const payload = {
        title: form.title,
        description: form.description,
        categoryId: form.categoryId,
        price: Number(form.price),
        image: form.image,
        license: form.license,
        featured: form.featured,
        inStock: form.inStock,
      };
      const res = await fetch(
        editing ? `/api/admin/products/${editing.id}` : "/api/admin/products",
        {
          method: editing ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Save failed");
        setSaving(false);
        return;
      }
      setShowForm(false);
      flash(editing ? "Product updated" : "Product created");
      await refresh();
    } catch {
      setError("Network error — please try again.");
      setSaving(false);
    }
  };

  const handleDelete = async (p: Product) => {
    if (!confirm(`Delete "${p.title}"? This cannot be undone.`)) return;
    const res = await fetch(`/api/admin/products/${p.id}`, { method: "DELETE" });
    if (res.ok) {
      flash("Product deleted");
      await refresh();
    }
  };

  const refresh = useCallback(async () => {
    const res = await fetch("/api/admin/products");
    if (res.ok) {
      const data = await res.json();
      setProducts(data.products);
    }
  }, []);

  return (
    <div>
      {/* Notice */}
      {notice && (
        <div className="mb-5 flex items-center gap-2 rounded-xl border border-emerald-400/30 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-300">
          <CheckCircle2 size={16} /> {notice}
        </div>
      )}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <h2 className="text-sm font-semibold text-text-primary">Products</h2>
          <span className="rounded-full bg-slate-200/60 px-2 py-0.5 text-[11px] font-medium text-text-muted dark:bg-white/[0.06]">
            {products.length}
          </span>
        </div>
        <button onClick={openCreate} className="btn-primary px-4 py-2 text-xs">
          <Plus size={14} /> Add product
        </button>
      </div>

      {/* Toolbar */}
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <div className="relative min-w-52 flex-1">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="input-field px-3.5 py-2 pl-9 text-sm"
            placeholder="Search products…"
            aria-label="Search products"
          />
          <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
        </div>
        {query && (
          <button onClick={() => setQuery("")} className="btn-ghost px-3 py-1.5 text-xs">
            Clear
          </button>
        )}
      </div>

      {/* Create/Edit popup modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="glass-strong max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200/80 pb-4 dark:border-white/10">
              <h3 className="font-display text-lg font-bold text-text-primary">
                {editing ? "Edit Product" : "New Product"}
              </h3>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="rounded-lg px-2 py-1 text-sm font-semibold text-text-muted hover:text-text-primary"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleSave} className="mt-5 grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-text-muted">
                  Title
                </label>
                <input
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="input-field"
                  placeholder="Nebula UI Kit Pro"
                  required
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-text-muted">
                  Category
                </label>
                <select
                  value={form.categoryId}
                  onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                  className="input-field"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-text-muted">
                  Price (USD)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  className="input-field"
                  placeholder="49.00"
                  required
                />
              </div>

              <div className="sm:col-span-2 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium uppercase tracking-wider text-text-muted">
                    Product Image
                  </label>
                  <div className="flex rounded-lg border border-slate-200/80 bg-slate-100 p-0.5 dark:border-white/10 dark:bg-white/5">
                    <button
                      type="button"
                      onClick={() => setImageMode("upload")}
                      className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                        imageMode === "upload"
                          ? "bg-white text-slate-900 font-semibold shadow-xs dark:bg-white/15 dark:text-white"
                          : "text-text-muted hover:text-text-primary"
                      }`}
                    >
                      <Upload size={12} /> From Device
                    </button>
                    <button
                      type="button"
                      onClick={() => setImageMode("url")}
                      className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                        imageMode === "url"
                          ? "bg-white text-slate-900 font-semibold shadow-xs dark:bg-white/15 dark:text-white"
                          : "text-text-muted hover:text-text-primary"
                      }`}
                    >
                      <LinkIcon size={12} /> Image URL
                    </button>
                  </div>
                </div>

                {imageMode === "upload" ? (
                  <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 p-5 text-center transition-colors hover:border-violet-500/50 dark:border-white/15">
                    {uploadingImage ? (
                      <div className="flex flex-col items-center py-2">
                        <Loader2 size={24} className="animate-spin text-violet-600 dark:text-violet-400" />
                        <p className="mt-2 text-xs text-text-muted">Uploading image to server…</p>
                      </div>
                    ) : (
                      <label className="flex cursor-pointer flex-col items-center gap-2">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-violet-500/10 text-violet-700 dark:text-violet-300">
                          <Upload size={18} />
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-text-primary">
                            Click to select image from your device
                          </p>
                          <p className="mt-0.5 text-[11px] text-text-muted">
                            Supports PNG, JPG, WEBP, GIF, SVG
                          </p>
                        </div>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileUpload}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>
                ) : (
                  <input
                    type="text"
                    value={form.image}
                    onChange={(e) => setForm({ ...form, image: e.target.value })}
                    className="input-field"
                    placeholder="/products/artwork.svg or https://images.unsplash.com/..."
                    required
                  />
                )}

                {/* Live Image Preview */}
                {form.image && (
                  <div className="mt-3 flex items-center gap-3.5 rounded-xl border border-slate-200/80 bg-slate-50/80 p-2.5 dark:border-white/10 dark:bg-white/5">
                    <div className="relative h-12 w-16 overflow-hidden rounded-lg border border-slate-200/80 bg-black/5 dark:border-white/10 shrink-0">
                      <Image
                        src={form.image}
                        alt="Product Preview"
                        fill
                        unoptimized
                        className="object-cover"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-text-primary">Current Image Selected</p>
                      <p className="truncate text-[11px] font-mono text-text-muted">{form.image}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setForm((prev) => ({ ...prev, image: "" }))}
                      className="rounded-lg p-1.5 text-text-muted hover:text-red-500"
                      title="Remove image"
                    >
                      <X size={15} />
                    </button>
                  </div>
                )}
              </div>

              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-text-muted">
                  Description
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="input-field min-h-24 resize-y"
                  placeholder="Short pitch…"
                  required
                />
              </div>

              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-text-muted">
                  License Key Prefix / Template
                </label>
                <input
                  value={form.license}
                  onChange={(e) => setForm({ ...form, license: e.target.value })}
                  className="input-field font-mono"
                  placeholder="NEBULA-PRO"
                  required
                />
              </div>

              <div className="sm:col-span-2">
                <label className="flex items-center gap-2 text-sm text-text-primary cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.featured}
                    onChange={(e) => setForm({ ...form, featured: e.target.checked })}
                    className="rounded border-slate-300 text-violet-600 focus:ring-violet-500"
                  />
                  Feature on homepage
                </label>
              </div>

              <div className="sm:col-span-2">
                <div className="rounded-xl border border-slate-200/80 bg-slate-100/50 px-4 py-3 text-sm dark:border-white/10 dark:bg-white/[0.04]">
                  <p className="flex items-center gap-2 text-text-primary">
                    {editing ? <Pencil size={14} className="text-violet-600 dark:text-violet-300" /> : <Plus size={14} className="text-violet-600 dark:text-violet-300" />}
                    {editing ? "Editing product details" : "Creating new product"}
                  </p>
                </div>
              </div>

              {error && (
                <div className="rounded-xl border border-red-400/30 bg-red-400/10 px-4 py-3 text-sm text-red-600 dark:text-red-300 sm:col-span-2">
                  {error}
                </div>
              )}

              <div className="flex justify-end gap-3 sm:col-span-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="btn-ghost text-sm"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary text-sm" disabled={saving}>
                  {saving ? <Loader2 size={15} className="animate-spin" /> : <CheckCircle2 size={15} />}
                  {saving ? "Saving…" : "Save product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="mt-5 overflow-x-auto rounded-xl border border-slate-200/80 dark:border-white/[0.07]">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200/80 bg-slate-100/50 text-[11px] uppercase tracking-wider text-text-muted dark:border-white/[0.06] dark:bg-white/[0.03]">
              <th className="px-5 py-3.5 font-semibold">Product</th>
              <th className="px-5 py-3.5 font-semibold">Category</th>
              <th className="px-5 py-3.5 font-semibold">Price</th>
              <th className="px-5 py-3.5 font-semibold">License</th>
              <th className="px-5 py-3.5 font-semibold">Status</th>
              <th className="px-5 py-3.5 text-right font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => (
              <tr key={p.id} className="border-b border-slate-200/60 transition-colors hover:bg-slate-100/40 dark:border-white/5 dark:hover:bg-white/[0.03]">
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="relative h-10 w-14 shrink-0 overflow-hidden rounded-lg">
                      <Image src={p.image} alt={p.title} fill sizes="56px" className="object-cover" />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-text-primary">
                        {p.title}
                        {p.featured === 1 && <Star size={12} className="ml-1.5 inline fill-amber-400 text-amber-400" />}
                      </p>
                      <p className="truncate text-xs text-text-muted">/{p.slug}</p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-4 text-text-muted">{p.category_name}</td>
                <td className="px-5 py-4 font-semibold text-text-primary">{formatMoney(p.price_cents)}</td>
                <td className="px-5 py-4">
                  <code className="rounded bg-violet-500/10 px-2 py-1 font-mono text-xs text-violet-700 dark:text-violet-300">
                    {p.license_payload}
                  </code>
                </td>
                <td className="px-5 py-4">
                  <span
                    className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${
                      p.in_stock === 1
                        ? "bg-emerald-400/10 text-emerald-400"
                        : "bg-red-400/10 text-red-400"
                    }`}
                  >
                    {p.in_stock === 1 ? "In stock" : "Out"}
                  </span>
                </td>
                <td className="px-5 py-4">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => openEdit(p)}
                      className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 text-text-muted transition-colors hover:border-violet-500/40 hover:text-violet-300"
                      aria-label={`Edit ${p.title}`}
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      onClick={() => handleDelete(p)}
                      className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 text-text-muted transition-colors hover:border-red-400/40 hover:text-red-400"
                      aria-label={`Delete ${p.title}`}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="px-5 py-12 text-center text-text-muted">
                  <Package size={24} className="mx-auto mb-2" />
                  No products {query ? `matching “${query}”` : "yet — add your first one!"}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
