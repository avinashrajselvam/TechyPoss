import { useEffect, useState, FormEvent } from 'react';
import { Plus, Pencil, Trash2, Loader2, Check } from 'lucide-react';
import { supabase } from '../supabaseClient';

type ProductRow = {
  id: string;
  name: string;
  category: string | null;
  description: string | null;
  price: number;
  is_veg: boolean;
  is_available: boolean;
};

const emptyForm: ProductRow = {
  id: '',
  name: '',
  category: '',
  description: '',
  price: 0,
  is_veg: true,
  is_available: true,
};

export default function ProductsAdmin() {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [form, setForm] = useState<ProductRow>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);

  const loadProducts = async () => {
    if (!supabase) {
      setError('Supabase not configured.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const { data, error: err } = await supabase
        .from('products')
        .select('id, name, category, description, price, is_veg, is_available')
        .order('name', { ascending: true });
      if (err) {
        setError(err.message);
      } else {
        setProducts((data ?? []) as ProductRow[]);
      }
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadProducts();
  }, []);

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!supabase) return;
    if (!form.id || !form.name) {
      setError('ID and name are required.');
      return;
    }

    setSaving(true);
    setError(null);
    try {
      if (editingId) {
        const { error: updateErr } = await supabase
          .from('products')
          .update({
            name: form.name,
            category: form.category,
            description: form.description,
            price: form.price,
            is_veg: form.is_veg,
            is_available: form.is_available,
          })
          .eq('id', editingId);
        if (updateErr) {
          setError(updateErr.message);
        } else {
          await loadProducts();
          resetForm();
        }
      } else {
        const { error: insertErr } = await supabase
          .from('products')
          .insert({
            id: form.id,
            name: form.name,
            category: form.category,
            description: form.description,
            price: form.price,
            is_veg: form.is_veg,
            is_available: form.is_available,
          });
        if (insertErr) {
          setError(insertErr.message);
        } else {
          await loadProducts();
          resetForm();
        }
      }
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (p: ProductRow) => {
    setEditingId(p.id);
    setForm({
      ...p,
      category: p.category ?? '',
      description: p.description ?? '',
    });
  };

  const handleDelete = async (id: string) => {
    if (!supabase) return;
    if (!confirm('Delete this product?')) return;
    setSaving(true);
    setError(null);
    try {
      const { error: deleteErr } = await supabase.from('products').delete().eq('id', id);
      if (deleteErr) {
        setError(deleteErr.message);
      } else {
        await loadProducts();
        if (editingId === id) resetForm();
      }
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 text-white">
      <div className="border-b border-slate-800 px-4 py-3 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold">Products</h2>
          <p className="text-xs text-slate-400">Manage menu items stored in Supabase</p>
        </div>
        <button
          type="button"
          onClick={resetForm}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-xs text-slate-200"
        >
          <Plus size={12} /> New
        </button>
      </div>

      <div className="flex flex-1 overflow-hidden divide-x divide-slate-800">
        {/* Form */}
        <div className="w-72 flex-shrink-0 p-4 space-y-2 border-r border-slate-800">
          <form onSubmit={handleSubmit} className="space-y-2 text-xs">
            <div>
              <label className="block mb-1 text-slate-400">ID (matches menuData)</label>
              <input
                value={form.id}
                onChange={e => setForm({ ...form, id: e.target.value })}
                disabled={!!editingId}
                className="w-full bg-slate-800 border border-slate-600 rounded-md px-2 py-1 text-xs text-white focus:outline-none focus:border-orange-500"
                placeholder="e.g. S001"
              />
            </div>
            <div>
              <label className="block mb-1 text-slate-400">Name</label>
              <input
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                className="w-full bg-slate-800 border border-slate-600 rounded-md px-2 py-1 text-xs text-white focus:outline-none focus:border-orange-500"
              />
            </div>
            <div>
              <label className="block mb-1 text-slate-400">Category</label>
              <input
                value={form.category ?? ''}
                onChange={e => setForm({ ...form, category: e.target.value })}
                className="w-full bg-slate-800 border border-slate-600 rounded-md px-2 py-1 text-xs text-white focus:outline-none focus:border-orange-500"
              />
            </div>
            <div>
              <label className="block mb-1 text-slate-400">Price</label>
              <input
                type="number"
                step="0.01"
                value={form.price}
                onChange={e => setForm({ ...form, price: Number(e.target.value) || 0 })}
                className="w-full bg-slate-800 border border-slate-600 rounded-md px-2 py-1 text-xs text-white focus:outline-none focus:border-orange-500"
              />
            </div>
            <div>
              <label className="block mb-1 text-slate-400">Description</label>
              <textarea
                value={form.description ?? ''}
                onChange={e => setForm({ ...form, description: e.target.value })}
                rows={3}
                className="w-full bg-slate-800 border border-slate-600 rounded-md px-2 py-1 text-xs text-white focus:outline-none focus:border-orange-500 resize-none"
              />
            </div>
            <div className="flex items-center gap-3 mt-1">
              <label className="flex items-center gap-1 text-slate-300">
                <input
                  type="checkbox"
                  checked={form.is_veg}
                  onChange={e => setForm({ ...form, is_veg: e.target.checked })}
                  className="w-3 h-3"
                />
                Veg
              </label>
              <label className="flex items-center gap-1 text-slate-300">
                <input
                  type="checkbox"
                  checked={form.is_available}
                  onChange={e => setForm({ ...form, is_available: e.target.checked })}
                  className="w-3 h-3"
                />
                Available
              </label>
            </div>

            {error && (
              <div className="text-[11px] text-red-400 bg-red-500/10 border border-red-500/40 rounded-md px-2 py-1">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={saving}
              className="mt-1 w-full flex items-center justify-center gap-1.5 bg-orange-500 hover:bg-orange-400 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-semibold py-1.5 rounded-md"
            >
              {saving ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />}
              {editingId ? 'Update Product' : 'Create Product'}
            </button>
          </form>
        </div>

        {/* List */}
        <div className="flex-1 overflow-auto p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="text-xs text-slate-400">
              {loading ? 'Loading products…' : `${products.length} products`}
            </div>
            <button
              type="button"
              onClick={() => void loadProducts()}
              className="text-[11px] text-slate-300 hover:text-white flex items-center gap-1"
            >
              <Loader2 size={12} className={loading ? 'animate-spin' : ''} />
              Refresh
            </button>
          </div>

          <div className="border border-slate-800 rounded-lg overflow-hidden text-xs">
            <table className="w-full border-collapse">
              <thead className="bg-slate-800/80 text-slate-300">
                <tr>
                  <th className="px-2 py-1 text-left w-16">ID</th>
                  <th className="px-2 py-1 text-left">Name</th>
                  <th className="px-2 py-1 text-left w-24">Category</th>
                  <th className="px-2 py-1 text-right w-16">Price</th>
                  <th className="px-2 py-1 text-center w-14">Veg</th>
                  <th className="px-2 py-1 text-center w-20">Available</th>
                  <th className="px-2 py-1 text-right w-20">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map(p => (
                  <tr key={p.id} className="border-t border-slate-800 hover:bg-slate-800/60">
                    <td className="px-2 py-1 text-slate-300">{p.id}</td>
                    <td className="px-2 py-1 text-slate-50">{p.name}</td>
                    <td className="px-2 py-1 text-slate-300">{p.category}</td>
                    <td className="px-2 py-1 text-right text-slate-100">₹{p.price.toFixed(2)}</td>
                    <td className="px-2 py-1 text-center">
                      {p.is_veg ? (
                        <span className="inline-block px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px]">
                          Veg
                        </span>
                      ) : (
                        <span className="inline-block px-1.5 py-0.5 rounded-full bg-red-500/20 text-red-400 text-[10px]">
                          Non-veg
                        </span>
                      )}
                    </td>
                    <td className="px-2 py-1 text-center">
                      <span
                        className={`inline-block px-1.5 py-0.5 rounded-full text-[10px] ${
                          p.is_available
                            ? 'bg-green-500/20 text-green-400'
                            : 'bg-slate-600/40 text-slate-300'
                        }`}
                      >
                        {p.is_available ? 'Yes' : 'No'}
                      </span>
                    </td>
                    <td className="px-2 py-1 text-right">
                      <button
                        type="button"
                        onClick={() => startEdit(p)}
                        className="inline-flex items-center justify-center w-6 h-6 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 mr-1"
                      >
                        <Pencil size={11} />
                      </button>
                      <button
                        type="button"
                        onClick={() => void handleDelete(p.id)}
                        className="inline-flex items-center justify-center w-6 h-6 rounded bg-red-600/80 hover:bg-red-500 text-white"
                      >
                        <Trash2 size={11} />
                      </button>
                    </td>
                  </tr>
                ))}
                {products.length === 0 && !loading && (
                  <tr>
                    <td colSpan={7} className="px-2 py-4 text-center text-slate-500">
                      No products yet. Use the form on the left to create one.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

