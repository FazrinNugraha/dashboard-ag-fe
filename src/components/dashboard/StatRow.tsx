import React from 'react';
import { Card } from '../ui/Card';
import { Select } from '../ui/Select';
import { ArrowUpRight, ArrowDownRight, Wallet, Clock } from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, PieChart, Pie, Cell } from 'recharts';
import './Dashboard.css';

interface KpiItem {
  value: number;
  prev?: number;
  delta?: number;
  delta_pct?: number;
}

interface Kpis {
  omzet?: KpiItem;
  kas_masuk?: KpiItem;
  pengeluaran?: KpiItem;
  laba_bersih?: { value: number; margin_pct?: number; prev?: number; delta?: number; delta_pct?: number };
  sisa_piutang?: { value: number; jumlah_proyek?: number };
}

interface StatRowProps {
  kpi: Kpis;
  allTime: { omzet: number; jumlah_proyek: number };
  trend: { month: string; omzet: number; laba_bersih: number }[];
  expenseBreakdown: { kategori: string; nominal: number }[];
  currentMonth: string;
  onMonthChange: (month: string) => void;
}

const monthOptions = [
  { value: '2026-05', label: 'Mei 2026' },
  { value: '2026-06', label: 'Juni 2026' },
  { value: '2026-07', label: 'Juli 2026' },
  { value: '2026-08', label: 'Agustus 2026' },
  { value: '2026-09', label: 'September 2026' },
  { value: '2026-10', label: 'Oktober 2026' },
];

const monthNames: Record<string, string> = {
  '01': 'Jan', '02': 'Feb', '03': 'Mar', '04': 'Apr', '05': 'Mei', '06': 'Jun',
  '07': 'Jul', '08': 'Agu', '09': 'Sep', '10': 'Okt', '11': 'Nov', '12': 'Des',
};

const kategoriNames: Record<string, string> = {
  BAHAN_BAKU: 'Bahan Baku',
  AKSESORIS: 'Aksesoris & Hardware',
  UPAH: 'Upah Tukang',
  OPERASIONAL: 'Operasional',
  LAINNYA: 'Lainnya',
};

const pieColors = [
  'var(--color-brand-blue)',
  'var(--color-brand-teal)',
  'var(--color-brand-yellow-deep)',
  'var(--color-charcoal)',
  'var(--color-brand-coral)',
];

