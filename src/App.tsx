import { useState, useEffect } from 'react';
import { Layout } from './components/layout/Layout';
import { StatRow } from './components/dashboard/StatRow';
import { ProjectTable } from './components/dashboard/ProjectTable';
import { NewProjectModal } from './components/dashboard/NewProjectModal';
import { useDashboard, useProjects } from './hooks/useApi';
import { ExpensePage } from './pages/ExpensePage';
import { ScanInvoicePage } from './pages/ScanInvoicePage';
import { LoginPage } from './pages/LoginPage';
import { ReportPage } from './pages/ReportPage';
import { ReceivablesPage } from './pages/ReceivablesPage';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  
  // Fungsi untuk mengecek sesi (cookie)
  const checkSession = async () => {
    try {
      const res = await fetch('http://localhost:8000/api/v1/auth/me', { credentials: 'include' });
      if (res.ok) {
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
  const [currentMonth] = useState(() => format(new Date(), 'yyyy-MM'));

  // Ambil data dari backend
  const { data: dashboardData, loading: dashLoading } = useDashboard(currentMonth);
  const { projects, loading: projLoading } = useProjects(currentMonth);

  // Fungsi untuk me-render konten berdasarkan tab yang aktif
  const renderContent = () => {
    if (activeTab === 'Proyek & Klien') {
      return (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <div>
              <h2 style={{ fontSize: '24px', fontWeight: 600, color: 'var(--color-ink)' }}>Daftar Proyek & Klien</h2>
              <p style={{ fontSize: '14px', color: 'var(--color-slate)' }}>Daftar semua proyek klien yang berjalan dan riwayat bulan sebelumnya.</p>
            </div>
            <button className="btn btn-primary" onClick={() => setIsProjectModalOpen(true)}>+ Proyek Baru</button>
          </div>
          <ProjectTable projects={projects} />
        </>
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

    const kpi = dashboardData?.kpi || {
      omzet: { value: 0 },
      kas_masuk: { value: 0 },
      pengeluaran: { value: 0 },
    };

    return (
      <div style={{ paddingTop: '8px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: 600, color: 'var(--color-ink)' }}>Ringkasan Keuangan</h2>
        <p style={{ fontSize: '14px', color: 'var(--color-slate)', marginBottom: '24px' }}>Oktober 2026</p>
        <StatRow kpi={kpi} />
      </div>
    );
  };

  if (isAuthenticated === null) {
    return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Memuat...</div>;
  }

  if (isAuthenticated === false) {
    return <LoginPage onSuccess={() => setIsAuthenticated(true)} />;
  }

  return (
    <Layout activeTab={activeTab} onTabChange={setActiveTab}>
      {renderContent()}
      {isProjectModalOpen && <NewProjectModal onClose={() => setIsProjectModalOpen(false)} />}
    </Layout>
  );
}

export default App;
