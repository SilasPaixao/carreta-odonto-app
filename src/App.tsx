import React, { useState, useEffect } from 'react';
import { db } from './utils/storage';
import { 
  AppUser, 
  MobileUnit, 
  VehicleOccurrence, 
  LocationUpdateLog, 
  InventoryItem, 
  PatientClient, 
  RolePermissions, 
  AttendanceRecord 
} from './types';
import { Navbar } from './components/Navbar';
import { UserSwitcherModal } from './components/UserSwitcherModal';
import { RegisterUserModal } from './components/RegisterUserModal';
import { AdminApprovalModal } from './components/AdminApprovalModal';
import { PrintReportModal } from './components/PrintReportModal';

import { StatisticsView } from './views/StatisticsView';
import { FleetHealthLocationView } from './views/FleetHealthLocationView';
import { OccurrencesView } from './views/OccurrencesView';
import { MobileUnitsAdminView } from './views/MobileUnitsAdminView';
import { InventoryView } from './views/InventoryView';
import { PatientsClientsView } from './views/PatientsClientsView';
import { TeamMembersView } from './views/TeamMembersView';
import { PermissionsMatrixView } from './views/PermissionsMatrixView';

import { 
  BarChart3, 
  Truck, 
  AlertTriangle, 
  Building2, 
  Package, 
  Users, 
  UserCheck, 
  Shield, 
  Lock,
  Printer
} from 'lucide-react';

