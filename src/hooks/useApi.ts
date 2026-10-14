import { useState, useEffect } from 'react';
import { API_BASE } from '../lib/api';

export function useDashboard(month: string, enabled = true) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;

    async function fetchData() {
      setLoading(true);
      try {
        const res = await fetch(`${API_BASE}/dashboard?month=${month}`, { credentials: 'include' });
        if (!res.ok) throw new Error('Gagal memuat data dashboard');
        const json = await res.json();
        if (!cancelled) setData(json);
      } catch (err: any) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchData();
    return () => {
      cancelled = true;
    };
  }, [month, enabled]);

  return { data, loading, error };
}

/**
 * Daftar proyek (sudah termasuk total_pengeluaran, laba_bersih, margin_pct dari backend).
 * `refreshKey` (mis. tab aktif) memicu fetch ulang agar data tidak basi
 * setelah ada pengeluaran baru.
 */
export function useProjects(month: string, enabled = true, refreshKey: string = '') {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;

    async function fetchData() {
      setLoading(true);
      try {
        // Jika month kosong, ambil semua. Jika ada, filter.
        // page_size=500 (batas maksimal backend) agar semua proyek terambil;
        // default backend hanya 20/halaman. Lebih dari 500 perlu pencarian lewat server.
        const url = month
          ? `${API_BASE}/projects?month=${month}&page_size=500`
          : `${API_BASE}/projects?page_size=500`;
        const res = await fetch(url, { credentials: 'include' });
        const json = await res.json();
        if (!cancelled) setProjects(json.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchData();
    return () => {
      cancelled = true;
    };
  }, [month, enabled, refreshKey]);

  return { projects, loading };
}