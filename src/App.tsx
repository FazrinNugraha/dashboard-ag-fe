import { useState, useEffect } from 'react';
import { Layout } from './components/layout/Layout';
import { StatRow } from './components/dashboard/StatRow';
import { ProjectTable } from './components/dashboard/ProjectTable';
import { NewProjectModal } from './components/dashboard/NewProjectModal';
import { useDashboard, useProjects } from './hooks/useApi';
import { API_BASE } from './lib/api';
import { ExpensePage } from './pages/ExpensePage';
import { ScanInvoicePage } from './pages/ScanInvoicePage';
import { LoginPage } from './pages/LoginPage';
import { ReportPage } from './pages/ReportPage';
import { ReceivablesPage } from './pages/ReceivablesPage';
import { format } from 'date-fns';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [username, setUsername] = useState('');

  // Fungsi untuk mengecek sesi (cookie)
  const checkSession = async () => {
    try {
      const res = await fetch(`${API_BASE}/auth/me`, { credentials: 'include' });
      if (res.ok) {
        const me = await res.json();
        setUsername(me.username ?? '');
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
      }
    } catch {
      setIsAuthenticated(false);
    }
  };

  useEffect(() => {
    checkSession();
  }, []);

  // State untuk navigasi tab
  const [activeTab, setActiveTab] = useState('Ringkasan Utama');
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);


  // State untuk filter bulan (default bulan ini: "YYYY-MM")
  const [currentMonth, setCurrentMonth] = useState(() => format(new Date(), 'yyyy-MM'));
  const [projectMonth, setProjectMonth] = useState(''); // Default kosong (Lihat Semua)

  // Ambil data dari backend (hanya setelah login, agar tidak kena 401)
  const isAuthed = isAuthenticated === true;
  const { data: dashboardData, loading: dashLoading } = useDashboard(currentMonth, isAuthed);
  const { projects } = useProjects(projectMonth, isAuthed);

  // Judul + deskripsi per tab (ditampilkan sejajar dengan Sinkronkan Sheets di header)
  const pageMeta: Record<string, { title: string; subtitle: string }> = {
    'Ringkasan Utama': { title: 'Ringkasan Keuangan', subtitle: 'Pantau metrik utama per bulan.' },
    'Proyek & Klien': { title: 'Daftar Proyek & Klien', subtitle: 'Daftar semua proyek klien yang berjalan dan riwayat bulan sebelumnya.' },
    'Pantau Piutang': { title: 'Pantau Piutang', subtitle: 'Monitoring sisa tagihan klien yang belum lunas sepenuhnya.' },
    'Scan Invoice (Masuk)': { title: 'Scan Invoice Masuk (PDF)', subtitle: 'Unggah file PDF invoice untuk diekstrak secara otomatis oleh AI.' },
    'Catat Pengeluaran': { title: 'Catat Pengeluaran Baru', subtitle: 'Masukkan rincian pengeluaran kas operasional atau proyek.' },
    'Laporan (Sheets)': { title: 'Pusat Laporan', subtitle: 'Unduh laporan keuangan otomatis dalam bentuk Excel atau PDF, atau akses langsung ke Google Sheets.' },
  };

  const meta = pageMeta[activeTab] ?? pageMeta['Ringkasan Utama'];

  // Fungsi untuk me-render konten berdasarkan tab yang aktif
  const renderContent = () => {
    if (activeTab === 'Proyek & Klien') {
      return (
        <ProjectTable
          projects={projects}
          filterMonth={projectMonth}
          onFilterMonthChange={setProjectMonth}
          onAddProject={() => setIsProjectModalOpen(true)}
        />
      );
    }

    if (activeTab === 'Pantau Piutang') {
      return <ReceivablesPage />;
    }

    if (activeTab === 'Scan Invoice (Masuk)') {
      return <ScanInvoicePage />;
    }

    if (activeTab === 'Catat Pengeluaran') {
      return <ExpensePage />;
    }

    if (activeTab === 'Laporan (Sheets)') {
      return <ReportPage />;
    }

    // Default: Ringkasan Utama
    if (dashLoading) {
      return (
        <div style={{ padding: '40px', textAlign: 'center', color: 'var(--color-slate)' }}>
          Memuat data dari server...
        </div>
      );
    }

    const kpi = dashboardData?.kpi || {};
    const allTime = dashboardData?.all_time || { omzet: 0, jumlah_proyek: 0 };
    const trend = dashboardData?.trend || [];
    const expenseBreakdown = dashboardData?.expense_breakdown || [];

    return (
      <div style={{ paddingTop: '8px' }}>
        <StatRow
          kpi={kpi}
          allTime={allTime}
          trend={trend}
          expenseBreakdown={expenseBreakdown}
          currentMonth={currentMonth}
          onMonthChange={setCurrentMonth}
        />
      </div>
    );
  };

  if (isAuthenticated === null) {
    return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Memuat...</div>;
  }

  if (isAuthenticated === false) {
    return (
      <LoginPage
        onSuccess={(user) => {
          setUsername(user);
          setIsAuthenticated(true);
        }}
      />
    );
  }

  return (
    <Layout
      activeTab={activeTab}
      onTabChange={setActiveTab}
      pageTitle={meta.title}
      pageSubtitle={meta.subtitle}
      username={username}
    >
      {renderContent()}
      {isProjectModalOpen && <NewProjectModal onClose={() => setIsProjectModalOpen(false)} />}
    </Layout>
  );
}

export default App;
