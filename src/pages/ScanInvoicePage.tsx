import React, { useState } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

export const ScanInvoicePage: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [previewData, setPreviewData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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
        if (res.status === 401 || res.status === 403) {
           throw new Error('Fitur ini dilindungi. Anda belum login atau token Anda kadaluarsa.');
        }
        throw new Error('Gagal mengekstrak invoice.');
      }

      const json = await res.json();
      setPreviewData(json);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '700px', margin: '0 auto' }}>
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: 600 }}>Scan Invoice Masuk (PDF)</h2>
        <p style={{ color: 'var(--color-slate)' }}>Unggah file PDF invoice untuk diekstrak secara otomatis oleh AI.</p>
      </div>

      <Card variant="base">
        {error && (
          <div style={{ color: 'var(--color-on-primary)', backgroundColor: 'var(--color-error)', padding: '12px', borderRadius: '8px', marginBottom: '16px' }}>
            {error}
          </div>
        )}

        <div 
          style={{ 
            border: '2px dashed var(--color-hairline-strong)', 
            padding: '40px', 
            textAlign: 'center',
            borderRadius: '12px',
            marginBottom: '24px',
            backgroundColor: file ? 'var(--color-surface)' : 'transparent'
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
            
            <div style={{ marginTop: '16px' }}>
              <Button variant="yellow">Simpan ke Proyek (Draft)</Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};
