import React from 'react';
import { AppUser } from '../types';
import { ShieldCheck, X, Check, Trash2, Clock, AlertCircle } from 'lucide-react';

interface AdminApprovalModalProps {
  isOpen: boolean;
  onClose: () => void;
  pendingAdmins: AppUser[];
  onApprove: (adminId: string) => void;
  onReject: (adminId: string) => void;
}

export const AdminApprovalModal: React.FC<AdminApprovalModalProps> = ({
  isOpen,
  onClose,
  pendingAdmins,
  onApprove,
  onReject
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative w-full max-w-xl bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-rose-700" />
            <h2 className="text-base font-semibold text-slate-900">
              Solicitações de Novos Administradores
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-900 flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <strong className="font-semibold block mb-0.5">Política de Segurança Multi-Admin</strong>
              O cadastro do primeiro administrador do sistema é ativado automaticamente. A partir dele, qualquer solicitação para privilégios de Administrador requer aprovação de um dos administradores ativos.
            </div>
          </div>

          {pendingAdmins.length === 0 ? (
            <div className="py-8 text-center text-slate-500 text-xs">
              Não há solicitações de novos administradores pendentes no momento.
            </div>
          ) : (
            <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
              {pendingAdmins.map((admin) => (
                <div
                  key={admin.id}
                  className="p-4 border border-slate-200 rounded-lg bg-white shadow-xs space-y-3"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-sm font-semibold text-slate-900">{admin.name}</h4>
                      <p className="text-xs text-slate-500 font-mono-numbers">{admin.email} · {admin.phone}</p>
                      {admin.cro && (
                        <p className="text-xs text-slate-600 mt-0.5">
                          CRO: <span className="font-mono-numbers font-medium">{admin.cro}</span>
                        </p>
                      )}
                    </div>
                    <span className="text-[11px] font-medium text-amber-700 bg-amber-100 px-2 py-0.5 rounded flex items-center gap-1 font-mono-numbers">
                      <Clock className="w-3 h-3" />
                      {new Date(admin.registeredAt).toLocaleDateString('pt-BR')}
                    </span>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                    <button
                      onClick={() => onReject(admin.id)}
                      className="px-3 py-1.5 text-xs font-medium text-rose-700 hover:bg-rose-50 border border-rose-200 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Rejeitar
                    </button>
                    <button
                      onClick={() => onApprove(admin.id)}
                      className="px-3.5 py-1.5 text-xs font-semibold text-white bg-teal-700 hover:bg-teal-800 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <Check className="w-3.5 h-3.5" />
                      Aprovar Administrador
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="pt-3 border-t border-slate-200 flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
