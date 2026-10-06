import React, { useState, useEffect } from 'react';
import { LayoutDashboard, Users, CreditCard, Receipt, FileText, LogOut, RefreshCw, Menu, X } from 'lucide-react';
import { API_BASE } from '../../lib/api';
import './Layout.css';

interface LayoutProps {
  children: React.ReactNode;
  activeTab?: string;
  onTabChange?: (tabName: string) => void;
  pageTitle?: string;
  pageSubtitle?: string;
  username?: string;
}

/**
 * Layout Component — Mobile-First
 * - Mobile  : hamburger → drawer sidebar off-canvas + overlay
 * - Desktop (lg+) : sidebar tetap di kiri
 */
export const Layout: React.FC<LayoutProps> = ({ children, activeTab = 'Dashboard', onTabChange, pageTitle, pageSubtitle, username }) => {
  const [isSyncing, setIsSyncing] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const displayName = (username || '').trim();
  const initial = displayName ? displayName.charAt(0).toUpperCase() : '?';

  // Tutup sidebar saat resize ke desktop
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)');
    const handler = (e: MediaQueryListEvent) => {
      if (e.matches) setIsSidebarOpen(false);
    };
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  // Blokir body scroll saat drawer terbuka
  useEffect(() => {
    document.body.style.overflow = isSidebarOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isSidebarOpen]);

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      const res = await fetch(`${API_BASE}/sync`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'x-requested-with': 'XMLHttpRequest' }
      });
      if (res.ok) {
        window.location.reload();
      } else {
        let detail = '';
        try {
          const body = await res.json();
          detail = body?.error?.message || body?.detail?.message || body?.detail || '';
          if (body?.error?.code) detail = `[${body.error.code}] ${detail}`;
        } catch {
          // respons bukan JSON
        }
        alert(`Gagal menyinkronkan data. (HTTP ${res.status})${detail ? `\n\n${detail}` : ''}`);
      }
    } catch {
      alert('Terjadi kesalahan jaringan.');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await fetch(`${API_BASE}/auth/logout`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'x-requested-with': 'XMLHttpRequest' }
      });
      window.location.reload();
    } catch {
      window.location.reload();
    }
  };

  const handleTabChange = (name: string) => {
    if (onTabChange) onTabChange(name);
    setIsSidebarOpen(false); // tutup drawer setelah pilih menu
  };

  const menus = [
    { name: 'Ringkasan Utama', icon: <LayoutDashboard size={20} aria-hidden="true" /> },
    { name: 'Proyek & Klien', icon: <Users size={20} aria-hidden="true" /> },
    { name: 'Pantau Piutang', icon: <Receipt size={20} aria-hidden="true" /> },
    { name: 'Scan Invoice (Masuk)', icon: <FileText size={20} aria-hidden="true" /> },
    { name: 'Catat Pengeluaran', icon: <CreditCard size={20} aria-hidden="true" /> },
    { name: 'Laporan (Sheets)', icon: <FileText size={20} aria-hidden="true" /> },
  ];

  return (
    <div className="layout-container">
      {/* ── Overlay (mobile drawer backdrop) ───────────────── */}
      {isSidebarOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setIsSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* ── Sidebar ─────────────────────────────────────────── */}
      <aside className={`sidebar${isSidebarOpen ? ' sidebar--open' : ''}`} aria-label="Navigasi utama">
        <div className="sidebar-header">
          <div className="sidebar-brand">
            <img
              src="/logo-icon.png"
              alt="Logo Agungjaya Aluminium"
              className="brand-logo-img"
            />
            <span className="brand-name">AGUNGJAYA ALUMINIUM</span>
          </div>
          {/* Tombol tutup drawer (hanya muncul di mobile) */}
          <button
            className="sidebar-close-btn"
            onClick={() => setIsSidebarOpen(false)}
            aria-label="Tutup menu"
          >
            <X size={22} />
          </button>
        </div>

        <nav className="sidebar-nav">
          {menus.map((menu, idx) => (
            <button
              key={idx}
              className={`nav-item ${activeTab === menu.name ? 'active' : ''}`}
              onClick={() => handleTabChange(menu.name)}
              aria-current={activeTab === menu.name ? 'page' : undefined}
            >
              {menu.icon}
              <span>{menu.name}</span>
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button className="nav-item" onClick={handleLogout} disabled={isLoggingOut} style={{ color: '#d93025' }} aria-label="Keluar dari aplikasi">
            <LogOut size={20} aria-hidden="true" />
            <span>{isLoggingOut ? 'Keluar...' : 'Keluar'}</span>
          </button>
        </div>
      </aside>

      {/* ── Konten Utama ────────────────────────────────────── */}
      <main className="main-content">
        <header className="top-header">
          {/* Hamburger (hanya mobile/tablet) */}
          <button
            className="hamburger-btn"
            onClick={() => setIsSidebarOpen(true)}
            aria-label="Buka menu navigasi"
            aria-expanded={isSidebarOpen}
          >
            <Menu size={22} aria-hidden="true" />
          </button>

          {pageTitle && (
            <div className="header-title">
              <h1>{pageTitle}</h1>
              {pageSubtitle && <p className="header-subtitle">{pageSubtitle}</p>}
            </div>
          )}

          <div className="header-actions">
            <button
              className="sync-btn"
              onClick={handleSync}
              disabled={isSyncing}
              aria-label={isSyncing ? 'Menyinkronkan data...' : 'Sinkronkan ke Google Sheets'}
            >
              <RefreshCw size={16} className={isSyncing ? 'spin-animation' : ''} aria-hidden="true" />
              <span className="sync-btn-label">{isSyncing ? 'Menyinkronkan...' : 'Sinkronkan Sheets'}</span>
            </button>
            <div className="profile-circle" title={displayName ? `Login sebagai ${displayName}` : 'Admin'} role="img" aria-label={`Profil: ${displayName || 'Admin'}`}>
              {initial}
            </div>
          </div>
        </header>

        <div className="content-wrapper">
          {children}
        </div>
      </main>
    </div>
  );
};
