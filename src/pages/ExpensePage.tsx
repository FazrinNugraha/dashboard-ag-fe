import React, { useState } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';

/**
 * Halaman Catat Pengeluaran
 * Terdapat form untuk menambahkan pengeluaran baru.
 */
export const ExpensePage: React.FC = () => {
  const [formData, setFormData] = useState({
    tanggal: new Date().toISOString().split('T')[0],
    kategori: 'BAHAN_BAKU',
    keterangan: '',
    nominal: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    try {
      const payload = {
        ...formData,
        nominal: parseInt(formData.nominal) || 0
      };

      const res = await fetch('http://localhost:8000/api/v1/expenses', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'x-requested-with': 'XMLHttpRequest'
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        if (res.status === 401 || res.status === 403) {
           throw new Error('Anda belum login atau tidak memiliki akses (Harus Login)');
        }
        const errJson = await res.json();
        throw new Error(errJson.detail?.message || errJson.detail || 'Terjadi kesalahan sistem');
      }

      setMessage('Pengeluaran berhasil dicatat!');
      setFormData({ ...formData, keterangan: '', nominal: '' }); // reset sebagian
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: 600 }}>Catat Pengeluaran Baru</h2>
        <p style={{ color: 'var(--color-slate)' }}>Masukkan rincian pengeluaran kas operasional atau proyek.</p>
      </div>

      <Card variant="base">
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {error && <div style={{ color: 'var(--color-on-primary)', backgroundColor: 'var(--color-error)', padding: '12px', borderRadius: '8px' }}>{error}</div>}
          {message && <div style={{ color: 'var(--color-on-primary)', backgroundColor: 'var(--color-success)', padding: '12px', borderRadius: '8px' }}>{message}</div>}
          
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>Tanggal</label>
            <Input 
              type="date" 
              required
              value={formData.tanggal} 
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, tanggal: e.target.value })} 
            />
          </div>
          
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>Kategori</label>
            <select 
              className="input input-text"
              required
              value={formData.kategori} 
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFormData({ ...formData, kategori: e.target.value })} 
            >
              <option value="BAHAN_BAKU">Bahan Baku (Aluminium, Kaca, dll)</option>
              <option value="AKSESORIS">Aksesoris & Hardware</option>
              <option value="UPAH">Upah Tukang / Pekerja</option>
              <option value="OPERASIONAL">Operasional (Bensin, Makan, dll)</option>
              <option value="LAINNYA">Lain-lain</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>Keterangan</label>
            <Input 
              type="text" 
              placeholder="Contoh: Beli handle pintu 5 lusin" 
              required
              value={formData.keterangan} 
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, keterangan: e.target.value })} 
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>Nominal (Rp)</label>
            <Input 
              type="number" 
              placeholder="Contoh: 1500000" 
              required
              min="1"
              value={formData.nominal} 
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, nominal: e.target.value })} 
            />
          </div>

          <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'flex-end' }}>
            <Button type="submit" disabled={loading} variant="primary">
              {loading ? 'Menyimpan...' : 'Simpan Pengeluaran'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};
