import React, { useState, useEffect } from 'react';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';

export const ReceivablesPage: React.FC = () => {
  const [data, setData] = useState<{data: any[], total_piutang: number, jumlah_klien: number} | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:8000/api/v1/receivables', { credentials: 'include' })
      .then(res => res.json())
      .then(json => {
        setData(json);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const formatRp = (num: number) => 
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(num);

  if (loading) {
    return <div style={{ padding: '40px', textAlign: 'center', color: 'var(--color-slate)' }}>Memuat data piutang...</div>;
  }

  const receivables = data?.data || [];

  return (
    <div style={{ paddingBottom: '40px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: 600, color: 'var(--color-ink)' }}>Pantau Piutang</h2>
          <p style={{ fontSize: '14px', color: 'var(--color-slate)' }}>Monitoring sisa tagihan klien yang belum lunas sepenuhnya.</p>
        </div>
        <Button variant="secondary" onClick={() => window.location.reload()}>
          <i className="ph ph-arrows-clockwise" style={{ marginRight: '8px' }}></i> Segarkan
        </Button>
      </div>

      <Card variant="coral" style={{ padding: '40px', marginBottom: '32px', textAlign: 'center' }}>
        <div style={{ fontSize: '16px', fontWeight: 500, marginBottom: '8px', opacity: 0.9 }}>Total Sisa Piutang Keseluruhan</div>
        <div style={{ fontSize: '48px', fontWeight: 600, letterSpacing: '-1px' }}>
          {formatRp(data?.total_piutang || 0)}
        </div>
        <div style={{ fontSize: '14px', marginTop: '12px', opacity: 0.8 }}>
          Dari total {data?.jumlah_klien || 0} proyek aktif yang belum lunas
        </div>
      </Card>

      <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px', color: 'var(--color-ink)' }}>Rincian Tagihan per Klien</h3>
      
      {receivables.length === 0 ? (
        <Card variant="base" style={{ padding: '40px', textAlign: 'center' }}>
          <div style={{ fontSize: '48px', color: 'var(--color-success)', marginBottom: '16px' }}><i className="ph ph-check-circle"></i></div>
          <h4 style={{ fontSize: '18px', fontWeight: 500, marginBottom: '8px' }}>Luar Biasa!</h4>
          <p style={{ color: 'var(--color-slate)' }}>Semua proyek saat ini sudah lunas. Tidak ada piutang yang tertunggak.</p>
        </Card>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
          {receivables.map((item, idx) => {
            const isLate = item.umur_hari > 30;
            return (
              <Card key={idx} variant="base" style={{ padding: '24px' }} hoverEffect>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                  <div>
                    <h4 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--color-ink)', marginBottom: '4px' }}>{item.nama_klien}</h4>
                    <p style={{ fontSize: '13px', color: 'var(--color-slate)' }}>{item.pekerjaan}</p>
                  </div>
                  <Badge variant={isLate ? 'rose' : 'yellow'}>
                    {isLate ? 'Lebih 30 Hari' : 'Berjalan'}
                  </Badge>
                </div>
                
                <div style={{ borderTop: '1px solid var(--color-hairline)', borderBottom: '1px solid var(--color-hairline)', padding: '16px 0', margin: '16px 0', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                    <span style={{ color: 'var(--color-slate)' }}>Nilai Proyek</span>
                    <span style={{ fontWeight: 500 }}>{formatRp(item.nilai_proyek)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                    <span style={{ color: 'var(--color-slate)' }}>Telah Dibayar</span>
                    <span style={{ fontWeight: 500, color: 'var(--color-success)' }}>{formatRp(item.total_dibayar)}</span>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '13px', color: 'var(--color-coral-deep)' }}>Sisa Tagihan</span>
                  <span style={{ fontSize: '20px', fontWeight: 600, color: 'var(--color-coral-deep)' }}>{formatRp(item.sisa_piutang)}</span>
                </div>

                <div style={{ marginTop: '20px' }}>
                  <Button variant="primary" style={{ width: '100%', justifyContent: 'center' }}>
                    Catat Pelunasan
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};
