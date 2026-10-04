import React, { useState } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

export const ScanInvoicePage: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [previewData, setPreviewData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('http://localhost:8000/api/v1/invoices/extract', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'x-requested-with': 'XMLHttpRequest'
        },
        body: formData,
      });

      if (!res.ok) {
        let errMsg = 'Gagal mengekstrak invoice.';
        try {
          const errJson = await res.json();
          errMsg = errJson.error?.message || errJson.detail?.message || errJson.detail || errMsg;
        } catch (e) {}
        
        if (res.status === 401 || res.status === 403) {
           errMsg = 'Fitur ini dilindungi. Anda belum login atau token Anda kadaluarsa.';
        }
        throw new Error(errMsg);
      }

      const json = await res.json();
      setPreviewData(json);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!previewData) return;
    setSaving(true);
    setError('');
    
    try {
      const payload = { 
        id_proyek: previewData.nomor_invoice,
        tanggal: previewData.tanggal,
        nama_klien: previewData.nama_klien,
        alamat: previewData.alamat,
        pekerjaan: previewData.pekerjaan,
        subtotal: previewData.subtotal,
        diskon: previewData.diskon,
        dp: previewData.dp || 0 
      };
      
      const res = await fetch('http://localhost:8000/api/v1/projects', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'x-requested-with': 'XMLHttpRequest'
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const errJson = await res.json();
        throw new Error(errJson.detail?.message || errJson.detail || 'Gagal menyimpan proyek');
      }

      setSuccess(true);
      setPreviewData(null);
      setFile(null);
      
      // Auto redirect to home after 2 seconds
      setTimeout(() => {
        window.location.reload();
      }, 2000);
      
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ maxWidth: '700px', margin: '0 auto', paddingTop: '8px' }}>
      <Card variant="base">
        {error && (
          <div style={{ color: 'var(--color-coral-dark)', backgroundColor: 'var(--color-error)', padding: '12px', borderRadius: '8px', marginBottom: '16px' }}>
            {error}
          </div>
        )}

        {success && (
          <div style={{ color: 'var(--color-on-primary)', backgroundColor: 'var(--color-success)', padding: '12px', borderRadius: '8px', marginBottom: '16px' }}>
            Data berhasil disimpan! Mengalihkan ke halaman utama...
          </div>
        )}

        <div 
          style={{ 
            border: '2px dashed var(--color-brand-yellow-deep)', 
            padding: '40px', 
            textAlign: 'center',
            borderRadius: '12px',
            marginBottom: '24px',
            backgroundColor: file ? 'var(--color-surface-yellow)' : 'var(--color-surface-yellow)',
            transition: 'background-color 0.2s ease'
          }}
        >
          <input 
            type="file" 
            accept="application/pdf"
            onChange={e => setFile(e.target.files?.[0] || null)} 
            style={{ marginBottom: '16px' }}
          />
          <p style={{ fontSize: '14px', color: 'var(--color-slate)' }}>
            Hanya menerima file berformat .pdf (Maks 5MB)
          </p>
        </div>

        <Button onClick={handleUpload} disabled={!file || loading} variant="primary">
          {loading ? 'Sedang Membaca...' : 'Ekstrak Data Invoice'}
        </Button>

        {previewData && (
          <div style={{ marginTop: '32px', borderTop: '1px solid var(--color-hairline)', paddingTop: '24px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px' }}>Hasil Ekstraksi</h3>
            <pre style={{ 
              backgroundColor: 'var(--color-surface)', 
              padding: '16px', 
              borderRadius: '8px',
              fontSize: '13px',
              overflowX: 'auto'
            }}>
              {JSON.stringify(previewData, null, 2)}
            </pre>
            
            <div style={{ marginTop: '16px', display: 'flex', gap: '12px' }}>
              <Button variant="secondary" onClick={() => setPreviewData(null)}>Batal</Button>
              <Button variant="yellow" onClick={handleSave} disabled={saving}>
                {saving ? 'Menyimpan...' : 'Simpan sebagai Proyek Berjalan'}
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};
