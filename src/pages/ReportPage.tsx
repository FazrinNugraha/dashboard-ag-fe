import React, { useState, useEffect } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Select } from '../components/ui/Select';
import { API_BASE } from '../lib/api';
import { 
  FileSpreadsheet, 
  FileText, 
  Table, 
  Download, 
  ExternalLink, 
  Calendar, 
  Loader2 
} from 'lucide-react';

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
    <div style={{ maxWidth: '1000px', margin: '0 auto', paddingTop: '8px', paddingBottom: '32px' }}>
      {/* Filter Bar Terpadu */}
      <Card variant="base" style={{ padding: '16px', marginBottom: '20px' }}>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '34px', height: '34px', borderRadius: 'var(--rounded-full)',
              backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-hairline)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-ink)',
              flexShrink: 0
            }}>
              <Calendar size={16} />
            </div>
            <div>
              <h3 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-ink)', margin: 0 }}>
                Filter Periode Laporan
              </h3>
              <p style={{ fontSize: '12px', color: 'var(--color-steel)', margin: '1px 0 0' }}>
                Pilih rentang waktu untuk mengunduh rekapitulasi data
              </p>
            </div>
          </div>

          {/* Controls: wrap di mobile */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
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
                value={monthValue}
                onChange={(e) => setMonthValue(e.target.value)}
                style={{
                  height: '38px',
                  borderRadius: 'var(--rounded-full)',
                  border: '1px solid var(--color-hairline-strong)',
                  backgroundColor: 'var(--color-canvas)',
                  padding: '0 14px',
                  fontSize: '13px',
                  fontFamily: 'inherit',
                  color: 'var(--color-ink)',
                  outline: 'none',
                  cursor: 'pointer'
                }}
              />
            ) : (
              <input 
                type="number" 
                value={yearValue}
                onChange={(e) => setYearValue(e.target.value)}
                min="2020"
                max="2100"
                style={{
                  height: '38px',
                  width: '90px',
                  borderRadius: 'var(--rounded-full)',
                  border: '1px solid var(--color-hairline-strong)',
                  backgroundColor: 'var(--color-canvas)',
                  padding: '0 14px',
                  fontSize: '13px',
                  fontFamily: 'inherit',
                  color: 'var(--color-ink)',
                  outline: 'none'
                }}
              />
            )}
          </div>
        </div>
      </Card>

      {/* Grid kartu: 1 kolom di mobile, auto-fit di sm+ */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 260px), 1fr))',
        gap: '16px'
      }}>
        {/* Kartu 1: Laporan Excel */}
        <Card variant="base" hoverEffect style={{ padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
              <div style={{
                width: '38px', height: '38px', borderRadius: 'var(--rounded-md)',
                backgroundColor: '#ecfdf5', color: '#059669',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <FileSpreadsheet size={20} />
              </div>
              <Badge variant="promo">.XLSX</Badge>
            </div>
            <h4 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--color-ink)', marginBottom: '4px' }}>
              Laporan Excel
            </h4>
            <p style={{ fontSize: '13px', color: 'var(--color-slate)', lineHeight: 1.4, margin: 0 }}>
              Rekap tabular otomatis dengan formula yang kompatibel untuk Microsoft Excel.
            </p>
          </div>

          <Button 
            variant="primary" 
            onClick={() => handleExport('xlsx')}
            disabled={loading !== null}
            style={{ width: '100%', height: '38px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
          >
            {loading === 'xlsx' ? (
              <>
                <Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} />
                <span>Memproses...</span>
              </>
            ) : (
              <>
                <Download size={15} />
                <span>Unduh Excel</span>
              </>
            )}
          </Button>
        </Card>

        {/* Kartu 2: Laporan PDF */}
        <Card variant="base" hoverEffect style={{ padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
              <div style={{
                width: '38px', height: '38px', borderRadius: 'var(--rounded-md)',
                backgroundColor: '#fef2f2', color: '#dc2626',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <FileText size={20} />
              </div>
              <Badge variant="tag-coral">.PDF</Badge>
            </div>
            <h4 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--color-ink)', marginBottom: '4px' }}>
              Laporan PDF
            </h4>
            <p style={{ fontSize: '13px', color: 'var(--color-slate)', lineHeight: 1.4, margin: 0 }}>
              Format cetak rapi lengkap dengan tabel ringkasan keuangan untuk pembukuan.
            </p>
          </div>

          <Button 
            variant="primary" 
            onClick={() => handleExport('pdf')}
            disabled={loading !== null}
            style={{ width: '100%', height: '38px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
          >
            {loading === 'pdf' ? (
              <>
                <Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} />
                <span>Memproses...</span>
              </>
            ) : (
              <>
                <Download size={15} />
                <span>Unduh PDF</span>
              </>
            )}
          </Button>
        </Card>

        {/* Kartu 3: Google Sheets Live */}
        <Card variant="base" hoverEffect style={{ padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
              <div style={{
                width: '38px', height: '38px', borderRadius: 'var(--rounded-md)',
                backgroundColor: '#fefce8', color: '#ca8a04',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <Table size={20} />
              </div>
              <Badge variant="tag-yellow">LIVE SYNC</Badge>
            </div>
            <h4 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--color-ink)', marginBottom: '4px' }}>
              Google Sheets
            </h4>
            <p style={{ fontSize: '13px', color: 'var(--color-slate)', lineHeight: 1.4, margin: 0 }}>
              Database mentah cloud yang tersinkronisasi otomatis setiap saat.
            </p>
          </div>

          {spreadsheetUrl ? (
            <a href={spreadsheetUrl} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', display: 'block', width: '100%' }}>
              <Button 
                variant="secondary" 
                style={{ width: '100%', height: '38px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
              >
                <ExternalLink size={15} />
                <span>Buka Sheets</span>
              </Button>
            </a>
          ) : (
            <Button 
              variant="secondary" 
              disabled 
              style={{ width: '100%', height: '38px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <span>Memuat Link...</span>
            </Button>
          )}
        </Card>
      </div>
    </div>
  );
};