export default function App() {
  const [currentUser, setCurrentUser] = useState<AppUser>(() => db.getCurrentUser());
  const [users, setUsers] = useState<AppUser[]>(() => db.getUsers());
  const [units, setUnits] = useState<MobileUnit[]>(() => db.getUnits());
  const [occurrences, setOccurrences] = useState<VehicleOccurrence[]>(() => db.getOccurrences());
  const [locationLogs, setLocationLogs] = useState<LocationUpdateLog[]>(() => db.getLocationLogs());
  const [inventory, setInventory] = useState<InventoryItem[]>(() => db.getInventory());
  const [patients, setPatients] = useState<PatientClient[]>(() => db.getPatients());
  const [permissions, setPermissions] = useState<RolePermissions>(() => db.getPermissions());

  // Navigation tab state
  type NavTab = 
    | 'statistics'
    | 'fleet_health'
    | 'occurrences'
    | 'mobile_units'
    | 'inventory'
    | 'patients'
    | 'team'
    | 'permissions';

  const [activeTab, setActiveTab] = useState<NavTab>('fleet_health');

  // Modals state
  const [isUserSwitcherOpen, setIsUserSwitcherOpen] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [isAdminApprovalOpen, setIsAdminApprovalOpen] = useState(false);
  const [printModalType, setPrintModalType] = useState<'vehicles' | 'patients' | 'statistics' | null>(null);

  // Sync state changes with storage
  useEffect(() => {
    db.saveUsers(users);
  }, [users]);

  useEffect(() => {
    db.saveUnits(units);
  }, [units]);

  useEffect(() => {
    db.saveOccurrences(occurrences);
  }, [occurrences]);

  useEffect(() => {
    db.saveLocationLogs(locationLogs);
  }, [locationLogs]);

  useEffect(() => {
    db.saveInventory(inventory);
  }, [inventory]);

  useEffect(() => {
    db.savePatients(patients);
  }, [patients]);

  useEffect(() => {
    db.savePermissions(permissions);
  }, [permissions]);

  useEffect(() => {
    db.setCurrentUser(currentUser);
  }, [currentUser]);

  // Robust permission evaluator for tab visibility adhering to all user guidelines
  const canAccessTab = (tab: NavTab, user: AppUser, perms: RolePermissions): boolean => {
    if (user.role === 'Admin') return true;
    if (tab === 'permissions') return false; // exclusively admin

    // Check custom overrides granted individually by admin
    if (user.customAllowedTabs?.includes(tab)) return true;

    // Requirement:
    // "o motorista deve ter apenas a possibilidade de cadastrar ocorrencias e visualizar apenas esta área de 'Alertas de ocorrências' com status da ocorrencia feita por ele só. A menos que o admin adicione mais áreas a ser visualizada por ele."
    if (user.role === 'Motorista') {
      return tab === 'occurrences';
    }

    // Requirement:
    // "Almoxarife pode visualizar apenas a área Estoque odontológico (por default de todas as carretas, podendo ser limitado a apenas uma carreta específica)"
    if (user.role === 'Almoxarife') {
      return tab === 'inventory';
    }

    // Requirement:
    // "coordenador tem acesso default ao estoque de todas carretas, porém isso pode ser limitado pelo admin em permissões"
    // "o admin pode limitar um coordenador a ter acesso às informações de uma ou mais carretas (Ocorrencias (cadastro e acompanhamento), áreas que este pode visualizar, etc), porém por default ele vem com acesso à tudo de todas carretas"
    if (user.role === 'Coordenador') {
      if (tab === 'mobile_units') return perms.viewMobileUnits.includes('Coordenador');
      if (tab === 'statistics') return perms.viewStatisticsDashboard.includes('Coordenador');
      return true; // fleet_health, occurrences, inventory, patients, team
    }

    // Demais profissionais de saúde (Cirurgião-Dentista, TSB, ASB, TPD, APD, Recepcionista, etc.):
    // "os demais profissionais podem ver todas áreas, porém apenas informações relacionadas a sua determinada carreta"
    if (tab === 'mobile_units') return perms.viewMobileUnits.includes(user.role);
    if (tab === 'statistics') return perms.viewStatisticsDashboard.includes(user.role);
    return true; // fleet_health, occurrences, inventory, patients, team
  };

  // If currently active tab is not authorized for currentUser, fallback gracefully
  useEffect(() => {
    if (!canAccessTab(activeTab, currentUser, permissions)) {
      const candidateTabs: NavTab[] = [
        'occurrences',
        'inventory',
        'fleet_health',
        'statistics',
        'patients',
        'team',
        'mobile_units',
        'permissions'
      ];
      const fallback = candidateTabs.find(t => canAccessTab(t, currentUser, permissions)) || 'occurrences';
      setActiveTab(fallback);
    }
  }, [currentUser, permissions, activeTab]);

  // Handlers
  const handleUserSelect = (selectedUser: AppUser) => {
    let userToSet = selectedUser;
    // Se o administrador possuía solicitação de exclusão pendente e fez login/acesso, revoga automaticamente!
    if (selectedUser.pendingDeletionRequestedAt) {
      const updated = users.map(u => {
        if (u.id === selectedUser.id) {
          return {
            ...u,
            pendingDeletionRequestedAt: undefined,
            pendingDeletionRequestedBy: undefined,
            deletionEffectiveAfter: undefined,
            lastLoginAt: new Date().toISOString()
          };
        }
        return u;
      });
      setUsers(updated);
      userToSet = {
        ...selectedUser,
        pendingDeletionRequestedAt: undefined,
        pendingDeletionRequestedBy: undefined,
        deletionEffectiveAfter: undefined,
        lastLoginAt: new Date().toISOString()
      };
    } else {
      const updated = users.map(u => (u.id === selectedUser.id ? { ...u, lastLoginAt: new Date().toISOString() } : u));
      setUsers(updated);
      userToSet = { ...selectedUser, lastLoginAt: new Date().toISOString() };
    }
    setCurrentUser(userToSet);
  };

  const handleUserRegistered = (newUser: AppUser) => {
    const updated = [newUser, ...users];
    setUsers(updated);
  };

  const handleUpdateUser = (updatedUser: AppUser) => {
    const updated = users.map(u => (u.id === updatedUser.id ? updatedUser : u));
    setUsers(updated);
    if (currentUser.id === updatedUser.id) {
      setCurrentUser(updatedUser);
    }
  };

  const handleDeleteUser = (userId: string) => {
    setUsers(prev => prev.filter(u => u.id !== userId));
  };

  const handleUpdateUsers = (updatedUsers: AppUser[]) => {
    setUsers(updatedUsers);
    const curr = updatedUsers.find(u => u.id === currentUser.id);
    if (curr) {
      setCurrentUser(curr);
    }
  };

  const handleApproveAdmin = (adminId: string) => {
    const updated = users.map(u => {
      if (u.id === adminId) {
        return {
          ...u,
          status: 'active' as const,
          approvedBy: currentUser.name
        };
      }
      return u;
    });
    setUsers(updated);
  };

  const handleRejectAdmin = (adminId: string) => {
    const updated = users.map(u => {
      if (u.id === adminId) {
        return {
          ...u,
          status: 'rejected' as const
        };
      }
      return u;
    });
    setUsers(updated);
  };

  const handleUpdateUnitLocation = (newLog: LocationUpdateLog) => {
    // Add to logs
    setLocationLogs(prev => [newLog, ...prev]);

    // Update unit
    setUnits(prev =>
      prev.map(u => {
        if (u.id === newLog.unitId) {
          return {
            ...u,
            currentMunicipality: newLog.city,
            currentAddress: newLog.address,
            odometer: newLog.odometer,
            status: newLog.status
          };
        }
        return u;
      })
    );
  };

  const handleAddOccurrence = (newOcc: VehicleOccurrence) => {
    setOccurrences(prev => [newOcc, ...prev]);
  };

  const handleResolveOccurrence = (id: string, notes: string, cost?: number) => {
    setOccurrences(prev =>
      prev.map(occ => {
        if (occ.id === id) {
          return {
            ...occ,
            status: 'Resolvido' as const,
            resolvedAt: new Date().toISOString(),
            resolvedBy: currentUser.name,
            resolutionNotes: notes,
            estimatedCost: cost !== undefined ? cost : occ.estimatedCost
          };
        }
        return occ;
      })
    );
  };

  const handleAddUnit = (newUnit: MobileUnit) => {
    setUnits(prev => [newUnit, ...prev]);
  };

  const handleUpdateUnit = (updatedUnit: MobileUnit) => {
    setUnits(prev => prev.map(u => (u.id === updatedUnit.id ? updatedUnit : u)));
  };

  const handleDeleteUnit = (id: string) => {
    setUnits(prev => prev.filter(u => u.id !== id));
  };

  const handleAddPatient = (newPatient: PatientClient) => {
    setPatients(prev => [newPatient, ...prev]);
  };

  const handleAddAttendance = (patientId: string, attendance: AttendanceRecord) => {
    setPatients(prev =>
      prev.map(p => {
        if (p.id === patientId) {
          return {
            ...p,
            attendances: [attendance, ...p.attendances]
          };
        }
        return p;
      })
    );
  };

  const handleResetData = () => {
    if (window.confirm('Deseja restaurar os dados de demonstração padrão do sistema?')) {
      db.resetToDefaults();
      window.location.reload();
    }
  };

  const pendingAdminsCount = users.filter(
    u => u.role === 'Admin' && u.status === 'pending_approval'
  ).length;

  const unresolvedOccurrencesCount = occurrences.filter(
    o => o.status !== 'Resolvido'
  ).length;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-900">
      {/* Primary Top Bar adhering to Top Bar Contract */}
      <div className="no-print">
        <Navbar
          currentUser={currentUser}
          pendingAdminsCount={pendingAdminsCount}
          unresolvedOccurrencesCount={unresolvedOccurrencesCount}
          onOpenSwitchUser={() => setIsUserSwitcherOpen(true)}
          onOpenPendingAdmins={() => setIsAdminApprovalOpen(true)}
          onNavigateToOccurrences={() => setActiveTab('occurrences')}
          onResetData={handleResetData}
        />
      </div>

      {/* Main Layout Container */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col md:flex-row gap-6">
        {/* Left Navigation Sidebar */}
        <aside className="no-print w-full md:w-64 shrink-0 space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-2xs space-y-1">
            <div className="px-3 py-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Painel de Gestão
            </div>

            {/* Tab: Estatísticas */}
            {canAccessTab('statistics', currentUser, permissions) && (
              <button
                onClick={() => setActiveTab('statistics')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                  activeTab === 'statistics'
                    ? 'bg-teal-700 text-white shadow-xs'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <BarChart3 className="w-4 h-4" />
                  <span>Dashboard Estatísticas</span>
                </div>
              </button>
            )}

            {/* Tab: Status e Localidade da Frota */}
            {canAccessTab('fleet_health', currentUser, permissions) && (
              <button
                onClick={() => setActiveTab('fleet_health')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                  activeTab === 'fleet_health'
                    ? 'bg-teal-700 text-white shadow-xs'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Truck className="w-4 h-4" />
                  <span>Status e Localidade</span>
                </div>
                <span className="text-[10px] font-mono-numbers opacity-80">{units.length}</span>
              </button>
            )}

            {/* Tab: Alertas de Ocorrências */}
            {canAccessTab('occurrences', currentUser, permissions) && (
              <button
                onClick={() => setActiveTab('occurrences')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                  activeTab === 'occurrences'
                    ? 'bg-teal-700 text-white shadow-xs'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Alertas de Ocorrências</span>
                </div>
                {unresolvedOccurrencesCount > 0 && (
                  <span className={`text-[10px] font-mono-numbers px-1.5 py-0.5 rounded-full font-bold ${
                    activeTab === 'occurrences'
                      ? 'bg-white text-teal-800'
                      : 'bg-amber-100 text-amber-900'
                  }`}>
                    {unresolvedOccurrencesCount}
                  </span>
                )}
              </button>
            )}

            {/* Tab: Unidades Móveis (conditionally visible only to admins or authorized roles) */}
            {canAccessTab('mobile_units', currentUser, permissions) && (
              <button
                onClick={() => setActiveTab('mobile_units')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                  activeTab === 'mobile_units'
                    ? 'bg-teal-700 text-white shadow-xs'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Building2 className="w-4 h-4" />
                  <span>Unidades Móveis</span>
                </div>
                {currentUser.role === 'Admin' && (
                  <span className="text-[9px] uppercase tracking-wider text-slate-400 font-semibold">
                    Admin
                  </span>
                )}
              </button>
            )}

            {/* Tab: Estoque */}
            {canAccessTab('inventory', currentUser, permissions) && (
              <button
                onClick={() => setActiveTab('inventory')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                  activeTab === 'inventory'
                    ? 'bg-teal-700 text-white shadow-xs'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Package className="w-4 h-4" />
                  <span>Estoque Odontológico</span>
                </div>
              </button>
            )}

            {/* Tab: Pacientes / Clientes */}
            {canAccessTab('patients', currentUser, permissions) && (
              <button
                onClick={() => setActiveTab('patients')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                  activeTab === 'patients'
                    ? 'bg-teal-700 text-white shadow-xs'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Users className="w-4 h-4" />
                  <span>Pacientes & Clientes</span>
                </div>
                <span className="text-[10px] font-mono-numbers opacity-80">{patients.length}</span>
              </button>
            )}

            {/* Tab: Equipe & Profissionais */}
            {canAccessTab('team', currentUser, permissions) && (
              <button
                onClick={() => setActiveTab('team')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                  activeTab === 'team'
                    ? 'bg-teal-700 text-white shadow-xs'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <UserCheck className="w-4 h-4" />
                  <span>Equipe & Profissionais</span>
                </div>
                {pendingAdminsCount > 0 && (
                  <span className={`text-[10px] font-mono-numbers px-1.5 py-0.5 rounded-full font-bold ${
                    activeTab === 'team'
                      ? 'bg-white text-teal-800'
                      : 'bg-rose-100 text-rose-800'
                  }`}>
                    {pendingAdminsCount}
                  </span>
                )}
              </button>
            )}

            {/* Subárea de Permissões: Exclusiva para Admin */}
            {currentUser.role === 'Admin' && (
              <div className="pt-2 mt-2 border-t border-slate-100">
                <button
                  onClick={() => setActiveTab('permissions')}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                    activeTab === 'permissions'
                      ? 'bg-teal-700 text-white shadow-xs'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Shield className="w-4 h-4 text-amber-500" />
                    <span>Controle de Permissões</span>
                  </div>
                  <span className="text-[9px] uppercase tracking-wider bg-amber-100 text-amber-900 font-bold px-1.5 py-0.5 rounded">
                    Admin
                  </span>
                </button>
              </div>
            )}
          </div>

          {/* Quick PDF Export Center */}
          <div className="bg-slate-100/70 border border-slate-200/90 rounded-xl p-4 text-xs space-y-2.5">
            <div className="flex items-center gap-1.5 font-bold text-slate-800">
              <Printer className="w-3.5 h-3.5 text-teal-700" />
              <span>Impressão de Relatórios Oficiais</span>
            </div>
            <p className="text-[11px] text-slate-500 leading-normal">
              Gere documentos prontos para prestação de contas com prefeituras parceiras:
            </p>
            <div className="space-y-1.5 pt-1">
              <button
                onClick={() => setPrintModalType('vehicles')}
                className="w-full text-left px-2.5 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 rounded text-[11px] font-semibold text-slate-700 flex items-center justify-between transition-colors cursor-pointer"
              >
                <span>Saúde & Locais das Carretas</span>
                <span className="text-teal-700">PDF →</span>
              </button>
              <button
                onClick={() => setPrintModalType('patients')}
                className="w-full text-left px-2.5 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 rounded text-[11px] font-semibold text-slate-700 flex items-center justify-between transition-colors cursor-pointer"
              >
                <span>Pacientes & Procedimentos CRO</span>
                <span className="text-teal-700">PDF →</span>
              </button>
              <button
                onClick={() => setPrintModalType('statistics')}
                className="w-full text-left px-2.5 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 rounded text-[11px] font-semibold text-slate-700 flex items-center justify-between transition-colors cursor-pointer"
              >
                <span>Dashboard & Tempo Médio</span>
                <span className="text-teal-700">PDF →</span>
              </button>
            </div>
          </div>
        </aside>

        {/* Central Viewport Content */}
        <main className="flex-1 min-w-0">
          {activeTab === 'statistics' && canAccessTab('statistics', currentUser, permissions) && (
            <StatisticsView
              units={units}
              patients={patients}
              occurrences={occurrences}
              currentUser={currentUser}
              onOpenPrintModal={() => setPrintModalType('statistics')}
            />
          )}

          {activeTab === 'fleet_health' && canAccessTab('fleet_health', currentUser, permissions) && (
            <FleetHealthLocationView
              units={units}
              occurrences={occurrences}
              locationLogs={locationLogs}
              currentUser={currentUser}
              permissions={permissions}
              onUpdateUnitLocation={handleUpdateUnitLocation}
              onOpenPrintModal={() => setPrintModalType('vehicles')}
              onNavigateToOccurrences={() => setActiveTab('occurrences')}
            />
          )}

          {activeTab === 'occurrences' && canAccessTab('occurrences', currentUser, permissions) && (
            <OccurrencesView
              occurrences={occurrences}
              units={units}
              currentUser={currentUser}
              permissions={permissions}
              onAddOccurrence={handleAddOccurrence}
              onResolveOccurrence={handleResolveOccurrence}
            />
          )}

          {activeTab === 'mobile_units' && canAccessTab('mobile_units', currentUser, permissions) && (
            <MobileUnitsAdminView
              units={units}
              currentUser={currentUser}
              permissions={permissions}
              onAddUnit={handleAddUnit}
              onUpdateUnit={handleUpdateUnit}
              onDeleteUnit={handleDeleteUnit}
            />
          )}

          {activeTab === 'inventory' && (
            <InventoryView
              inventory={inventory}
              units={units}
              currentUser={currentUser}
              permissions={permissions}
              onUpdateInventory={setInventory}
            />
          )}

          {activeTab === 'patients' && (
            <PatientsClientsView
              patients={patients}
              units={units}
              currentUser={currentUser}
              permissions={permissions}
              onAddPatient={handleAddPatient}
              onAddAttendance={handleAddAttendance}
              onOpenPrintModal={() => setPrintModalType('patients')}
            />
          )}

          {activeTab === 'team' && (
            <TeamMembersView
              users={users}
              units={units}
              currentUser={currentUser}
              onOpenRegisterModal={() => setIsRegisterOpen(true)}
              onApproveAdmin={handleApproveAdmin}
              onRejectAdmin={handleRejectAdmin}
            />
          )}

          {activeTab === 'permissions' && currentUser.role === 'Admin' && (
            <PermissionsMatrixView
              permissions={permissions}
              users={users}
              units={units}
              onUpdatePermissions={setPermissions}
              onUpdateUser={handleUpdateUser}
              onUpdateUsers={handleUpdateUsers}
            />
          )}
        </main>
      </div>

      {/* Modals */}
      <UserSwitcherModal
        isOpen={isUserSwitcherOpen}
        onClose={() => setIsUserSwitcherOpen(false)}
        currentUser={currentUser}
        users={users}
        onSelectUser={handleUserSelect}
        onOpenRegister={() => setIsRegisterOpen(true)}
      />

      <RegisterUserModal
        isOpen={isRegisterOpen}
        onClose={() => setIsRegisterOpen(false)}
        onUserRegistered={handleUserRegistered}
        existingUsers={users}
        units={units}
        currentUser={currentUser}
      />

      <AdminApprovalModal
        isOpen={isAdminApprovalOpen}
        onClose={() => setIsAdminApprovalOpen(false)}
        pendingAdmins={users.filter(u => u.role === 'Admin' && u.status === 'pending_approval')}
        onApprove={handleApproveAdmin}
        onReject={handleRejectAdmin}
      />

      {printModalType && (
        <PrintReportModal
          type={printModalType}
          isOpen={!!printModalType}
          onClose={() => setPrintModalType(null)}
          units={units}
          patients={patients}
          occurrences={occurrences}
        />
      )}
    </div>
  );
}
