export type HealthcareRole =
  | 'Coordenador'
  | 'Cirurgião-Dentista'
  | 'Técnico em Saúde Bucal (TSB)'
  | 'Auxiliar em Saúde Bucal (ASB)'
  | 'Técnico em Prótese Dentária (TPD)'
  | 'Auxiliar em Prótese Dentária (APD)'
  | 'Recepcionista / Atendente'
  | 'Gestor Financeiro'
  | 'Almoxarife'
  | 'Motorista'
  | 'Outro';

export type UserRole = 'Admin' | HealthcareRole;

export type ProfessionalGroupType = 'coordenadores' | 'profissionais_saude' | 'motoristas' | 'almoxarifes' | 'todos';

export interface AppUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  cro?: string; // Obrigatório para Cirurgião-Dentista, TSB, ASB, TPD, APD; Opcional para Coordenador
  phone: string;
  cpf?: string;
  assignedUnitIds?: string[]; // IDs das carretas atribuídas a este usuário (obrigatório no cadastro dos profissionais de saúde; para coordenador pode ser all ou específicas; para almoxarife all ou específica)
  hasAccessToAllUnits?: boolean; // Se true, tem acesso a todas as carretas (default true para Coordenador e Almoxarife até ser limitado pelo admin)
  customAllowedTabs?: string[]; // Áreas extras que o admin permitiu para este usuário específico
  passwordHash: string;
  salt: string;
  status: 'active' | 'pending_approval' | 'rejected';
  registeredAt: string;
  approvedBy?: string;
  isFirstAdmin?: boolean;
  lastLoginAt?: string; // Data do último acesso à conta
  pendingDeletionRequestedAt?: string; // Data em que outro admin solicitou a exclusão
  pendingDeletionRequestedBy?: string; // Nome do admin que solicitou a exclusão
  deletionEffectiveAfter?: string; // Data limite de 3 meses para exclusão definitiva por inatividade
}

export type UnitOperationalStatus = 'Em Atendimento' | 'Em Trânsito' | 'Em Manutenção' | 'Disponível';

export interface MobileUnit {
  id: string;
  identifier: string; // Ex: "Carreta Odonto 01 - SUS Móvel"
  plate: string; // Ex: "BRA-2E19"
  chassis: string;
  model: string; // Ex: "Semirreboque Rodoviário Tri-Eixo Clínico"
  year: number;
  numberOfChairs: number; // Ex: 2 ou 3 consultórios
  currentMunicipality: string; // Ex: "Prefeitura Municipal de Campinas"
  currentAddress: string; // Ex: "Praça Beira Rio, s/n - Centro"
  latitude?: number;
  longitude?: number;
  status: UnitOperationalStatus;
  odometer: number; // km
  nextMaintenanceKm: number;
  lastMaintenanceDate: string;
  onboardEquipments: string[];
  assignedTeamIds?: string[];
  generatorHours?: number;
  compressorPressurePsi?: number;
  autoclaveCycles?: number;
}

export type OccurrenceSeverity = 'Crítica' | 'Alta' | 'Média' | 'Baixa';
export type OccurrenceStatus = 'Pendente' | 'Em Atendimento' | 'Resolvido';

export interface VehicleOccurrence {
  id: string;
  unitId: string;
  unitIdentifier: string;
  title: string;
  occurrenceType:
    | 'Pneu Estourado'
    | 'Falha no Cavalo Mecânico'
    | 'Falha no Gerador de Energia'
    | 'Vazamento no Compressor Odontológico'
    | 'Falha na Sucção / Sistema Hidráulico'
    | 'Problema Elétrico / Bateria'
    | 'Ar Condicionado Inoperante'
    | 'Avaria / Acidente de Trânsito'
    | 'Bloqueio de Rota / Imprevisto'
    | 'Outro';
  location: string; // Ex: "Rodovia Anhanguera KM 82 - Sentido Jundiaí"
  severity: OccurrenceSeverity;
  status: OccurrenceStatus;
  description: string;
  reportedBy: string;
  reportedRole: UserRole;
  reportedAt: string;
  resolvedAt?: string;
  resolvedBy?: string;
  resolutionNotes?: string;
  estimatedCost?: number;
}

export interface LocationUpdateLog {
  id: string;
  unitId: string;
  unitIdentifier: string;
  city: string;
  address: string;
  odometer: number;
  status: UnitOperationalStatus;
  notes?: string;
  updatedBy: string;
  updatedRole: UserRole;
  updatedAt: string;
}

export type SupplyCategory =
  | 'Anestésicos & Medicamentos'
  | 'Resinas & Restauradores'
  | 'Instrumentais & Brocas'
  | 'Descartáveis & EPI'
  | 'Esterilização & Biossegurança'
  | 'Peças & Manutenção de Veículo';

export interface InventoryItem {
  id: string;
  name: string;
  category: SupplyCategory;
  currentQuantity: number;
  minQuantity: number;
  unit: 'caixa' | 'unidade' | 'frasco' | 'tubete' | 'kit' | 'rolo' | 'pacote';
  batchNumber: string;
  expiryDate: string;
  allocatedUnitId: string; // ID da unidade móvel ou "Almoxarifado Central"
  allocatedUnitName: string;
  status: 'Adequado' | 'Baixo' | 'Crítico';
  lastMovementDate: string;
}

export interface InventoryMovement {
  id: string;
  itemId: string;
  itemName: string;
  type: 'Entrada' | 'Saída';
  quantity: number;
  reason: string;
  performedBy: string;
  date: string;
}

export interface AttendanceRecord {
  id: string;
  procedureName: string;
  date: string;
  durationMinutes: number; // Tempo de duração em minutos
  unitId: string;
  unitName: string;
  city: string;
  professionalName: string;
  professionalCro: string;
  professionalRole: string;
  clinicalNotes: string;
}

export interface PatientClient {
  id: string;
  name: string;
  cpf: string;
  phone: string;
  birthDate: string;
  city: string;
  address: string;
  susCardNumber?: string;
  primaryProfessionalName: string;
  primaryProfessionalCro: string;
  registeredAt: string;
  kinshipContactName?: string; // Contato de parentesco / responsável
  kinshipRelation?: string; // Grau de parentesco (ex: Mãe, Pai, Cônjuge, Filho(a), Irmão/Irmã, Responsável Legal, Outro)
  kinshipPhone?: string; // Telefone do contato de parentesco
  attendances: AttendanceRecord[];
}

export interface RolePermissions {
  viewMobileUnits: UserRole[]; // Quem pode visualizar a aba de unidades móveis
  registerMobileUnits: UserRole[]; // Quem pode cadastrar/editar unidades móveis
  updateVehicleLocation: UserRole[]; // Quem pode mudar localização dos veículos (ex: Motoristas, Coordenadores)
  viewStatisticsDashboard: UserRole[]; // Quem pode ver dashboard de estatísticas (Admins, Coordenadores, etc.)
  viewInventory: UserRole[];
  editInventory: UserRole[];
  viewPatients: UserRole[];
  registerPatients: UserRole[];
  reportOccurrences: UserRole[];
  resolveOccurrences: UserRole[];
}
