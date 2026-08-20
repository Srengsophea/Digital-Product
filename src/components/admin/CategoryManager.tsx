"use client";

import { useState } from "react";
import { Plus, Edit2, Trash2, FolderPlus, RefreshCw, Loader2, Code, Palette, GraduationCap, LayoutTemplate, Sparkles, Box, Terminal, Cpu } from "lucide-react";

export interface CategoryItem {
  id: string;
  slug: string;
  name: string;
  icon: string;
  product_count?: number;
}

const ICON_OPTIONS = [
  { name: "code", icon: Code, label: "Code / Software" },
  { name: "palette", icon: Palette, label: "Design / Palette" },
  { name: "graduation-cap", icon: GraduationCap, label: "Courses" },
  { name: "layout-template", icon: LayoutTemplate, label: "Templates" },
  { name: "sparkles", icon: Sparkles, label: "Sparkles" },
  { name: "box", icon: Box, label: "Box" },
  { name: "terminal", icon: Terminal, label: "Terminal" },
  { name: "cpu", icon: Cpu, label: "CPU" },
];

export function CategoryManager({
  initialCategories,
}: {
  initialCategories: CategoryItem[];
}) {
  const [categories, setCategories] = useState<CategoryItem[]>(initialCategories);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<CategoryItem | null>(null);
  const [name, setName] = useState("");
  const [icon, setIcon] = useState("code");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const refreshCategories = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/categories");
      if (res.ok) {
        const data = await res.json();
        setCategories(data.categories);
      }
    } catch {
      // Ignore
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setEditing(null);
    setName("");
    setIcon("code");
    setError("");
    setShowModal(true);
  };

  const handleOpenEdit = (cat: CategoryItem) => {
    setEditing(cat);
    setName(cat.name);
    setIcon(cat.icon || "code");
    setError("");
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setError("");
    setSubmitting(true);

    try {
      const url = editing
        ? `/api/admin/categories/${editing.id}`
        : "/api/admin/categories";
      const method = editing ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), icon }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Failed to save category");
        setSubmitting(false);
        return;
      }

      setShowModal(false);
      await refreshCategories();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (cat: CategoryItem) => {
    if (
      !confirm(
        `Are you sure you want to delete category "${cat.name}"?`
      )
    )
      return;

    try {
      const res = await fetch(`/api/admin/categories/${cat.id}`, {
        method: "DELETE",
      });
      const data = await res.json();

      if (!res.ok) {
        alert(data.error ?? "Could not delete category");
        return;
      }

      await refreshCategories();
    } catch {
      alert("Network error. Could not delete category.");
    }
  };

  const renderIcon = (iconName: string) => {
    const item = ICON_OPTIONS.find((i) => i.name === iconName);
    const IconComp = item ? item.icon : Code;
    return <IconComp size={16} />;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-text-primary">
            Categories
          </h1>
          <p className="mt-1 text-sm text-text-muted">
            Organize products into search filterable categories.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={refreshCategories}
            disabled={loading}
            className="flex items-center gap-1.5 rounded-lg border border-slate-200/80 px-3 py-1.5 text-xs text-text-muted transition-colors hover:border-slate-300 hover:text-text-primary dark:border-white/[0.08] dark:hover:border-white/[0.15]"
          >
            <RefreshCw size={13} className={loading ? "animate-spin" : ""} /> Refresh
          </button>
          <button
            onClick={handleOpenAdd}
            className="btn-primary py-1.5 text-xs font-semibold"
          >
            <Plus size={14} /> Add category
          </button>
        </div>
      </div>

      {/* Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((cat) => (
          <div
            key={cat.id}
            className="glass group relative flex items-center justify-between rounded-2xl p-5 transition-all hover:border-violet-500/40"
          >
            <div className="flex items-center gap-3.5">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200/80 bg-slate-100/70 text-violet-600 dark:border-white/10 dark:bg-white/5 dark:text-violet-300">
                {renderIcon(cat.icon)}
              </div>
              <div>
                <h3 className="font-medium text-text-primary">{cat.name}</h3>
                <p className="mt-0.5 text-xs text-text-muted font-mono">
                  slug: {cat.slug} · {cat.product_count ?? 0} product(s)
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1 opacity-90 group-hover:opacity-100">
              <button
                onClick={() => handleOpenEdit(cat)}
                className="rounded-lg p-2 text-text-muted hover:bg-slate-100 hover:text-text-primary dark:hover:bg-white/10"
                title="Edit category"
              >
                <Edit2 size={14} />
              </button>
              <button
                onClick={() => handleDelete(cat)}
                className="rounded-lg p-2 text-text-muted hover:bg-red-500/10 hover:text-red-600 dark:hover:text-red-400"
                title="Delete category"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Category Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="glass-strong w-full max-w-md rounded-3xl p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200/80 pb-4 dark:border-white/10">
              <h2 className="font-display text-lg font-bold text-text-primary">
                {editing ? "Edit Category" : "Add New Category"}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="rounded-lg px-2 text-sm text-text-muted hover:text-text-primary"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-5 space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-text-muted">
                  Category Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Software & Tools"
                  className="input-field"
                  required
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-text-muted">
                  Category Icon
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {ICON_OPTIONS.map((opt) => {
                    const IconC = opt.icon;
                    const isSelected = icon === opt.name;
                    return (
                      <button
                        key={opt.name}
                        type="button"
                        onClick={() => setIcon(opt.name)}
                        className={`flex flex-col items-center gap-1 rounded-xl border p-2.5 text-xs transition-all ${
                          isSelected
                            ? "border-violet-500 bg-violet-500/15 text-violet-700 font-semibold dark:text-violet-300"
                            : "border-slate-200/80 text-text-muted hover:border-slate-300 dark:border-white/10"
                        }`}
                      >
                        <IconC size={18} />
                        <span className="truncate text-[10px]">{opt.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {error && (
                <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-600 dark:text-red-400">
                  {error}
                </div>
              )}

              <div className="mt-6 flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="btn-ghost text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-primary text-xs"
                >
                  {submitting ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <FolderPlus size={14} />
                  )}
                  {editing ? "Save Changes" : "Create Category"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
