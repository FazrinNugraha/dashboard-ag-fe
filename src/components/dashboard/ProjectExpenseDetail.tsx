import React, { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { API_BASE } from '../../lib/api';

interface ProjectExpenseDetailProps {
  /** Nomor invoice proyek yang rincian pengeluarannya ditampilkan. */
  idProyek: string;
}

const CATEGORY_LABELS: Record<string, string> = {
  BAHAN_BAKU: 'Bahan Baku',
  AKSESORIS: 'Aksesoris',
  UPAH: 'Upah Tukang',
  OPERASIONAL: 'Operasional',
  LAINNYA: 'Lain-lain',
};

const formatRp = (num: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(num);

/**
 * Rincian pengeluaran satu proyek. Tampil saat baris proyek dibuka di
 * tabel Proyek & Klien. Data diambil sekali saat komponen muncul
 * (GET /expenses?id_proyek=...), jadi tidak membebani halaman utama.
 */
export const ProjectExpenseDetail: React.FC<ProjectExpenseDetailProps> = ({ idProyek }) => {
  const [expenses, setExpenses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res = await fetch(
          `${API_BASE}/expenses?id_proyek=${encodeURIComponent(idProyek)}&page_size=100`,
          { credentials: 'include' }
        );
        if (!res.ok) throw new Error('Gagal memuat rincian pengeluaran');
        const json = await res.json();
        if (!cancelled) setExpenses(json.data || []);
      } catch (err: any) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [idProyek]);

  const textStyle: React.CSSProperties = { fontSize: '13px', color: 'var(--color-slate)', padding: '4px 0' };

  if (loading) return <div style={textStyle}>Memuat rincian pengeluaran...</div>;
  if (error) return <div style={{ ...textStyle, color: 'var(--color-error)' }}>{error}</div>;
  if (expenses.length === 0) {
    return <div style={textStyle}>Belum ada pengeluaran yang dicatat untuk proyek ini.</div>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      {expenses.map((e) => (
        <div
          key={e.id_pengeluaran}
          style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', fontSize: '13px' }}
        >
          <span style={{ color: 'var(--color-slate)', minWidth: '90px' }}>
            {format(new Date(e.tanggal), 'dd MMM yyyy', { locale: id })}
          </span>
          <span style={{ fontWeight: 500, minWidth: '90px' }}>{CATEGORY_LABELS[e.kategori] ?? e.kategori}</span>
          <span style={{ flex: 1, color: 'var(--color-ink)' }}>{e.keterangan}</span>
          <span style={{ fontWeight: 600, color: 'var(--color-ink)' }}>{formatRp(e.nominal)}</span>
        </div>
      ))}
    </div>
  );
};
