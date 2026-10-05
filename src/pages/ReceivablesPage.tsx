import React, { useState, useEffect } from 'react';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Select } from '../components/ui/Select';
import { Clock } from 'lucide-react';
import { API_BASE } from '../lib/api';

export const ReceivablesPage: React.FC = () => {
  const [data, setData] = useState<{ data: any[], total_piutang: number, jumlah_klien: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [monthFilter, setMonthFilter] = useState(''); // Default kosong (Lihat Semua)
  const [payoffModal, setPayoffModal] = useState<{ isOpen: boolean, idProyek: string, namaKlien: string, sisa: number, idemKey: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetch(`${API_BASE}/receivables`, { credentials: 'include' })
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

  const handlePayoffClick = (idProyek: string, namaKlien: string, sisa: number) => {
    // Kunci idempotency per pembukaan modal: cegah pembayaran tercatat dobel
    // saat double-click / retry.
    setPayoffModal({ isOpen: true, idProyek, namaKlien, sisa, idemKey: crypto.randomUUID() });
  };

  const handlePayoffConfirm = async () => {
    if (!payoffModal) return;
    setIsSubmitting(true);

    try {
      const res = await fetch(`${API_BASE}/projects/${payoffModal.idProyek}/payments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
          'Idempotency-Key': payoffModal.idemKey
        },
        credentials: 'include',
        body: JSON.stringify({ nominal: payoffModal.sisa })
      });

      if (!res.ok) {
        const err = await res.json();
        alert(`Gagal mencatat pelunasan: ${err.error?.message || err.detail || 'Terjadi kesalahan'}`);
      } else {
        alert('Pelunasan berhasil dicatat!');
        window.location.reload();
      }
    } catch (error) {
      console.error(error);
      alert('Terjadi kesalahan jaringan.');
    } finally {
      setIsSubmitting(false);
      setPayoffModal(null);
    }
  };

  // Filter lokal berdasarkan bulan jika monthFilter disetel
  const filteredReceivables = monthFilter
    ? receivables.filter(r => r.bulan_filter === monthFilter)
    : receivables;

  // Hitung ulang total piutang untuk bulan yang dipilih
  const displayTotal = filteredReceivables.reduce((acc, curr) => acc + curr.sisa_piutang, 0);
  const displayCount = filteredReceivables.length;

  return (
    <div style={{ paddingTop: '8px', paddingBottom: '40px' }}>
      <Card variant="yellow" style={{ padding: 'var(--spacing-xxl)', marginBottom: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '24px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: 500, marginBottom: '4px', opacity: 0.85 }}>
            <Clock size={16} />
            Total Sisa Piutang Keseluruhan
          </div>
          <div style={{ fontSize: '40px', fontWeight: 500, letterSpacing: '-1px', lineHeight: 1.15 }}>
            {formatRp(displayTotal)}
          </div>
          <div style={{ fontSize: '13px', marginTop: '8px', opacity: 0.75 }}>
            Dari total {displayCount} proyek {monthFilter ? 'di bulan ini' : 'aktif'} yang belum lunas
          </div>
        </div>
        <div style={{
          width: '56px', height: '56px', borderRadius: 'var(--rounded-full)',
          backgroundColor: 'rgba(255,255,255,0.65)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
        }}>
          <Clock size={28} color="var(--color-primary)" />
        </div>
      </Card>

      {/* Filter + Segarkan: di bawah banner piutang */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--color-ink)' }}>Rincian Tagihan per Klien</h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Select
            value={monthFilter}
            onChange={setMonthFilter}
            placeholder="Lihat Semua"
            options={[
              { value: '', label: 'Lihat Semua' },
              { value: '2026-05', label: 'Mei 2026' },
              { value: '2026-06', label: 'Juni 2026' },
              { value: '2026-07', label: 'Juli 2026' },
              { value: '2026-08', label: 'Agustus 2026' },
              { value: '2026-09', label: 'September 2026' },
              { value: '2026-10', label: 'Oktober 2026' },
            ]}
          />
          <Button variant="secondary" onClick={() => window.location.reload()}>
            <i className="ph ph-arrows-clockwise" style={{ marginRight: '8px' }}></i> Segarkan
          </Button>
        </div>
      </div>

      {filteredReceivables.length === 0 ? (
        <Card variant="base" style={{ padding: '40px', textAlign: 'center' }}>
          <div style={{ fontSize: '48px', color: 'var(--color-success)', marginBottom: '16px' }}><i className="ph ph-check-circle"></i></div>
          <h4 style={{ fontSize: '18px', fontWeight: 500, marginBottom: '8px' }}>Luar Biasa!</h4>
          <p style={{ color: 'var(--color-slate)' }}>Tidak ada piutang yang tertunggak{monthFilter ? ' pada bulan ini' : ''}.</p>
        </Card>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
          {filteredReceivables.map((item, idx) => {
            const isLate = item.umur_hari > 30;
            return (
              <Card key={idx} variant="base" style={{ padding: '24px' }} hoverEffect>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                  <div>
                    <p style={{ fontSize: '12px', fontWeight: 500, color: 'var(--color-steel)', marginBottom: '6px', letterSpacing: '0.3px' }}>{item.id_proyek}</p>
                    <h4 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--color-ink)', marginBottom: '4px' }}>{item.nama_klien}</h4>
                    <p style={{ fontSize: '13px', color: 'var(--color-slate)' }}>{item.pekerjaan}</p>
                  </div>
                  <Badge variant={isLate ? 'tag-coral' : 'tag-yellow'}>
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
                  <span style={{ fontSize: '13px', color: 'var(--color-coral-dark)' }}>Sisa Tagihan</span>
                  <span style={{ fontSize: '20px', fontWeight: 600, color: 'var(--color-coral-dark)' }}>{formatRp(item.sisa_piutang)}</span>
                </div>

                <div style={{ marginTop: '20px' }}>
                  <Button
                    variant="primary"
                    style={{ width: '100%', justifyContent: 'center' }}
                    onClick={() => handlePayoffClick(item.id_proyek, item.nama_klien, item.sisa_piutang)}
                  >
                    Catat Pelunasan
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {payoffModal && payoffModal.isOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(5, 0, 56, 0.45)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: 'var(--color-canvas)', borderRadius: 'var(--rounded-xl)', padding: 'var(--spacing-xxl)',
            width: '100%', maxWidth: '400px', boxShadow: 'var(--shadow-modal)'
          }}>
            <div style={{ fontSize: '48px', color: 'var(--color-primary)', marginBottom: '16px', textAlign: 'center' }}>
              <i className="ph ph-hand-coins"></i>
            </div>
            <h3 style={{ fontSize: '20px', fontWeight: 600, color: 'var(--color-ink)', textAlign: 'center', marginBottom: '8px' }}>
              Catat Pelunasan
            </h3>
            <p style={{ fontSize: '14px', color: 'var(--color-slate)', textAlign: 'center', marginBottom: '24px', lineHeight: '1.5' }}>
              Anda akan mencatat pelunasan untuk tagihan <strong>{payoffModal.namaKlien}</strong> sebesar
              <span style={{ display: 'block', fontSize: '24px', fontWeight: 600, color: 'var(--color-ink)', marginTop: '12px' }}>
                {formatRp(payoffModal.sisa)}
              </span>
            </p>

            <div style={{ display: 'flex', gap: 'var(--spacing-sm)', marginTop: 'var(--spacing-xl)' }}>
              <Button
                variant="secondary"
                style={{ flex: 1, justifyContent: 'center' }}
                onClick={() => setPayoffModal(null)}
                disabled={isSubmitting}
              >
                Batal
              </Button>
              <Button
                variant="primary"
                style={{ flex: 1, justifyContent: 'center' }}
                onClick={handlePayoffConfirm}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Memproses...' : 'Konfirmasi'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
