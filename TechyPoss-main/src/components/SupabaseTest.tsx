import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';

type ProductRow = {
  id: string;
  name: string;
};

export default function SupabaseTest() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rows, setRows] = useState<ProductRow[]>([]);

  useEffect(() => {
    const run = async () => {
      if (!supabase) {
        setError('Supabase client not configured. Check VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY.');
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const { data, error: err } = await supabase
          .from('products')
          .select('id, name')
          .limit(5);

        if (err) {
          setError(err.message);
        } else {
          setRows((data ?? []) as ProductRow[]);
        }
      } catch (e) {
        setError((e as Error).message);
      } finally {
        setLoading(false);
      }
    };

    void run();
  }, []);

  return (
    <div className="fixed bottom-3 left-3 z-50 text-xs bg-slate-900/90 border border-slate-700 rounded-lg px-3 py-2 text-slate-300">
      <div className="font-semibold mb-1 text-slate-100">Supabase Test</div>
      {loading && <div>Loading from `products`…</div>}
      {error && <div className="text-red-400 max-w-xs break-words">Error: {error}</div>}
      {!loading && !error && rows.length === 0 && (
        <div>No rows found in `products`.</div>
      )}
      {!loading && !error && rows.length > 0 && (
        <div>
          <div className="mb-1">First rows:</div>
          <ul className="list-disc list-inside space-y-0.5">
            {rows.map(r => (
              <li key={r.id}>
                <span className="text-slate-200">{r.name}</span>{' '}
                <span className="text-slate-500">({r.id})</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

