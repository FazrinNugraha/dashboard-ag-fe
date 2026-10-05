import React, { useState, useEffect } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Select } from '../components/ui/Select';
import { API_BASE } from '../lib/api';

export const ReportPage: React.FC = () => {
  const [spreadsheetUrl, setSpreadsheetUrl] = useState('');
  const [period, setPeriod] = useState('month');
  const [monthValue, setMonthValue] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  });
  const [yearValue, setYearValue] = useState(() => new Date().getFullYear().toString());
  const [loading, setLoading] = useState<string | null>(null);

  useEffect(() => {
    // Ambil tautan asli Google Sheets dari Backend
    fetch(`${API_BASE}/reports/spreadsheet-link`, { credentials: 'include' })
      .then(res => res.json())
      .then(data => setSpreadsheetUrl(data.url))
      .catch(console.error);
  }, []);

  const handleExport = async (format: 'xlsx' | 'pdf') => {
    setLoading(format);
    const value = period === 'month' ? monthValue : yearValue;
    const url = `${API_BASE}/reports/export?period=${period}&value=${value}&format=${format}`;
    
    try {
      const res = await fetch(url, { credentials: 'include' });
      if (!res.ok) {
        throw new Error('Gagal mengunduh laporan.');
      }
      
      const blob = await res.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = `Laporan_Agungjaya_${value}.${format}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      alert(error);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', paddingBottom: '40px', paddingTop: '8px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '24px' }}>
        
        {/* Pengaturan Filter */}
        <Card variant="base" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px' }}>Filter Laporan</h3>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
            <Select
              value={period}
              onChange={setPeriod}
              options={[
                { value: 'month', label: 'Bulanan' },
                { value: 'year', label: 'Tahunan' },
              ]}
            />

            {period === 'month' ? (
              <input 
                type="month" 
                className="input input-text"
                value={monthValue}
                onChange={(e) => setMonthValue(e.target.value)}
                style={{ width: 'auto' }}
              />
            ) : (
              <input 
                type="number" 
                className="input input-text"
                value={yearValue}
                onChange={(e) => setYearValue(e.target.value)}
                style={{ width: 'auto' }}
                min="2020"
                max="2100"
              />
            )}
          </div>
        </Card>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px' }}>
          {/* Card Export Excel */}
          <Card variant="teal" style={{ padding: '32px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }} hoverEffect>
            <div style={{ width: '64px', height: '64px', backgroundColor: 'var(--color-canvas)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px', fontSize: '32px', color: 'var(--color-brand-teal)' }}>
              <i className="ph ph-file-xls"></i>
            </div>
            <h3 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '8px' }}>Laporan Excel</h3>
            <p style={{ fontSize: '14px', marginBottom: '24px', opacity: 0.9 }}>
              Unduh rekapitulasi data format .xlsx yang kompatibel dengan Microsoft Excel.
            </p>
            <Button 
              variant="primary" 
              onClick={() => handleExport('xlsx')}
              disabled={loading !== null}
              style={{ width: '100%', justifyContent: 'center' }}
            >
              {loading === 'xlsx' ? 'Memproses...' : 'Unduh Excel'}
            </Button>
          </Card>

          {/* Card Export PDF */}
          <Card variant="rose" style={{ padding: '32px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }} hoverEffect>
            <div style={{ width: '64px', height: '64px', backgroundColor: 'var(--color-canvas)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px', fontSize: '32px', color: 'var(--color-moss-dark)' }}>
              <i className="ph ph-file-pdf"></i>
            </div>
            <h3 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '8px' }}>Laporan PDF</h3>
            <p style={{ fontSize: '14px', marginBottom: '24px', opacity: 0.9 }}>
              Unduh laporan rapi siap cetak (.pdf) lengkap dengan tabel dan ringkasan.
            </p>
            <Button 
              variant="primary" 
              onClick={() => handleExport('pdf')}
              disabled={loading !== null}
              style={{ width: '100%', justifyContent: 'center' }}
            >
              {loading === 'pdf' ? 'Memproses...' : 'Unduh PDF'}
            </Button>
          </Card>
        </div>

        {/* Card Google Sheets Link */}
        <Card variant="feature" style={{ padding: '32px', display: 'flex', alignItems: 'center', gap: '24px' }}>
          <div style={{ width: '80px', height: '80px', flexShrink: 0, backgroundColor: 'var(--color-brand-yellow)', borderRadius: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '40px', color: 'var(--color-primary)' }}>
            <i className="ph ph-google-logo"></i>
          </div>
          <div>
            <h3 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '8px' }}>Google Sheets (Database Live)</h3>
            <p style={{ fontSize: '14px', color: 'var(--color-slate)', marginBottom: '16px' }}>
              Lihat seluruh data mentah yang tersimpan secara *real-time* di Google Sheets. Segala perubahan yang Anda lakukan dari Dashboard ini otomatis tersinkronisasi.
            </p>
            {spreadsheetUrl ? (
              <a href={spreadsheetUrl} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
                <Button variant="secondary">Buka Google Sheets</Button>
              </a>
            ) : (
              <Button variant="secondary" disabled>Memuat Tautan...</Button>
            )}
          </div>
        </Card>

      </div>
    </div>
  );
};