export const StatRow: React.FC<StatRowProps> = ({
  kpi,
  allTime,
  trend,
  expenseBreakdown,
  currentMonth,
  onMonthChange,
}) => {
  const formatRp = (num: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(num);

  const omzet = kpi.omzet ?? { value: 0 };
  const pengeluaran = kpi.pengeluaran ?? { value: 0 };
  const laba = kpi.laba_bersih ?? { value: 0, margin_pct: undefined };
  const piutang = kpi.sisa_piutang ?? { value: 0, jumlah_proyek: 0 };

  const formatDelta = (item: KpiItem): string => {
    if (item.delta === undefined || item.prev === undefined || item.prev === 0) return '';
    const pct = item.delta_pct !== undefined ? Math.round(item.delta_pct) : null;
    const arah = item.delta >= 0 ? 'Naik' : 'Turun';
    return `${arah} ${formatRp(Math.abs(item.delta))}${pct !== null ? ` (${pct}%)` : ''} dr bln lalu`;
  };

  const omzetDelta = formatDelta(omzet);
  const pengeluaranDelta = formatDelta(pengeluaran);

  const [year, month] = currentMonth.split('-');
  const periodLabel = `Performa (${monthNames[month] ?? ''} ${year ?? ''})`;

  const dataLine = trend.map((t) => ({
    name: monthNames[t.month.split('-')[1]] ?? t.month,
    value: t.laba_bersih !== undefined ? Math.round(t.laba_bersih / 1000000) : null,
  }));

  const dataPie = expenseBreakdown.map((item, idx) => ({
    name: kategoriNames[item.kategori] ?? item.kategori,
    value: item.nominal,
    color: pieColors[idx % pieColors.length],
  }));

  const iconChipStyle: React.CSSProperties = {
    width: '36px',
    height: '36px',
    borderRadius: 'var(--rounded-lg)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  };

  const cardTitleStyle: React.CSSProperties = {
    fontSize: '14px',
    fontWeight: 500,
    color: 'var(--color-slate)',
  };

  const cardValueStyle: React.CSSProperties = {
    fontSize: '24px',
    fontWeight: 500,
    letterSpacing: '-0.5px',
    lineHeight: 1.2,
  };

  const deltaStyle = (positive: boolean): React.CSSProperties => ({
    display: 'inline-flex',
    alignItems: 'center',
    gap: '2px',
    fontSize: '13px',
    fontWeight: 500,
    color: positive ? 'var(--color-success)' : 'var(--color-coral-dark)',
    marginTop: '8px',
  });

  const subStyle: React.CSSProperties = {
    fontSize: '13px',
    color: 'var(--color-slate)',
    marginTop: '8px',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

      {/* Banner Omzet All-Time: Berdiri sendiri, kuning khas Miro */}
      <Card variant="yellow" hoverEffect style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: 500, marginBottom: '4px', opacity: 0.85 }}>
          <Wallet size={16} />
          Omzet All-Time
        </div>
        <div style={{ fontSize: '40px', fontWeight: 500, letterSpacing: '-1px', lineHeight: 1.15 }}>
          {formatRp(allTime.omzet)}
        </div>
        <div style={{ fontSize: '14px', marginTop: '8px', opacity: 0.75 }}>
          dari total {allTime.jumlah_proyek} proyek keseluruhan
        </div>
      </Card>

      {/* Baris Performa + Filter Bulan */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ fontSize: '18px', fontWeight: 500, color: 'var(--color-ink)' }}>
          {periodLabel}
        </h3>
        <Select
          value={currentMonth}
          onChange={onMonthChange}
          options={monthOptions}
        />
      </div>

      {/* 4 KPI Card Putih dengan icon berwarna + data delta dari API */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>

        <Card variant="base" hoverEffect style={{ padding: 'var(--spacing-xl)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
            <div style={cardTitleStyle}>Pemasukan Kotor (Omzet)</div>
            <div style={{ ...iconChipStyle, backgroundColor: 'var(--color-teal-light)' }}>
              {omzetDelta && (omzet.delta ?? 0) >= 0
                ? <ArrowUpRight size={18} color="var(--color-success)" />
                : <ArrowDownRight size={18} color="var(--color-success)" />}
            </div>
          </div>
          <div style={{ ...cardValueStyle, color: 'var(--color-ink)' }}>
            {formatRp(omzet.value)}
          </div>
          {omzetDelta && (
            <div style={deltaStyle((omzet.delta ?? 0) >= 0)}>
              {(omzet.delta ?? 0) >= 0 ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
              {omzetDelta}
            </div>
          )}
        </Card>

        <Card variant="base" hoverEffect style={{ padding: 'var(--spacing-xl)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
            <div style={cardTitleStyle}>Total Pengeluaran</div>
            <div style={{ ...iconChipStyle, backgroundColor: 'var(--color-coral-light)' }}>
              {pengeluaranDelta && (pengeluaran.delta ?? 0) >= 0
                ? <ArrowUpRight size={18} color="var(--color-coral-dark)" />
                : <ArrowDownRight size={18} color="var(--color-coral-dark)" />}
            </div>
          </div>
          <div style={{ ...cardValueStyle, color: 'var(--color-ink)' }}>
            {formatRp(pengeluaran.value)}
          </div>
          {pengeluaranDelta && (
            <div style={deltaStyle((pengeluaran.delta ?? 0) < 0)}>
              {(pengeluaran.delta ?? 0) >= 0 ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
              {pengeluaranDelta}
            </div>
          )}
        </Card>

        <Card variant="base" hoverEffect style={{ padding: 'var(--spacing-xl)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
            <div style={cardTitleStyle}>Laba Bersih</div>
            <div style={{ ...iconChipStyle, backgroundColor: 'var(--color-surface-pricing-featured)' }}>
              <Wallet size={18} color="var(--color-brand-blue)" />
            </div>
          </div>
          <div style={{ ...cardValueStyle, color: 'var(--color-brand-blue)' }}>
            {formatRp(laba.value)}
          </div>
          {formatDelta(laba) && (
            <div style={deltaStyle((laba.delta ?? 0) >= 0)}>
              {(laba.delta ?? 0) >= 0 ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
              {formatDelta(laba)}
            </div>
          )}
          {laba.margin_pct !== undefined && (
            <div style={subStyle}>Margin Laba: {Math.round(laba.margin_pct)}%</div>
          )}
        </Card>

        <Card variant="base" hoverEffect style={{ padding: 'var(--spacing-xl)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
            <div style={cardTitleStyle}>Sisa Piutang (Klien)</div>
            <div style={{ ...iconChipStyle, backgroundColor: 'var(--color-brand-orange-light)' }}>
              <Clock size={18} color="var(--color-brand-yellow-deep)" />
            </div>
          </div>
          <div style={{ ...cardValueStyle, color: 'var(--color-coral-dark)' }}>
            {formatRp(piutang.value)}
          </div>
          <div style={subStyle}>
            Dari {piutang.jumlah_proyek ?? 0} proyek aktif (Belum Lunas)
          </div>
        </Card>
      </div>

      {/* Charts dengan data asli dari API */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px' }}>
        <Card variant="base">
          <h3 style={{ fontSize: '18px', fontWeight: 500, marginBottom: '24px' }}>Tren Laba Bersih</h3>
          <div style={{ height: '300px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dataLine} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-hairline)" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 14, fill: 'var(--color-slate)' }} />
                <YAxis
                  axisLine={false} tickLine={false} tick={{ fontSize: 14, fill: 'var(--color-slate)' }}
                  tickFormatter={(v: number) => `${v}jt`}
                />
                <RechartsTooltip
                  cursor={{ stroke: 'var(--color-hairline)' }}
                  contentStyle={{ borderRadius: '8px', border: '1px solid var(--color-hairline)' }}
                  formatter={(value: any) => [`${formatRp(Number(value) * 1000000)}`, 'Laba Bersih']}
                />
                <Line connectNulls type="monotone" dataKey="value" stroke="var(--color-brand-blue)" strokeWidth={4} dot={{ r: 6, fill: 'var(--color-canvas)', stroke: 'var(--color-brand-blue)', strokeWidth: 3 }} />
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
