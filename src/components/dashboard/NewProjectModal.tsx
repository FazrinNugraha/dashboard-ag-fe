import React, { useState } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { API_BASE } from '../../lib/api';
import { parseRupiah, handleMoneyInput } from '../../lib/currency';

interface NewProjectModalProps {
  onClose: () => void;
}

export const NewProjectModal: React.FC<NewProjectModalProps> = ({ onClose }) => {
  const [formData, setFormData] = useState({
    id_proyek: `INV-${new Date().getFullYear()}${(new Date().getMonth() + 1).toString().padStart(2, '0')}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
    tanggal: new Date().toISOString().split('T')[0],
    nama_klien: '',
    alamat: '',
    pekerjaan: '',
    subtotal: '',
    diskon: '0',
    dp: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  // Kunci idempotency per sesi modal: cegah proyek tercatat dobel saat retry.
  const [idemKey] = useState(() => crypto.randomUUID());

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const payload = {
        ...formData,
        subtotal: parseRupiah(formData.subtotal) || 0,
        diskon: parseRupiah(formData.diskon) || 0,
        dp: parseRupiah(formData.dp) || 0,
      };

      const res = await fetch(`${API_BASE}/projects`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'x-requested-with': 'XMLHttpRequest',
          'Idempotency-Key': idemKey
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const errJson = await res.json();
        throw new Error(errJson.error?.message || errJson.detail?.message || errJson.detail || 'Gagal menyimpan proyek');
      }

      window.location.reload(); // Refresh untuk melihat data baru
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      position: 'fixed', 
      top: 0, left: 0, right: 0, bottom: 0, 
      backgroundColor: 'rgba(5, 0, 56, 0.45)', 
      backdropFilter: 'blur(4px)',
      display: 'flex', 
      /* Mobile: align bottom (sheet feel), Desktop: center */
      alignItems: 'flex-end',
      justifyContent: 'center', 
      zIndex: 1000,
      padding: '0',
    }}>
      <Card variant="base" style={{
        width: '100%',
        maxWidth: '600px',
        /* Mobile: tall sheet, Desktop: bounded */
        maxHeight: '95dvh',
        overflowY: 'auto',
        padding: 'var(--spacing-xl)',
        paddingBottom: 'max(var(--spacing-xl), env(safe-area-inset-bottom))',
        boxShadow: 'var(--shadow-modal)',
        borderRadius: 'var(--rounded-xl) var(--rounded-xl) 0 0',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-xl)' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 500 }}>Tambah Proyek Baru</h2>
          <button onClick={onClose} aria-label="Tutup" style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: 'var(--color-slate)', lineHeight: 1 }}>&times;</button>
        </div>

        {error && (
          <div style={{ padding: 'var(--spacing-sm)', backgroundColor: 'var(--color-error)', color: 'var(--color-coral-dark)', borderRadius: 'var(--rounded-md)', marginBottom: 'var(--spacing-md)' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Grid 1 kolom di mobile, 2 kolom di sm+ */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500 }}>ID Proyek (Invoice)</label>
              <Input type="text" value={formData.id_proyek} onChange={e => setFormData({...formData, id_proyek: e.target.value})} required />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500 }}>Tanggal</label>
              <Input type="date" value={formData.tanggal} onChange={e => setFormData({...formData, tanggal: e.target.value})} required />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500 }}>Nama Klien</label>
            <Input type="text" placeholder="Bpk. Agung" value={formData.nama_klien} onChange={e => setFormData({...formData, nama_klien: e.target.value})} required />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500 }}>Alamat</label>
            <Input type="text" placeholder="Jl. Merdeka No. 1" value={formData.alamat} onChange={e => setFormData({...formData, alamat: e.target.value})} required />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500 }}>Judul Pekerjaan</label>
            <Input type="text" placeholder="Pemasangan Kusen 4 Pintu" value={formData.pekerjaan} onChange={e => setFormData({...formData, pekerjaan: e.target.value})} required />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))', gap: '16px', marginTop: '8px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500 }}>Subtotal (Rp)</label>
              <Input type="text" placeholder="5.000.000" value={formData.subtotal} onChange={e => setFormData({...formData, subtotal: handleMoneyInput(e.target.value)})} required />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500 }}>Diskon (Rp)</label>
              <Input type="text" placeholder="0" value={formData.diskon} onChange={e => setFormData({...formData, diskon: handleMoneyInput(e.target.value)})} required />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500 }}>Uang Muka / DP (Rp)</label>
            <Input type="text" placeholder="0" value={formData.dp} onChange={e => setFormData({...formData, dp: handleMoneyInput(e.target.value)})} required />
            <p style={{ fontSize: '12px', color: 'var(--color-slate)', marginTop: '4px' }}>Jika langsung lunas, masukkan nominal sama dengan (Subtotal - Diskon).</p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '24px' }}>
            <Button type="button" variant="secondary" onClick={onClose} style={{ width: '100%', justifyContent: 'center' }}>Batal</Button>
            <Button type="submit" variant="primary" disabled={loading} style={{ width: '100%', justifyContent: 'center' }}>
              {loading ? 'Menyimpan...' : 'Simpan Proyek'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};
