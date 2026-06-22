import type { AppView } from '../types';
import { assetUrl } from '../utils/assetUrl';
import { SidebarTimer } from './SidebarTimer';

interface SidebarProps {
  view: AppView;
  dark: boolean;
  elapsed: number;
  timerVisible: boolean;
  timerWaiting: boolean;
  timerRunning: boolean;
  onNavigate: (view: AppView) => void;
  onToggleDark: () => void;
  onNewQuestions: () => void;
  onGoTimer: () => void;
  onStopTimer: () => void;
}

export function Sidebar({
  view,
  dark,
  elapsed,
  timerVisible,
  timerWaiting,
  timerRunning,
  onNavigate,
  onToggleDark,
  onNewQuestions,
  onGoTimer,
  onStopTimer,
}: SidebarProps) {
  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <img src={assetUrl('mathies-logo.png?v=5')} alt="Mathies" className="brand-logo" />
      </div>

      <nav className="sidebar-nav">
        <button
          className={`nav-item ${view === 'practice' ? 'active' : ''}`}
          type="button"
          onClick={onNewQuestions}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M23 4v6h-6" />
            <path d="M1 20v-6h6" />
            <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
          </svg>
          Setup
        </button>
        <button
          className={`nav-item ${view === 'tally' ? 'active' : ''}`}
          type="button"
          onClick={() => onNavigate('tally')}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="20" x2="18" y2="10" />
            <line x1="12" y1="20" x2="12" y2="4" />
            <line x1="6" y1="20" x2="6" y2="14" />
          </svg>
          Class tally
        </button>
      </nav>

      <SidebarTimer
        elapsed={elapsed}
        visible={timerVisible}
        waiting={timerWaiting}
        running={timerRunning}
        onGo={onGoTimer}
        onStop={onStopTimer}
      />

      <div className="sidebar-footer">
        <button className="nav-item" type="button" onClick={onToggleDark}>
          {dark ? (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="5" />
              <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
            </svg>
          )}
          {dark ? 'Light mode' : 'Dark mode'}
        </button>
        <p className="sidebar-credit">Powered by Mr C</p>
      </div>
    </aside>
  );
}
