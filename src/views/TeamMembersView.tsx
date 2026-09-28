import React, { useState } from 'react';
import { AppUser, UserRole, MobileUnit } from '../types';
import { Users, UserPlus, ShieldCheck, Check, Trash2, Clock, CheckCircle2, AlertCircle, Truck, Edit3, AlertTriangle, ShieldAlert } from 'lucide-react';

interface TeamMembersViewProps {
  users: AppUser[];
  units: MobileUnit[];
  currentUser: AppUser;
  onOpenRegisterModal: () => void;
  onApproveAdmin: (adminId: string) => void;
  onRejectAdmin: (adminId: string) => void;
  onUpdateUser: (user: AppUser) => void;
  onDeleteUser: (userId: string) => void;
}

export const TeamMembersView: React.FC<TeamMembersViewProps> = ({
  users,
  units,
  currentUser,
  onOpenRegisterModal,
  onApproveAdmin,
  onRejectAdmin,
  onUpdateUser,
  onDeleteUser
}) => {
  const [roleFilter, setRoleFilter] = useState<string>('all');

  // Modals state
  const [editingMember, setEditingMember] = useState<AppUser | null>(null);
  const [deletingMember, setDeletingMember] = useState<AppUser | null>(null);
  const [adminDeletionTarget, setAdminDeletionTarget] = useState<AppUser | null>(null);

  // Edit form states
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editRole, setEditRole] = useState<UserRole>('Cirurgião-Dentista');
  const [editCro, setEditCro] = useState('');
  const [editAssignedUnitIds, setEditAssignedUnitIds] = useState<string[]>([]);
  const [editHasAllUnits, setEditHasAllUnits] = useState(false);

  const pendingAdmins = users.filter(u => u.role === 'Admin' && u.status === 'pending_approval');
  const activeMembers = users.filter(u => u.status === 'active');

  // Requirement: "Apenas o admin pode cadastrar novos profissionais, e aceitar outros admins"
  const canRegister = currentUser.role === 'Admin';

  const filteredMembers = activeMembers.filter(m => {
    if (roleFilter !== 'all' && m.role !== roleFilter) return false;
    return true;
  });

  const handleOpenEdit = (member: AppUser) => {
    setEditingMember(member);
    setEditName(member.name);
    setEditEmail(member.email);
    setEditPhone(member.phone);
    setEditRole(member.role);
    setEditCro(member.cro || '');
    setEditAssignedUnitIds(member.assignedUnitIds || []);
    setEditHasAllUnits(member.hasAccessToAllUnits || false);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMember || !editName.trim() || !editEmail.trim()) return;

    const updated: AppUser = {
      ...editingMember,
      name: editName.trim(),
      email: editEmail.trim(),
      phone: editPhone.trim(),
      role: editRole,
      cro: editCro.trim() || undefined,
      assignedUnitIds: editAssignedUnitIds,
      hasAccessToAllUnits: editHasAllUnits
    };

    onUpdateUser(updated);
    setEditingMember(null);
  };

  const handleScheduleAdminDeletion = () => {
    if (!adminDeletionTarget) return;

    // 90 days = ~3 months
    const threeMonthsFromNow = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString();

    const updated: AppUser = {
      ...adminDeletionTarget,
      pendingDeletionRequestedAt: new Date().toISOString(),
      pendingDeletionRequestedBy: currentUser.name,
      deletionEffectiveAfter: threeMonthsFromNow
    };

    onUpdateUser(updated);
    setAdminDeletionTarget(null);
  };

  const handleCancelAdminDeletion = (targetAdmin: AppUser) => {
    const updated: AppUser = {
      ...targetAdmin,
      pendingDeletionRequestedAt: undefined,
      pendingDeletionRequestedBy: undefined,
      deletionEffectiveAfter: undefined
    };
    onUpdateUser(updated);
  };

  const isThreeMonthsElapsed = (effectiveDate?: string) => {
    if (!effectiveDate) return false;
    return new Date(effectiveDate).getTime() <= Date.now();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Corpo Clínico & Equipe Operacional
          </h1>
          <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
            <span>Cirurgiões-Dentistas, TSB, ASB, Prótese, Motoristas e Gestão</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono-numbers">{activeMembers.length} profissionais ativos</span>
          </div>
        </div>

        {canRegister && (
          <button
            onClick={onOpenRegisterModal}
            className="px-4 py-2 text-xs font-semibold text-white bg-teal-700 hover:bg-teal-800 rounded-lg shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            Cadastrar Profissional / Motorista
          </button>
        )}
      </div>

      {/* Pending Admin Approvals Box (prominent if user is active admin) */}
      {currentUser.role === 'Admin' && pendingAdmins.length > 0 && (
        <div className="p-5 bg-rose-50 border border-rose-200 rounded-xl shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-rose-700" />
              <h3 className="text-sm font-bold text-rose-950">
                Aprovações Pendentes de Administradores ({pendingAdmins.length})
              </h3>
            </div>
            <span className="text-xs text-rose-700 font-medium font-mono-numbers">
              Exigência Multi-Admin
            </span>
          </div>
          <p className="text-xs text-rose-800">
            Por política de segurança, novos administradores necessitam da sua autorização para obter privilégios plenos no sistema.
          </p>

          <div className="divide-y divide-rose-200/70 border border-rose-200 rounded-lg bg-white overflow-hidden">
            {pendingAdmins.map(admin => (
              <div key={admin.id} className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div>
                  <div className="font-semibold text-slate-900">{admin.name}</div>
                  <div className="text-slate-500 font-mono-numbers">{admin.email} · {admin.phone}</div>
                  {admin.cro && <div className="text-slate-600 mt-0.5 font-mono-numbers">CRO: {admin.cro}</div>}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onRejectAdmin(admin.id)}
                    className="px-3 py-1.5 text-xs font-medium text-rose-700 hover:bg-rose-50 border border-rose-200 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Rejeitar
                  </button>
                  <button
                    onClick={() => onApproveAdmin(admin.id)}
                    className="px-3.5 py-1.5 text-xs font-semibold text-white bg-teal-700 hover:bg-teal-800 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5" />
                    Aprovar Administrador
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Role filter */}
      <div className="p-3.5 bg-white border border-slate-200 rounded-lg flex items-center justify-between gap-3 text-xs">
        <span className="text-slate-700 font-medium">Filtrar por Função / Cargo:</span>
        <select
          value={roleFilter}
          onChange={e => setRoleFilter(e.target.value)}
          className="px-3 py-1.5 border border-slate-300 rounded-md bg-white text-slate-800 text-xs focus:ring-1 focus:ring-teal-600"
        >
          <option value="all">Todas as Funções</option>
          <option value="Admin">Admin</option>
          <option value="Coordenador">Coordenador</option>
          <option value="Cirurgião-Dentista">Cirurgião-Dentista</option>
          <option value="Técnico em Saúde Bucal (TSB)">Técnico em Saúde Bucal (TSB)</option>
          <option value="Auxiliar em Saúde Bucal (ASB)">Auxiliar em Saúde Bucal (ASB)</option>
          <option value="Técnico em Prótese Dentária (TPD)">Técnico em Prótese Dentária (TPD)</option>
          <option value="Auxiliar em Prótese Dentária (APD)">Auxiliar em Prótese Dentária (APD)</option>
          <option value="Motorista">Motorista</option>
          <option value="Almoxarife">Almoxarife</option>
          <option value="Recepcionista / Atendente">Recepcionista / Atendente</option>
          <option value="Gestor Financeiro">Gestor Financeiro</option>
          <option value="Outro">Outro</option>
        </select>
      </div>

      {/* Members table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="p-3">Nome do Profissional</th>
                <th className="p-3">Função / Cargo</th>
                <th className="p-3">Registro CRO</th>
                <th className="p-3">Carreta(s) Vinculada(s)</th>
                <th className="p-3">Contato / E-mail</th>
                <th className="p-3">Status</th>
                <th className="p-3">Data de Ingresso</th>
                {currentUser.role === 'Admin' && <th className="p-3 text-right">Ações</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredMembers.map(member => {
                const assignedUnits = units.filter(u => member.assignedUnitIds?.includes(u.id));
                const seesAllUnits = member.role === 'Admin' || (member.role === 'Coordenador' && member.hasAccessToAllUnits !== false);
                const isSelf = member.id === currentUser.id;
                const isPendingDeletion = !!member.pendingDeletionRequestedAt;
                const canPurgeExpiredAdmin = isPendingDeletion && isThreeMonthsElapsed(member.deletionEffectiveAfter);

                return (
                  <tr key={member.id} className="hover:bg-slate-50/70">
                    <td className="p-3">
                      <div className="font-semibold text-slate-900">{member.name}</div>
                      {member.isFirstAdmin && (
                        <span className="text-[10px] text-teal-700 bg-teal-50 border border-teal-200 px-1.5 py-0.5 rounded font-medium mt-0.5 inline-block">
                          Primeiro Administrador (Fundador)
                        </span>
                      )}

                      {/* Pending Deletion Warning Callout */}
                      {isPendingDeletion && (
                        <div className="mt-1.5 p-2 bg-amber-50 border border-amber-200 rounded-lg text-[10px] text-amber-900 leading-tight space-y-1">
                          <div className="flex items-center gap-1 font-bold text-amber-950">
                            <AlertTriangle className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                            <span>Exclusão Agendada por Inatividade (3 Meses)</span>
                          </div>
                          <p>
                            Solicitada por <strong>{member.pendingDeletionRequestedBy}</strong> em{' '}
                            {new Date(member.pendingDeletionRequestedAt || '').toLocaleDateString('pt-BR')}.
                          </p>
                          <p className="text-amber-800">
                            Prazo limite de carência:{' '}
                            <strong className="font-mono-numbers text-amber-950">
                              {new Date(member.deletionEffectiveAfter || '').toLocaleDateString('pt-BR')}
                            </strong>. A conta só será apagada se passar este período completo sem nenhum acesso.
                          </p>
                        </div>
                      )}
                    </td>
                    <td className="p-3">
                      <span
                        className={`font-medium ${
                          member.role === 'Admin'
                            ? 'text-rose-800 font-bold'
                            : member.role === 'Coordenador'
                            ? 'text-amber-800'
                            : member.role === 'Cirurgião-Dentista'
                            ? 'text-teal-800 font-semibold'
                            : member.role === 'Motorista'
                            ? 'text-blue-800'
                            : 'text-slate-800'
                        }`}
                      >
                        {member.role}
                      </span>
                    </td>
                    <td className="p-3 font-mono-numbers">
                      {member.cro ? (
                        <span className="font-medium text-slate-800">{member.cro}</span>
                      ) : (
                        <span className="text-slate-400">Não aplicável</span>
                      )}
                    </td>
                    <td className="p-3">
                      {seesAllUnits ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                          <Truck className="w-3 h-3 text-teal-600" />
                          Todas as Carretas
                        </span>
                      ) : assignedUnits.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {assignedUnits.map(u => (
                            <span
                              key={u.id}
                              className="inline-flex items-center gap-1 text-[10px] font-medium text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200"
                            >
                              <Truck className="w-2.5 h-2.5 text-slate-500" />
                              {u.identifier.split(' - ')[0]}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-slate-400 text-xs">Nenhuma atribuída</span>
                      )}
                    </td>
                    <td className="p-3 text-slate-600 font-mono-numbers">
                      <div>{member.phone}</div>
                      <div className="text-slate-400 text-[11px]">{member.email}</div>
                    </td>
                    <td className="p-3">
                      {isPendingDeletion ? (
                        <span className="text-amber-800 bg-amber-50 px-2 py-0.5 rounded text-[11px] font-semibold border border-amber-200">
                          ⏳ Exclusão Pendente (90 dias)
                        </span>
                      ) : (
                        <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded text-[11px] font-semibold border border-emerald-200">
                          ● Ativo
                        </span>
                      )}
                    </td>
                    <td className="p-3 font-mono-numbers text-slate-500">
                      {new Date(member.registeredAt).toLocaleDateString('pt-BR')}
                    </td>

                    {/* Action Column for Admins */}
                    {currentUser.role === 'Admin' && (
                      <td className="p-3 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenEdit(member)}
                            className="px-2 py-1 text-[11px] font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded border border-slate-300 transition-colors flex items-center gap-1 cursor-pointer"
                            title="Editar Dados do Usuário"
                          >
                            <Edit3 className="w-3 h-3 text-slate-600" />
                            Editar
                          </button>

                          {/* Delete logic adhering to Admin protection: */}
                          {!isSelf && (
                            <>
                              {member.role === 'Admin' ? (
                                isPendingDeletion ? (
                                  canPurgeExpiredAdmin ? (
                                    <button
                                      onClick={() => onDeleteUser(member.id)}
                                      className="px-2 py-1 text-[11px] font-semibold text-white bg-rose-700 hover:bg-rose-800 rounded shadow-2xs transition-colors flex items-center gap-1 cursor-pointer"
                                      title="3 meses se passaram sem nenhum acesso. Efetivar exclusão definitiva."
                                    >
                                      <Trash2 className="w-3 h-3" />
                                      Efetivar Exclusão
                                    </button>
                                  ) : (
                                    <button
                                      onClick={() => handleCancelAdminDeletion(member)}
                                      className="px-2 py-1 text-[11px] font-semibold text-amber-800 bg-amber-50 hover:bg-amber-100 rounded border border-amber-300 transition-colors cursor-pointer"
                                      title="Cancelar agendamento de exclusão deste administrador"
                                    >
                                      Cancelar Exclusão
                                    </button>
                                  )
                                ) : (
                                  <button
                                    onClick={() => setAdminDeletionTarget(member)}
                                    className="px-2 py-1 text-[11px] font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded border border-rose-200 transition-colors flex items-center gap-1 cursor-pointer"
                                    title="Solicitar exclusão com carência de 3 meses sem acesso"
                                  >
                                    <Trash2 className="w-3 h-3 text-rose-600" />
                                    Excluir
                                  </button>
                                )
                              ) : (
                                <button
                                  onClick={() => setDeletingMember(member)}
                                  className="px-2 py-1 text-[11px] font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded border border-rose-200 transition-colors flex items-center gap-1 cursor-pointer"
                                  title="Excluir Usuário da Equipe"
                                >
                                  <Trash2 className="w-3 h-3 text-rose-600" />
                                  Excluir
                                </button>
                              )}
                            </>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Edit Member */}
      {editingMember && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="relative w-full max-w-lg bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
              <div className="flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-teal-700" />
                <h3 className="text-base font-semibold text-slate-900">
                  Editar Cadastro do Profissional
                </h3>
              </div>
              <button
                onClick={() => setEditingMember(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nome Completo *
                </label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    E-mail Corporativo *
                  </label>
                  <input
                    type="email"
                    required
                    value={editEmail}
                    onChange={e => setEditEmail(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-600 font-mono-numbers"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Telefone / WhatsApp
                  </label>
                  <input
                    type="text"
                    value={editPhone}
                    onChange={e => setEditPhone(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-600 font-mono-numbers"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Função / Cargo *
                  </label>
                  <select
                    value={editRole}
                    onChange={e => setEditRole(e.target.value as UserRole)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-600 bg-white"
                  >
                    <option value="Admin">Admin (Administrador)</option>
                    <option value="Coordenador">Coordenador</option>
                    <option value="Cirurgião-Dentista">Cirurgião-Dentista</option>
                    <option value="Técnico em Saúde Bucal (TSB)">Técnico em Saúde Bucal (TSB)</option>
                    <option value="Auxiliar em Saúde Bucal (ASB)">Auxiliar em Saúde Bucal (ASB)</option>
                    <option value="Técnico em Prótese Dentária (TPD)">Técnico em Prótese Dentária (TPD)</option>
                    <option value="Auxiliar em Prótese Dentária (APD)">Auxiliar em Prótese Dentária (APD)</option>
                    <option value="Motorista">Motorista</option>
                    <option value="Almoxarife">Almoxarife</option>
                    <option value="Recepcionista / Atendente">Recepcionista / Atendente</option>
                    <option value="Gestor Financeiro">Gestor Financeiro</option>
                    <option value="Outro">Outro</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Registro Profissional (CRO)
                  </label>
                  <input
                    type="text"
                    value={editCro}
                    onChange={e => setEditCro(e.target.value)}
                    placeholder="Ex: SP-CD-12345"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-600 font-mono-numbers"
                  />
                </div>
              </div>

              {/* Unit Allocation */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Atribuição de Carretas / Unidades Móveis
                </label>
                <div className="space-y-1.5 p-3 bg-slate-50 border border-slate-200 rounded-lg">
                  <label className="flex items-center gap-2 text-xs text-slate-800 font-medium">
                    <input
                      type="checkbox"
                      checked={editHasAllUnits}
                      onChange={e => setEditHasAllUnits(e.target.checked)}
                      className="rounded text-teal-600 focus:ring-teal-500"
                    />
                    Acesso global a todas as carretas da frota
                  </label>

                  {!editHasAllUnits && (
                    <div className="pt-2 border-t border-slate-200/80 space-y-1">
                      <span className="text-[11px] text-slate-500 block mb-1">
                        Selecione as unidades específicas permitidas:
                      </span>
                      {units.map(unit => {
                        const checked = editAssignedUnitIds.includes(unit.id);
                        return (
                          <label key={unit.id} className="flex items-center gap-2 text-xs text-slate-700">
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={e => {
                                if (e.target.checked) {
                                  setEditAssignedUnitIds([...editAssignedUnitIds, unit.id]);
                                } else {
                                  setEditAssignedUnitIds(editAssignedUnitIds.filter(id => id !== unit.id));
                                }
                              }}
                              className="rounded text-teal-600 focus:ring-teal-500"
                            />
                            <span>{unit.identifier} ({unit.plate})</span>
                          </label>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingMember(null)}
                  className="px-4 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-teal-700 hover:bg-teal-800 rounded-lg transition-colors cursor-pointer"
                >
                  Salvar Alterações
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Special Admin Deletion with 3-Month Inactivity Requirement */}
      {adminDeletionTarget && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="relative w-full max-w-lg bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden p-6 space-y-4">
            <div className="flex items-center gap-3 text-amber-700">
              <div className="p-2.5 bg-amber-50 rounded-full">
                <ShieldAlert className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Política de Proteção entre Administradores
                </h3>
                <span className="text-xs text-amber-700 font-medium">
                  Carência obrigatória de 3 meses (90 dias) sem acesso
                </span>
              </div>
            </div>

            <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-950 space-y-2 leading-relaxed">
              <p>
                <strong>Regra de Governança do Sistema:</strong> Um administrador <strong>não pode apagar diretamente outro administrador</strong> de forma instantânea.
              </p>
              <p>
                Ao confirmar esta solicitação para o administrador <strong className="text-slate-900">{adminDeletionTarget.name}</strong>, a conta será marcada com um agendamento de 3 meses:
              </p>
              <ul className="list-disc list-inside space-y-1 text-slate-800 pt-1">
                <li>
                  A conta <strong>só será excluída definitivamente após 3 meses</strong> completos caso o administrador <strong>permaneça sem acessar o sistema</strong>.
                </li>
                <li>
                  Se ele <strong>fizer login na conta dele a qualquer momento</strong> dentro deste período, a solicitação de exclusão é <strong>cancelada e revogada automaticamente</strong>.
                </li>
              </ul>
            </div>

            <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setAdminDeletionTarget(null)}
                className="px-4 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
              >
                Voltar
              </button>
              <button
                type="button"
                onClick={handleScheduleAdminDeletion}
                className="px-4 py-2 text-xs font-semibold text-white bg-amber-700 hover:bg-amber-800 rounded-lg transition-colors cursor-pointer"
              >
                Confirmar Agendamento de Exclusão (3 Meses)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Direct Deletion for Non-Admin Members */}
      {deletingMember && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="relative w-full max-w-md bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden p-6 space-y-4">
            <div className="flex items-center gap-3 text-rose-700">
              <div className="p-2.5 bg-rose-50 rounded-full">
                <Trash2 className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">
                Confirmar Exclusão de Membro da Equipe
              </h3>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Você tem certeza que deseja excluir o cadastro do profissional{' '}
              <strong className="text-slate-900">{deletingMember.name}</strong> ({deletingMember.role})?
              Esta ação revogará o acesso dele ao sistema de carretas.
            </p>

            <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setDeletingMember(null)}
                className="px-4 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  onDeleteUser(deletingMember.id);
                  setDeletingMember(null);
                }}
                className="px-4 py-2 text-xs font-semibold text-white bg-rose-700 hover:bg-rose-800 rounded-lg transition-colors cursor-pointer"
              >
                Sim, Excluir Profissional
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
