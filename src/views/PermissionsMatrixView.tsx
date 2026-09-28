import React, { useState } from 'react';
import { RolePermissions, UserRole, AppUser, MobileUnit } from '../types';
import { 
  Shield, 
  Check, 
  Lock, 
  Save, 
  CheckCircle2, 
  Info, 
  User, 
  Users, 
  Truck, 
  AlertTriangle, 
  Package, 
  BarChart3, 
  MapPin, 
  SlidersHorizontal,
  Search
} from 'lucide-react';

interface PermissionsMatrixViewProps {
  permissions: RolePermissions;
  users: AppUser[];
  units: MobileUnit[];
  onUpdatePermissions: (newPerms: RolePermissions) => void;
  onUpdateUser: (updatedUser: AppUser) => void;
  onUpdateUsers: (updatedUsers: AppUser[]) => void;
}

type GroupType = 'coordenadores' | 'profissionais_saude' | 'motoristas' | 'almoxarifes';

export const PermissionsMatrixView: React.FC<PermissionsMatrixViewProps> = ({
  permissions,
  users,
  units,
  onUpdatePermissions,
  onUpdateUser,
  onUpdateUsers
}) => {
  const [activeMode, setActiveMode] = useState<'by_group' | 'by_user'>('by_group');
  const [selectedGroup, setSelectedGroup] = useState<GroupType>('coordenadores');
  const [selectedUserId, setSelectedUserId] = useState<string>(
    users.find(u => u.role !== 'Admin')?.id || users[0]?.id || ''
  );
  const [searchTerm, setSearchTerm] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const triggerSuccess = (msg: string) => {
    setSuccessMessage(msg);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const selectedUser = users.find(u => u.id === selectedUserId) || users[0];

  // Group helpers
  const getRolesForGroup = (group: GroupType): UserRole[] => {
    switch (group) {
      case 'coordenadores':
        return ['Coordenador'];
      case 'motoristas':
        return ['Motorista'];
      case 'almoxarifes':
        return ['Almoxarife'];
      case 'profissionais_saude':
        return [
          'Cirurgião-Dentista',
          'Técnico em Saúde Bucal (TSB)',
          'Auxiliar em Saúde Bucal (ASB)',
          'Técnico em Prótese Dentária (TPD)',
          'Auxiliar em Prótese Dentária (APD)',
          'Recepcionista / Atendente',
          'Gestor Financeiro',
          'Outro'
        ];
    }
  };

  const isRoleInPerm = (key: keyof RolePermissions, role: UserRole) => {
    return permissions[key].includes(role);
  };

  const handleToggleGroupPerm = (key: keyof RolePermissions, group: GroupType) => {
    const roles = getRolesForGroup(group);
    const allHaveIt = roles.every(r => permissions[key].includes(r));

    let updatedList: UserRole[];
    if (allHaveIt) {
      // Remove all
      updatedList = permissions[key].filter(r => !roles.includes(r));
    } else {
      // Add missing
      const set = new Set([...permissions[key], ...roles]);
      updatedList = Array.from(set);
    }

    const updated = {
      ...permissions,
      [key]: updatedList
    };
    onUpdatePermissions(updated);
    triggerSuccess('Permissões do grupo atualizadas com sucesso!');
  };

  // User-specific updates
  const handleToggleUserAllUnits = (hasAll: boolean) => {
    if (!selectedUser) return;
    const updatedUser: AppUser = {
      ...selectedUser,
      hasAccessToAllUnits: hasAll,
      // If setting to all, keep existing assignedUnitIds as reference or all
      assignedUnitIds: hasAll ? units.map(u => u.id) : (selectedUser.assignedUnitIds || [units[0]?.id || ''])
    };
    onUpdateUser(updatedUser);
    triggerSuccess(`Acesso à frota de ${selectedUser.name} atualizado!`);
  };

  const handleToggleUserAssignedUnit = (unitId: string) => {
    if (!selectedUser) return;
    const current = selectedUser.assignedUnitIds || [];
    const exists = current.includes(unitId);
    let updatedUnits: string[];
    if (exists) {
      if (current.length === 1) {
        alert('O profissional deve ter pelo menos uma carreta atribuída.');
        return;
      }
      updatedUnits = current.filter(id => id !== unitId);
    } else {
      updatedUnits = [...current, unitId];
    }

    const updatedUser: AppUser = {
      ...selectedUser,
      assignedUnitIds: updatedUnits,
      hasAccessToAllUnits: false
    };
    onUpdateUser(updatedUser);
    triggerSuccess(`Carretas vinculadas a ${selectedUser.name} atualizadas!`);
  };

  const handleToggleUserCustomTab = (tabKey: string) => {
    if (!selectedUser) return;
    const currentTabs = selectedUser.customAllowedTabs || [];
    const exists = currentTabs.includes(tabKey);
    const updatedTabs = exists
      ? currentTabs.filter(t => t !== tabKey)
      : [...currentTabs, tabKey];

    const updatedUser: AppUser = {
      ...selectedUser,
      customAllowedTabs: updatedTabs
    };
    onUpdateUser(updatedUser);
    triggerSuccess(`Áreas permitidas para ${selectedUser.name} atualizadas!`);
  };

  // Apply group fleet rule to all users in group
  const handleApplyGroupFleetRule = (hasAll: boolean) => {
    const roles = getRolesForGroup(selectedGroup);
    const updatedUsers = users.map(u => {
      if (roles.includes(u.role)) {
        return {
          ...u,
          hasAccessToAllUnits: hasAll,
          assignedUnitIds: hasAll ? units.map(un => un.id) : (u.assignedUnitIds?.length ? u.assignedUnitIds : [units[0]?.id || ''])
        };
      }
      return u;
    });
    onUpdateUsers(updatedUsers);
    triggerSuccess(`Regra de acesso à frota aplicada a todos os ${selectedGroup}!`);
  };

  const filteredUsers = users.filter(u => {
    if (u.role === 'Admin') return false; // Admin always has full access
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      u.name.toLowerCase().includes(term) ||
      u.role.toLowerCase().includes(term) ||
      u.email.toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Controle de Permissões & Regras de Acesso (RBAC)
          </h1>
          <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
            <span>Subárea Exclusiva de Administração</span>
            <span aria-hidden="true">·</span>
            <span>Gestão por Tipo de Cargo ou por Usuário Individual</span>
          </div>
        </div>

        {savedSuccess && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg text-xs font-semibold">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{successMessage}</span>
          </div>
        )}
      </div>

      {/* Mode Switcher Tabs */}
      <div className="flex items-center gap-3 border-b border-slate-200">
        <button
          onClick={() => setActiveMode('by_group')}
          className={`pb-3 px-2 text-xs font-bold border-b-2 flex items-center gap-2 transition-colors cursor-pointer ${
            activeMode === 'by_group'
              ? 'border-teal-700 text-teal-800'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Users className="w-4 h-4" />
          Permissões por Categoria / Tipo de Profissional
        </button>
        <button
          onClick={() => setActiveMode('by_user')}
          className={`pb-3 px-2 text-xs font-bold border-b-2 flex items-center gap-2 transition-colors cursor-pointer ${
            activeMode === 'by_user'
              ? 'border-teal-700 text-teal-800'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <User className="w-4 h-4" />
          Permissões por Usuário Específico
        </button>
      </div>

      {/* MODE 1: BY GROUP */}
      {activeMode === 'by_group' && (
        <div className="space-y-6">
          {/* Group Selector Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { id: 'coordenadores', label: 'Coordenadores', desc: 'Acesso default a todas as carretas e estoque' },
              { id: 'profissionais_saude', label: 'Profissionais de Saúde', desc: 'Dentistas, TSB, ASB, Prótese (vinculados a carreta)' },
              { id: 'motoristas', label: 'Motoristas', desc: 'Acesso padrão restrito a Alertas de Ocorrências' },
              { id: 'almoxarifes', label: 'Almoxarifes', desc: 'Acesso padrão exclusivo ao Estoque Odontológico' }
            ].map(group => (
              <button
                key={group.id}
                onClick={() => setSelectedGroup(group.id as GroupType)}
                className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                  selectedGroup === group.id
                    ? 'border-teal-600 bg-teal-50/50 shadow-xs ring-1 ring-teal-600'
                    : 'border-slate-200 bg-white hover:bg-slate-50'
                }`}
              >
                <div className="font-bold text-xs text-slate-900">{group.label}</div>
                <div className="text-[11px] text-slate-500 mt-1 leading-snug">{group.desc}</div>
              </button>
            ))}
          </div>

          {/* Group Configuration Card */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-2xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Shield className="w-4 h-4 text-teal-700" />
                  Regras Gerais para:{' '}
                  <span className="text-teal-800 uppercase tracking-wide">
                    {selectedGroup === 'coordenadores' && 'Coordenadores'}
                    {selectedGroup === 'profissionais_saude' && 'Profissionais de Saúde Bucal'}
                    {selectedGroup === 'motoristas' && 'Motoristas'}
                    {selectedGroup === 'almoxarifes' && 'Almoxarifes'}
                  </span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Defina o comportamento padrão para todos os membros que possuem este cargo.
                </p>
              </div>

              {/* Fleet Access Strategy */}
              <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-lg border border-slate-200">
                <span className="text-xs text-slate-700 font-medium">Acesso à Frota:</span>
                <button
                  onClick={() => handleApplyGroupFleetRule(true)}
                  className="px-2.5 py-1 text-[11px] font-semibold rounded bg-white text-slate-700 border border-slate-300 hover:bg-slate-100 cursor-pointer"
                >
                  Todas as Carretas
                </button>
                <button
                  onClick={() => handleApplyGroupFleetRule(false)}
                  className="px-2.5 py-1 text-[11px] font-semibold rounded bg-white text-slate-700 border border-slate-300 hover:bg-slate-100 cursor-pointer"
                >
                  Apenas Carretas Vinculadas
                </button>
              </div>
            </div>

            {/* Checklist of modules & actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Áreas / Abas Visíveis */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Módulos & Abas Visíveis
                </h4>
                <div className="space-y-2">
                  {[
                    { key: 'viewStatisticsDashboard', label: 'Dashboard de Estatísticas', desc: 'Volume de procedimentos e tempo médio' },
                    { key: 'viewMobileUnits', label: 'Unidades Móveis (Carretas)', desc: 'Listagem patrimonial e técnica das carretas' },
                    { key: 'viewInventory', label: 'Estoque Odontológico', desc: 'Insumos, anestésicos e materiais clínicos' },
                    { key: 'viewPatients', label: 'Pacientes & Clientes', desc: 'Prontuários e fichas de atendimento SUS' }
                  ].map(perm => {
                    const roles = getRolesForGroup(selectedGroup);
                    const isChecked = roles.every(r => permissions[perm.key as keyof RolePermissions].includes(r));

                    return (
                      <label
                        key={perm.key}
                        className="flex items-start gap-3 p-3 rounded-lg border border-slate-100 hover:bg-slate-50 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleToggleGroupPerm(perm.key as keyof RolePermissions, selectedGroup)}
                          className="mt-0.5 w-4 h-4 text-teal-600 rounded border-slate-300 focus:ring-teal-500"
                        />
                        <div>
                          <div className="text-xs font-semibold text-slate-900">{perm.label}</div>
                          <div className="text-[11px] text-slate-500">{perm.desc}</div>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Ações Operacionais */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Ações Operacionais Permitidas
                </h4>
                <div className="space-y-2">
                  {[
                    { key: 'updateVehicleLocation', label: 'Atualizar Localidade e Odômetro', desc: 'Mudar endereço atual do veículo no município' },
                    { key: 'reportOccurrences', label: 'Cadastrar Alertas de Ocorrências', desc: 'Pneu estourado, quebras mecânicas ou bloqueios' },
                    { key: 'resolveOccurrences', label: 'Resolver e Concluir Ocorrências', desc: 'Aprovar laudo técnico e despesas mecânicas' },
                    { key: 'editInventory', label: 'Movimentar Estoque Odontológico', desc: 'Dar entrada ou baixa física de materiais' },
                    { key: 'registerMobileUnits', label: 'Cadastrar Novas Unidades Móveis', desc: 'Incluir novos semirreboques na frota' }
                  ].map(perm => {
                    const roles = getRolesForGroup(selectedGroup);
                    const isChecked = roles.every(r => permissions[perm.key as keyof RolePermissions].includes(r));

                    return (
                      <label
                        key={perm.key}
                        className="flex items-start gap-3 p-3 rounded-lg border border-slate-100 hover:bg-slate-50 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleToggleGroupPerm(perm.key as keyof RolePermissions, selectedGroup)}
                          className="mt-0.5 w-4 h-4 text-teal-600 rounded border-slate-300 focus:ring-teal-500"
                        />
                        <div>
                          <div className="text-xs font-semibold text-slate-900">{perm.label}</div>
                          <div className="text-[11px] text-slate-500">{perm.desc}</div>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODE 2: BY USER */}
      {activeMode === 'by_user' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* User selector list */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs space-y-3">
            <div className="flex items-center gap-2 border border-slate-300 rounded-lg px-2.5 py-1.5 bg-slate-50">
              <Search className="w-3.5 h-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Filtrar por nome, cargo..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full text-xs bg-transparent outline-none text-slate-900 placeholder:text-slate-400"
              />
            </div>

            <div className="space-y-1.5 max-h-[500px] overflow-y-auto pr-1">
              {filteredUsers.map(user => {
                const isSelected = user.id === selectedUser?.id;
                const seesAll = user.hasAccessToAllUnits ?? (user.role === 'Coordenador' || user.role === 'Almoxarife');

                return (
                  <button
                    key={user.id}
                    onClick={() => setSelectedUserId(user.id)}
                    className={`w-full p-2.5 rounded-lg text-left transition-colors cursor-pointer border ${
                      isSelected
                        ? 'border-teal-600 bg-teal-50/60 shadow-2xs'
                        : 'border-slate-100 hover:bg-slate-50'
                    }`}
                  >
                    <div className="font-semibold text-xs text-slate-900">{user.name}</div>
                    <div className="flex items-center justify-between text-[11px] text-slate-500 mt-0.5">
                      <span>{user.role}</span>
                      <span className={`text-[10px] font-medium px-1.5 py-0.2 rounded ${
                        seesAll ? 'bg-teal-100 text-teal-800' : 'bg-slate-200 text-slate-700'
                      }`}>
                        {seesAll ? 'Todas Carretas' : `${user.assignedUnitIds?.length || 0} carreta(s)`}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* User Detail & Individual Configuration Form */}
          <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-6 shadow-2xs space-y-6">
            {selectedUser ? (
              <>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-slate-900">{selectedUser.name}</h3>
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-800 border border-slate-200">
                        {selectedUser.role}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 font-mono-numbers mt-0.5">
                      {selectedUser.email} · {selectedUser.phone} {selectedUser.cro ? `· CRO: ${selectedUser.cro}` : ''}
                    </p>
                  </div>
                </div>

                {/* Section 1: Fleet Access & Assigned Carretas */}
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                        <Truck className="w-4 h-4 text-teal-700" />
                        Escopo de Carretas Móveis Permitidas
                      </h4>
                      <p className="text-[11px] text-slate-500">
                        Controle se este profissional pode acessar todas as carretas ou apenas carretas selecionadas.
                      </p>
                    </div>

                    <label className="flex items-center gap-2 text-xs font-semibold text-slate-800 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedUser.hasAccessToAllUnits ?? (selectedUser.role === 'Coordenador' || selectedUser.role === 'Almoxarife')}
                        onChange={e => handleToggleUserAllUnits(e.target.checked)}
                        className="w-4 h-4 text-teal-600 rounded border-slate-300 focus:ring-teal-500"
                      />
                      <span>Acesso a Todas as Carretas</span>
                    </label>
                  </div>

                  {/* List of carretas checkboxes if not all carretas */}
                  {!(selectedUser.hasAccessToAllUnits ?? (selectedUser.role === 'Coordenador' || selectedUser.role === 'Almoxarife')) && (
                    <div className="pt-2 border-t border-slate-200 space-y-2">
                      <div className="text-[11px] font-semibold text-slate-700">
                        Selecione as carretas específicas que este usuário pode visualizar e gerenciar:
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {units.map(unit => {
                          const isAssigned = selectedUser.assignedUnitIds?.includes(unit.id);
                          return (
                            <label
                              key={unit.id}
                              className={`p-2.5 rounded-lg border text-xs flex items-center gap-2.5 transition-colors cursor-pointer ${
                                isAssigned
                                  ? 'border-teal-500 bg-white ring-1 ring-teal-500/30'
                                  : 'border-slate-200 bg-white hover:bg-slate-100/60'
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={!!isAssigned}
                                onChange={() => handleToggleUserAssignedUnit(unit.id)}
                                className="w-3.5 h-3.5 text-teal-600 rounded border-slate-300 focus:ring-teal-500"
                              />
                              <div>
                                <span className="font-semibold text-slate-900 block">{unit.identifier}</span>
                                <span className="text-[11px] text-slate-500 font-mono-numbers">
                                  Placa: {unit.plate} · {unit.currentMunicipality.split(' - ')[0]}
                                </span>
                              </div>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {/* Section 2: Custom Tab Access */}
                <div className="space-y-3">
                  <div className="flex items-center gap-1.5">
                    <SlidersHorizontal className="w-4 h-4 text-teal-700" />
                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                      Áreas Liberadas para este Usuário
                    </h4>
                  </div>
                  <p className="text-xs text-slate-500">
                    O admin pode conceder acesso a áreas extras (como liberar "Status e Localidade" para um Motorista específico, ou liberar "Estoque" para outro membro):
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {[
                      { id: 'fleet_health', label: 'Status e Localidade' },
                      { id: 'occurrences', label: 'Alertas de Ocorrências' },
                      { id: 'inventory', label: 'Estoque Odontológico' },
                      { id: 'patients', label: 'Pacientes & Clientes' },
                      { id: 'statistics', label: 'Dashboard de Estatísticas' },
                      { id: 'mobile_units', label: 'Unidades Móveis (Admin)' }
                    ].map(tab => {
                      const isExtraAllowed = selectedUser.customAllowedTabs?.includes(tab.id);
                      return (
                        <label
                          key={tab.id}
                          className="flex items-center gap-2 p-2.5 rounded-lg border border-slate-200 bg-slate-50/50 hover:bg-slate-50 cursor-pointer text-xs"
                        >
                          <input
                            type="checkbox"
                            checked={!!isExtraAllowed}
                            onChange={() => handleToggleUserCustomTab(tab.id)}
                            className="w-4 h-4 text-teal-600 rounded border-slate-300 focus:ring-teal-500"
                          />
                          <span className="font-medium text-slate-800">{tab.label}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                {/* Section 3: Summary of effective permissions */}
                <div className="p-4 bg-teal-50/60 border border-teal-200 rounded-xl text-xs space-y-1.5">
                  <div className="font-bold text-teal-900 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-teal-700" />
                    Status Atual de Acesso deste Usuário
                  </div>
                  <ul className="list-disc list-inside text-teal-800 space-y-0.5 text-[11px]">
                    <li>
                      <strong>Frota:</strong>{' '}
                      {selectedUser.hasAccessToAllUnits || (selectedUser.role === 'Coordenador' && selectedUser.hasAccessToAllUnits !== false)
                        ? 'Acesso pleno a todas as carretas da frota'
                        : `Restrito a ${selectedUser.assignedUnitIds?.length || 0} carreta(s) vinculada(s)`}
                    </li>
                    <li>
                      <strong>Papel Primário:</strong> {selectedUser.role} (herda regras gerais da categoria)
                    </li>
                    {selectedUser.customAllowedTabs && selectedUser.customAllowedTabs.length > 0 && (
                      <li>
                        <strong>Áreas adicionais personalizadas:</strong> {selectedUser.customAllowedTabs.join(', ')}
                      </li>
                    )}
                  </ul>
                </div>
              </>
            ) : (
              <div className="text-center py-12 text-slate-500 text-xs">
                Selecione um usuário na coluna lateral para gerenciar suas permissões.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
