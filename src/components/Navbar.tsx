import React from 'react';
import { AppUser, VehicleOccurrence } from '../types';
import { ShieldCheck, AlertTriangle, Users, LogOut, RefreshCw } from 'lucide-react';

interface NavbarProps {
  currentUser: AppUser;
  pendingAdminsCount: number;
  unresolvedOccurrencesCount: number;
  onOpenSwitchUser: () => void;
  onOpenPendingAdmins: () => void;
  onNavigateToOccurrences: () => void;
  onResetData: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  pendingAdminsCount,
  unresolvedOccurrencesCount,
  onOpenSwitchUser,
  onOpenPendingAdmins,
  onNavigateToOccurrences,
  onResetData
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Zone 1: Single text element wordmark as per Top Bar Contract */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-teal-800 text-white flex items-center justify-center font-bold text-sm tracking-tight shadow-xs">
              OM
            </div>
            <a href="/" className="text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap">
              OdontoMóvel
            </a>
          </div>

          {/* Zone 2: Navigation & Context indicators */}
          <div className="hidden md:flex items-center gap-6 text-xs text-slate-600 font-medium">
            <span>Controle Central de Carretas Odontológicas</span>
            <span aria-hidden="true" className="text-slate-300">·</span>
            <span className="font-mono-numbers text-slate-500">v2.4 Estável</span>
          </div>

          {/* Zone 3: Primary actions */}
          <div className="flex items-center gap-3">
            {/* Occurrences Alert Button */}
            {unresolvedOccurrencesCount > 0 && (
              <button
                onClick={onNavigateToOccurrences}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg transition-colors cursor-pointer"
                title={`${unresolvedOccurrencesCount} ocorrência(s) em aberto`}
              >
                <AlertTriangle className="w-4 h-4 text-amber-600 animate-pulse" />
                <span className="font-mono-numbers">{unresolvedOccurrencesCount}</span>
                <span className="hidden sm:inline">alerta{unresolvedOccurrencesCount > 1 ? 's' : ''}</span>
              </button>
            )}

            {/* Pending Admin Approvals Button (if admin and there are pending admins) */}
            {currentUser.role === 'Admin' && pendingAdminsCount > 0 && (
              <button
                onClick={onOpenPendingAdmins}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-900 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors cursor-pointer"
                title="Novo administrador aguardando sua aprovação"
              >
                <ShieldCheck className="w-4 h-4 text-rose-600" />
                <span className="font-mono-numbers">{pendingAdminsCount}</span>
                <span className="hidden sm:inline">aprovação pendente</span>
              </button>
            )}

            {/* User Switcher / Profile button */}
            <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
              <button
                onClick={onOpenSwitchUser}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs hover:bg-slate-100 border border-slate-200 transition-colors text-left cursor-pointer"
              >
                <div className="w-6 h-6 rounded-full bg-teal-100 text-teal-800 flex items-center justify-center font-semibold text-xs">
                  {currentUser.name.charAt(0)}
                </div>
                <div className="max-w-[140px] truncate">
                  <div className="font-semibold text-slate-800 truncate">{currentUser.name}</div>
                  <div className="text-[11px] text-slate-500 truncate">{currentUser.role}</div>
                </div>
                <Users className="w-3.5 h-3.5 text-slate-400 ml-1" />
              </button>

              <button
                onClick={onResetData}
                title="Restaurar dados de demonstração padrão"
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
