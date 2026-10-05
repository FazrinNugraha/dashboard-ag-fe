import React, { useState } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { API_BASE } from '../lib/api';
import { parseRupiah, handleMoneyInput } from '../lib/currency';

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
        nominal: parseRupiah(formData.nominal) || 0
      };

      const res = await fetch(`${API_BASE}/expenses`, {
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
        throw new Error(errJson.error?.message || errJson.detail?.message || errJson.detail || 'Terjadi kesalahan sistem');
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
    <div style={{ maxWidth: '600px', margin: '0 auto', paddingTop: '8px' }}>
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
            <Select
              value={formData.kategori}
              onChange={(val) => setFormData({ ...formData, kategori: val })}
              options={[
                { value: 'BAHAN_BAKU', label: 'Bahan Baku (Aluminium, Kaca, dll)' },
                { value: 'AKSESORIS', label: 'Aksesoris & Hardware' },
                { value: 'UPAH', label: 'Upah Tukang / Pekerja' },
                { value: 'OPERASIONAL', label: 'Operasional (Bensin, Makan, dll)' },
                { value: 'LAINNYA', label: 'Lain-lain' },
              ]}
            />
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
              type="text" 
              placeholder="Contoh: 1.500.000" 
              required
              value={formData.nominal} 
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, nominal: handleMoneyInput(e.target.value) })} 
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
