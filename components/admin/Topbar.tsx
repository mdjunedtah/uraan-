'use client';

import { Search, User, Menu } from 'lucide-react';
import NotificationBell from './NotificationBell';

type TopbarProps = {
  onMenuClick?: () => void;
};

export default function Topbar({ onMenuClick }: TopbarProps) {
  return (
    <header className="bg-white border-b border-[rgba(184,137,58,0.18)] py-3 px-4 md:px-6 flex items-center justify-between gap-3 flex-shrink-0">
      <div className="flex items-center gap-2 sm:gap-3 flex-1 max-w-md min-w-0">
        <button
          onClick={onMenuClick}
          aria-label="Open menu"
          className="lg:hidden w-9 h-9 -ml-1 rounded-full grid place-items-center hover:bg-[#fbf8f1] text-[#1a1410] flex-shrink-0"
        >
          <Menu size={20} />
        </button>
        <Search size={14} className="text-[#9a8c75] flex-shrink-0" />
        <input
          type="text"
          placeholder="Search anything..."
          className="flex-1 bg-transparent outline-none text-sm min-w-0"
        />
      </div>

      <div className="flex items-center gap-3 flex-shrink-0">
        <NotificationBell />
        <div className="flex items-center gap-2 pl-3 border-l border-[rgba(184,137,58,0.18)]">
          <div className="w-9 h-9 rounded-full bg-[#b8893a]/10 grid place-items-center text-[#b8893a]">
            <User size={16} />
          </div>
          <div className="hidden md:block">
            <div className="text-xs font-semibold text-[#1a1410]">Admin</div>
            <div className="text-[10px] text-[#9a8c75]">admin@omgauriputra.com</div>
          </div>
        </div>
      </div>
    </header>
  );
}
