import { useState, useEffect } from 'react';

// URL backend (bisa dipindah ke .env nanti)
const API_BASE = 'http://localhost:8000/api/v1';

export function useDashboard(month: string) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const res = await fetch(`${API_BASE}/dashboard?month=${month}`, { credentials: 'include' });
        if (!res.ok) throw new Error('Gagal memuat data dashboard');
        const json = await res.json();
        setData(json);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    
    fetchData();
  }, [month]);

  return { data, loading, error };
}

export function useProjects(month: string) {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        // Jika month kosong, ambil semua. Jika ada, filter.
        // page_size=100 untuk mengambil semua data (backend default hanya 20/halaman)
        const url = month
          ? `${API_BASE}/projects?month=${month}&page_size=100`
          : `${API_BASE}/projects?page_size=100`;
        const res = await fetch(url, { credentials: 'include' });
        const json = await res.json();
        setProjects(json.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [month]);

  return { projects, loading };
}

// Ambil laba bersih untuk tiap bulan trend (backend tidak punya endpoint khusus,
// jadi kita tarik dari kpi.laba_bersih dashboard per bulan)
export function useLabaTrend(months: string[]) {
  const [laba, setLaba] = useState<Record<string, number>>({});
  const key = months.join(',');

  useEffect(() => {
    if (!key) {
      setLaba({});
      return;
    }
    let cancelled = false;

    async function fetchAll() {
      const list = key.split(',');
      const results = await Promise.all(
        list.map((m) =>
          fetch(`${API_BASE}/dashboard?month=${m}`, { credentials: 'include' })
            .then((r) => (r.ok ? r.json() : null))
            .catch(() => null)
        )
      );
      if (cancelled) return;
      const map: Record<string, number> = {};
      results.forEach((r: any, i: number) => {
        if (r?.kpi?.laba_bersih?.value !== undefined) {
          map[list[i]] = r.kpi.laba_bersih.value;
        }
      });
      setLaba(map);
    }

    fetchAll();
    return () => {
      cancelled = true;
    };
  }, [key]);

  return laba;
}
