import React, { useEffect, useState } from 'react';
import './LoadingScreen.css';

/**
 * Layar loading awal (cold start Render).
 * Ditampilkan selama pengecekan sesi; begitu login/dashboard muncul,
 * artinya server sudah "bangun". Setelah beberapa detik, muncul hint cold start.
 */
export const LoadingScreen: React.FC = () => {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, []);

  const isColdStart = seconds >= 6;

  return (
    <div className="loading-screen">
      <div className="loading-card">
        <div className="loading-brand">
          <img src="/logo-icon.png" alt="Logo Agungjaya Aluminium" className="loading-logo" />
          <span className="loading-brand-name">AGUNGJAYA ALUMINIUM</span>
        </div>

        <p className="loading-status">
          Menghubungkan ke server
          <span className="loading-dots">
            <span>.</span>
            <span>.</span>
            <span>.</span>
          </span>
        </p>

        <p className={`loading-hint ${isColdStart ? 'loading-hint--visible' : ''}`}>
          {isColdStart
            ? 'Server sedang dibangunkan (cold start). Mohon tunggu 30–60 detik...'
            : 'Menyiapkan data...'}
        </p>

        {/* Skeleton indikator aktivitas */}
        <div className="skeleton">
          <div className="skeleton-title" />
          <div className="skeleton-row">
            <div className="skeleton-block" />
            <div className="skeleton-block" />
            <div className="skeleton-block" />
          </div>
          <div className="skeleton-line" />
          <div className="skeleton-line skeleton-line--short" />
        </div>

        <span className="loading-elapsed">{seconds}s</span>
      </div>
    </div>
  );
};