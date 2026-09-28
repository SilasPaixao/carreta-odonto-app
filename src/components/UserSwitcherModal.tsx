import React from 'react';
import { AppUser } from '../types';
import { Users, X, Shield, PlusCircle, CheckCircle2, Clock } from 'lucide-react';

interface UserSwitcherModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: AppUser;
  users: AppUser[];
  onSelectUser: (user: AppUser) => void;
  onOpenRegister: () => void;
}

export const UserSwitcherModal: React.FC<UserSwitcherModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  users,
  onSelectUser,
  onOpenRegister
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative w-full max-w-lg bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-teal-700" />
            <h2 className="text-base font-semibold text-slate-900">
              Alternar Usuário / Simulação de Perfil
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
          <p className="text-xs text-slate-600 leading-relaxed">
            Selecione uma conta para testar o sistema com a visão e as permissões específicas daquele papel operacional (Admin, Coordenador, Cirurgião-Dentista, Motorista, Almoxarife, etc.).
          </p>

          <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
            {users.map((user) => {
              const isCurrent = user.id === currentUser.id;
              const isPending = user.status === 'pending_approval';

              return (
                <div
                  key={user.id}
                  onClick={() => {
                    if (!isPending) {
                      onSelectUser(user);
                      onClose();
                    }
                  }}
                  className={`w-full p-3 rounded-lg border text-left flex items-center justify-between transition-colors ${
                    isCurrent
                      ? 'border-teal-600 bg-teal-50/50'
                      : isPending
                      ? 'border-amber-200 bg-amber-50/30 opacity-80 cursor-not-allowed'
                      : 'border-slate-200 hover:bg-slate-50 hover:border-slate-300 cursor-pointer'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs ${
                        user.role === 'Admin'
                          ? 'bg-rose-100 text-rose-800'
                          : user.role === 'Coordenador'
                          ? 'bg-amber-100 text-amber-800'
                          : user.role === 'Cirurgião-Dentista'
                          ? 'bg-teal-100 text-teal-800'
                          : user.role === 'Motorista'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {user.name.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-slate-900">{user.name}</span>
                        {isCurrent && (
                          <span className="text-[11px] font-medium text-teal-700 bg-teal-100/60 px-1.5 py-0.5 rounded">
                            Ativo Agora
                          </span>
                        )}
                        {isPending && (
                          <span className="text-[11px] font-medium text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded flex items-center gap-1">
                            <Clock className="w-3 h-3" /> Aguardando Aprovação
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                        <span className="font-medium text-slate-700">{user.role}</span>
                        {user.cro && (
                          <>
                            <span aria-hidden="true">·</span>
                            <span className="font-mono-numbers">CRO: {user.cro}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {!isPending && isCurrent && (
                    <CheckCircle2 className="w-5 h-5 text-teal-600 shrink-0" />
                  )}
                </div>
              );
            })}
          </div>

          <div className="pt-3 border-t border-slate-200 flex justify-between items-center">
            {currentUser.role === 'Admin' ? (
              <button
                onClick={() => {
                  onClose();
                  onOpenRegister();
                }}
                className="text-xs font-semibold text-teal-700 hover:text-teal-800 flex items-center gap-1.5 cursor-pointer py-1"
              >
                <PlusCircle className="w-4 h-4" />
                Cadastrar Novo Administrador / Usuário
              </button>
            ) : (
              <div />
            )}
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
