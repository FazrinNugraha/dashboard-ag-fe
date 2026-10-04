import React from 'react';
import { Card } from '../ui/Card';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, PieChart, Pie, Cell } from 'recharts';
import './Dashboard.css';

interface KpiData {
  value: number;
  prev?: number;
  delta?: number;
  delta_pct?: number;
}

interface StatRowProps {
  kpi: {
    omzet: KpiData;
    kas_masuk: KpiData;
    pengeluaran: KpiData;
  };
}

const dataLine = [
  { name: 'Mei', value: 95 },
  { name: 'Jun', value: 110 },
  { name: 'Jul', value: 105 },
  { name: 'Agu', value: 125 },
  { name: 'Sep', value: 115 },
  { name: 'Okt', value: 137 }
];

const dataPie = [
  { name: 'Bahan Aluminium & Kaca', value: 400, color: 'var(--color-brand-blue)' },
  { name: 'Aksesoris & Sealant', value: 300, color: 'var(--color-brand-teal)' },
  { name: 'Upah Tukang', value: 300, color: 'var(--color-brand-yellow-deep)' },
  { name: 'Operasional', value: 200, color: 'var(--color-charcoal)' },
];

export const StatRow: React.FC<StatRowProps> = ({ kpi }) => {
  const formatRp = (num: number) => 
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(num);

  const laba = kpi.kas_masuk.value - kpi.pengeluaran.value;
  const piutang = 32700000; // static for prototype logic

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      
      {/* Banner Utama: Bergaya Miro (Putih Canvas, Teks Besar, Elegan) */}
      <Card variant="feature" style={{ padding: '64px 40px', textAlign: 'center', backgroundColor: 'var(--color-canvas)', border: 'none', borderBottom: '1px solid var(--color-hairline)' }}>
          <h1 style={{ fontSize: '60px', fontWeight: 500, letterSpacing: '-1.5px', lineHeight: 1.1, marginBottom: '16px' }}>
            Rp 687.300.000
          </h1>
          <p style={{ fontSize: '18px', color: 'var(--color-slate)' }}>
            Omzet Keseluruhan (All-Time) dari total 65 proyek
          </p>
      </Card>

      {/* KPI Cards: Menggunakan Pastel Miro Design */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px' }}>
          
          <Card variant="teal" hoverEffect>
              <div style={{ fontSize: '16px', fontWeight: 500, marginBottom: '8px', opacity: 0.9 }}>Pemasukan Kotor (Omzet)</div>
              <div style={{ fontSize: '36px', fontWeight: 500, letterSpacing: '-0.5px' }}>
                {formatRp(kpi.kas_masuk.value || 137300000)}
              </div>
          </Card>
          
          <Card variant="rose" hoverEffect>
              <div style={{ fontSize: '16px', fontWeight: 500, marginBottom: '8px', opacity: 0.9 }}>Total Pengeluaran</div>
              <div style={{ fontSize: '36px', fontWeight: 500, letterSpacing: '-0.5px' }}>
                {formatRp(kpi.pengeluaran.value || 82500000)}
              </div>
          </Card>

          <Card variant="yellow" hoverEffect>
              <div style={{ fontSize: '16px', fontWeight: 500, marginBottom: '8px', opacity: 0.9 }}>Laba Bersih</div>
              <div style={{ fontSize: '36px', fontWeight: 500, letterSpacing: '-0.5px' }}>
                {formatRp(laba || 54800000)}
              </div>
          </Card>

          <Card variant="coral" hoverEffect>
              <div style={{ fontSize: '16px', fontWeight: 500, marginBottom: '8px', opacity: 0.9 }}>Sisa Piutang Klien</div>
              <div style={{ fontSize: '36px', fontWeight: 500, letterSpacing: '-0.5px' }}>
                {formatRp(piutang)}
              </div>
          </Card>
      </div>

      {/* Charts dengan styling Base Card */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
          <Card variant="base">
              <h3 style={{ fontSize: '18px', fontWeight: 500, marginBottom: '24px' }}>Tren Pertumbuhan Omzet</h3>
              <div style={{ height: '300px', width: '100%' }}>
                 <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={dataLine} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-hairline)" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 14, fill: 'var(--color-slate)' }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 14, fill: 'var(--color-slate)' }} />
                      <RechartsTooltip cursor={{ stroke: 'var(--color-hairline)' }} contentStyle={{ borderRadius: '8px', border: '1px solid var(--color-hairline)' }} />
                      <Line type="monotone" dataKey="value" stroke="var(--color-brand-blue)" strokeWidth={4} dot={{ r: 6, fill: 'var(--color-canvas)', stroke: 'var(--color-brand-blue)', strokeWidth: 3 }} />
                    </LineChart>
                  </ResponsiveContainer>
              </div>
          </Card>
          
          <Card variant="base">
              <h3 style={{ fontSize: '18px', fontWeight: 500, marginBottom: '24px' }}>Komposisi Pengeluaran</h3>
              <div style={{ height: '240px', width: '100%' }}>
                 <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={dataPie}
                        cx="50%"
                        cy="50%"
                        innerRadius={70}
                        outerRadius={90}
                        paddingAngle={4}
                        dataKey="value"
                        stroke="none"
                      >
                        {dataPie.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <RechartsTooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: 'var(--shadow-modal)' }} />
                    </PieChart>
                  </ResponsiveContainer>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '12px', marginTop: '16px' }}>
                {dataPie.map((item, i) => (
                   <div key={i} style={{ display: 'flex', alignItems: 'center', fontSize: '14px', color: 'var(--color-slate)' }}>
                      <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: item.color, marginRight: '8px' }}></div>
                      {item.name}
                   </div>
                ))}
              </div>
          </Card>
      </div>
    </div>
  );
};
