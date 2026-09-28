import {
  AppUser,
  MobileUnit,
  VehicleOccurrence,
  InventoryItem,
  PatientClient,
  RolePermissions,
  LocationUpdateLog
} from '../types';

export const initialPermissions: RolePermissions = {
  viewMobileUnits: ['Admin'],
  registerMobileUnits: ['Admin'],
  updateVehicleLocation: ['Admin', 'Coordenador', 'Motorista'],
  viewStatisticsDashboard: ['Admin', 'Coordenador'],
  viewInventory: ['Admin', 'Coordenador', 'Almoxarife', 'Cirurgião-Dentista', 'Técnico em Saúde Bucal (TSB)'],
  editInventory: ['Admin', 'Almoxarife', 'Coordenador'],
  viewPatients: ['Admin', 'Coordenador', 'Cirurgião-Dentista', 'Técnico em Saúde Bucal (TSB)', 'Auxiliar em Saúde Bucal (ASB)', 'Recepcionista / Atendente'],
  registerPatients: ['Admin', 'Coordenador', 'Cirurgião-Dentista', 'Técnico em Saúde Bucal (TSB)', 'Auxiliar em Saúde Bucal (ASB)', 'Recepcionista / Atendente'],
  reportOccurrences: ['Admin', 'Coordenador', 'Motorista', 'Cirurgião-Dentista', 'Almoxarife', 'Técnico em Saúde Bucal (TSB)', 'Outro'],
  resolveOccurrences: ['Admin', 'Coordenador']
};

export const initialUsers: AppUser[] = [
  {
    id: 'usr_admin_1',
    name: 'Dra. Juliana Mendes',
    email: 'juliana.admin@odontomovel.com.br',
    role: 'Admin',
    cro: 'SP-CD-89102',
    phone: '(11) 98765-4321',
    cpf: '123.456.789-00',
    hasAccessToAllUnits: true,
    passwordHash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855', // SHA-256
    salt: 'a1b2c3d4e5f60718',
    status: 'active',
    registeredAt: '2026-01-10T08:00:00.000Z',
    isFirstAdmin: true
  },
  {
    id: 'usr_admin_2_pending',
    name: 'Dr. Renato Silveira',
    email: 'renato.admin@odontomovel.com.br',
    role: 'Admin',
    cro: 'SP-CD-62184',
    phone: '(19) 98122-3344',
    cpf: '234.567.890-11',
    hasAccessToAllUnits: true,
    passwordHash: '8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918',
    salt: 'f1e2d3c4b5a69780',
    status: 'pending_approval',
    registeredAt: '2026-09-26T14:30:00.000Z'
  },
  {
    id: 'usr_coord_1',
    name: 'Dr. Carlos Eduardo Lima',
    email: 'carlos.coordenador@odontomovel.com.br',
    role: 'Coordenador',
    cro: 'SP-CD-45892',
    phone: '(19) 99123-4567',
    cpf: '345.678.901-22',
    hasAccessToAllUnits: true, // Por default ele vem com acesso a tudo de todas as carretas
    assignedUnitIds: ['unit_01', 'unit_02', 'unit_03', 'unit_04'],
    passwordHash: '8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918',
    salt: 'b2c3d4e5f6a10729',
    status: 'active',
    registeredAt: '2026-02-15T09:00:00.000Z'
  },
  {
    id: 'usr_dentist_1',
    name: 'Dra. Beatriz Santos',
    email: 'beatriz.odonto@odontomovel.com.br',
    role: 'Cirurgião-Dentista',
    cro: 'SP-CD-78201',
    phone: '(19) 97890-1234',
    cpf: '456.789.012-33',
    assignedUnitIds: ['unit_01'], // Carreta Odonto 01
    hasAccessToAllUnits: false,
    passwordHash: '8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918',
    salt: 'c3d4e5f6a1b21830',
    status: 'active',
    registeredAt: '2026-03-01T10:00:00.000Z'
  },
  {
    id: 'usr_tsb_1',
    name: 'Marcos Vinicius Alves',
    email: 'marcos.tsb@odontomovel.com.br',
    role: 'Técnico em Saúde Bucal (TSB)',
    cro: 'SP-TSB-1249',
    phone: '(19) 98765-1122',
    cpf: '567.890.123-44',
    assignedUnitIds: ['unit_01'], // Carreta Odonto 01
    hasAccessToAllUnits: false,
    passwordHash: '8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918',
    salt: 'd4e5f6a1b2c32941',
    status: 'active',
    registeredAt: '2026-03-10T11:00:00.000Z'
  },
  {
    id: 'usr_asb_1',
    name: 'Camila Rocha Nogueira',
    email: 'camila.asb@odontomovel.com.br',
    role: 'Auxiliar em Saúde Bucal (ASB)',
    cro: 'SP-ASB-8473',
    phone: '(19) 98345-6789',
    cpf: '678.901.234-55',
    assignedUnitIds: ['unit_01'], // Carreta Odonto 01
    hasAccessToAllUnits: false,
    passwordHash: '8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918',
    salt: 'e5f6a1b2c3d43052',
    status: 'active',
    registeredAt: '2026-03-12T11:30:00.000Z'
  },
  {
    id: 'usr_driver_1',
    name: 'Rogério Nascimento',
    email: 'rogerio.motorista@odontomovel.com.br',
    role: 'Motorista',
    phone: '(19) 99234-5678',
    cpf: '789.012.345-66',
    assignedUnitIds: ['unit_04'], // Carreta Odonto 04
    hasAccessToAllUnits: false,
    passwordHash: '8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918',
    salt: 'f6a1b2c3d4e54163',
    status: 'active',
    registeredAt: '2026-01-20T08:00:00.000Z'
  },
  {
    id: 'usr_almox_1',
    name: 'Marcelo Peçanha',
    email: 'marcelo.estoque@odontomovel.com.br',
    role: 'Almoxarife',
    phone: '(19) 99345-6789',
    cpf: '890.123.456-77',
    hasAccessToAllUnits: true, // Almoxarife por default tem acesso a todas as carretas
    assignedUnitIds: ['unit_01', 'unit_02', 'unit_03', 'unit_04'],
    passwordHash: '8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918',
    salt: 'a2b3c4d5e6f75274',
    status: 'active',
    registeredAt: '2026-02-01T09:00:00.000Z'
  }
];

export const initialUnits: MobileUnit[] = [
  {
    id: 'unit_01',
    identifier: 'Carreta Odonto 01 - SUS Campinas',
    plate: 'BRA-2E19',
    chassis: '9BFZZZ81ZPB102948',
    model: 'Semirreboque Furgão Frigorificado 3 Consultórios Odontológicos',
    year: 2023,
    numberOfChairs: 3,
    currentMunicipality: 'Prefeitura Municipal de Campinas',
    currentAddress: 'UBS Parque Prado - Av. Washington Luiz, 2800',
    latitude: -22.9421,
    longitude: -47.0428,
    status: 'Em Atendimento',
    odometer: 42350,
    nextMaintenanceKm: 45000,
    lastMaintenanceDate: '2026-08-15',
    generatorHours: 340,
    compressorPressurePsi: 95,
    autoclaveCycles: 280,
    onboardEquipments: [
      '3x Cadeiras Odontológicas Gnatus S400 c/ LED',
      'Autoclave Cristófoli 21 Litros Hospitalar',
      'Compressor Isento de Óleo Schultz 60L Silencioso',
      'Gerador Diesel Cummins 20kVA Silenciado',
      'Aparelho de Raio-X Periapical Digital Dabi Atlante 70kV',
      'Ar Condicionado Central Split Inverter 36.000 BTU',
      'Reservatório de Água Potável Sanitizado 600L',
      'Bomba de Vácuo Cirúrgica de Alta Sucção'
    ]
  },
  {
    id: 'unit_02',
    identifier: 'Carreta Odonto 02 - Circuito das Águas',
    plate: 'RTH-8J44',
    chassis: '9BFZZZ81ZRB304912',
    model: 'Carreta Reboque Clínico 2 Consultórios + Escovódromo Externo',
    year: 2024,
    numberOfChairs: 2,
    currentMunicipality: 'Prefeitura Municipal de Amparo',
    currentAddress: 'Praça Pádua Salles, Centro de Eventos - Centro',
    latitude: -22.7032,
    longitude: -46.7641,
    status: 'Em Atendimento',
    odometer: 28410,
    nextMaintenanceKm: 30000,
    lastMaintenanceDate: '2026-09-02',
    generatorHours: 195,
    compressorPressurePsi: 92,
    autoclaveCycles: 154,
    onboardEquipments: [
      '2x Cadeiras Odontológicas Olsen Logic Plus',
      'Autoclave Stermax 18 Litros Microprocessada',
      'Compressor de Ar Kavo Silencioso 40L',
      'Gerador Silenciado Stemac 15kVA Diesel',
      'Sensor Digital de Raio-X RVG Intraoral',
      'Tenda Externa de Escovação e Triagem SUS'
    ]
  },
  {
    id: 'unit_03',
    identifier: 'Carreta Odonto 03 - Vale do Paraíba',
    plate: 'GBK-4D12',
    chassis: '9BFZZZ81ZTB509214',
    model: 'Carreta Rodoviária 3 Consultórios + Mini-Laboratório Protético',
    year: 2022,
    numberOfChairs: 3,
    currentMunicipality: 'Prefeitura Municipal de Taubaté',
    currentAddress: 'UBS Quiririm - Rod. Floriano Rodrigues Pinheiro, KM 4',
    latitude: -23.0275,
    longitude: -45.5562,
    status: 'Em Manutenção',
    odometer: 67120,
    nextMaintenanceKm: 65000,
    lastMaintenanceDate: '2026-09-20',
    generatorHours: 580,
    compressorPressurePsi: 68, // Alerta de pressão
    autoclaveCycles: 412,
    onboardEquipments: [
      '3x Cadeiras Dabi Atlante Versa',
      'Compressor de Ar Duplo Isento de Óleo',
      'Bancada Protética com Micromotor e Forno de Resina',
      'Autoclave Cristófoli 24L Inox',
      'Gerador Diesel Toyama 18kVA'
    ]
  },
  {
    id: 'unit_04',
    identifier: 'Carreta Odonto 04 - Região Metropolitana',
    plate: 'DEX-9P88',
    chassis: '9BFZZZ81ZVB771239',
    model: 'Unidade Móvel Rápida 2 Consultórios com Acessibilidade PCD',
    year: 2024,
    numberOfChairs: 2,
    currentMunicipality: 'Prefeitura Municipal de Sorocaba',
    currentAddress: 'Acostamento Rodovia Castelo Branco KM 72 (Pneu Danificado)',
    latitude: -23.4215,
    longitude: -47.4589,
    status: 'Em Trânsito',
    odometer: 15800,
    nextMaintenanceKm: 20000,
    lastMaintenanceDate: '2026-09-10',
    generatorHours: 85,
    compressorPressurePsi: 98,
    autoclaveCycles: 60,
    onboardEquipments: [
      '2x Cadeiras Kavo Primus Acessíveis com Elevador Cadeirante',
      'Compressor Schulz 50L Odonto',
      'Gerador de Energia 12kVA Bivolt',
      'Sistema de Teleodontologia via Satélite Starlink'
    ]
  }
];

export const initialOccurrences: VehicleOccurrence[] = [
  {
    id: 'occ_01',
    unitId: 'unit_04',
    unitIdentifier: 'Carreta Odonto 04 - Região Metropolitana',
    title: 'Pneu traseiro estourado durante deslocamento intermunicipal',
    occurrenceType: 'Pneu Estourado',
    location: 'Rodovia Castelo Branco, KM 72 - Sentido Sorocaba / Interior',
    severity: 'Crítica',
    status: 'Em Atendimento',
    description: 'Pneu externo do rodado duplo traseiro direito estourou ao transpor detrito na pista. O cavalo mecânico estacionou no acostamento seguro. Não houve choque nem danos na clínica odontológica interna. Guincho e borracharia móvel acionados pela seguradora Porto Seguro.',
    reportedBy: 'Rogério Nascimento',
    reportedRole: 'Motorista',
    reportedAt: '2026-09-27T16:20:00.000Z',
    estimatedCost: 1850.00
  },
  {
    id: 'occ_02',
    unitId: 'unit_03',
    unitIdentifier: 'Carreta Odonto 03 - Vale do Paraíba',
    title: 'Oscilação anormal de pressão no compressor odontológico principal',
    occurrenceType: 'Vazamento no Compressor Odontológico',
    location: 'UBS Quiririm - Rod. Floriano Rodrigues Pinheiro, KM 4 - Taubaté - SP',
    severity: 'Alta',
    status: 'Pendente',
    description: 'Pressão do compressor oscila e cai para 68 PSI durante acionamento simultâneo das canetas de alta rotação nos consultórios 1 e 2. Possível microvazamento na mangueira de ar comprimido ou necessidade de regulagem no pressostato.',
    reportedBy: 'Dra. Beatriz Santos',
    reportedRole: 'Cirurgião-Dentista',
    reportedAt: '2026-09-27T11:45:00.000Z',
    estimatedCost: 450.00
  },
  {
    id: 'occ_03',
    unitId: 'unit_01',
    unitIdentifier: 'Carreta Odonto 01 - SUS Campinas',
    title: 'Descarga da bateria auxiliar do gerador diesel',
    occurrenceType: 'Falha no Gerador de Energia',
    location: 'UBS Parque Prado - Av. Washington Luiz, 2800 - Campinas - SP',
    severity: 'Média',
    status: 'Resolvido',
    description: 'Gerador apresentou dificuldade no arranque matinal devido a sulfatação na bateria 12V 100Ah. Eletricista de plantão efetuou troca por bateria nova Heliar e testou carga do alternador.',
    reportedBy: 'Dr. Carlos Eduardo Lima',
    reportedRole: 'Coordenador',
    reportedAt: '2026-09-25T07:15:00.000Z',
    resolvedAt: '2026-09-25T10:30:00.000Z',
    resolvedBy: 'Marcos Rogério (Técnico Eletricista)',
    resolutionNotes: 'Bateria substituída com sucesso. Teste de 1h contínua com carga completa dos 3 consultórios.',
    estimatedCost: 890.00
  }
];

export const initialLocationLogs: LocationUpdateLog[] = [
  {
    id: 'log_loc_01',
    unitId: 'unit_01',
    unitIdentifier: 'Carreta Odonto 01 - SUS Campinas',
    city: 'Campinas - SP',
    address: 'UBS Parque Prado - Av. Washington Luiz, 2800',
    odometer: 42350,
    status: 'Em Atendimento',
    notes: 'Início da campanha odontológica de prevenção e restauração no bairro Parque Prado.',
    updatedBy: 'Rogério Nascimento',
    updatedRole: 'Motorista',
    updatedAt: '2026-09-22T08:00:00.000Z'
  },
  {
    id: 'log_loc_02',
    unitId: 'unit_02',
    unitIdentifier: 'Carreta Odonto 02 - Circuito das Águas',
    city: 'Amparo - SP',
    address: 'Praça Pádua Salles, Centro de Eventos - Centro',
    odometer: 28410,
    status: 'Em Atendimento',
    notes: 'Posicionada na praça central ao lado da rede elétrica municipal e ponto de hidrante.',
    updatedBy: 'Dr. Carlos Eduardo Lima',
    updatedRole: 'Coordenador',
    updatedAt: '2026-09-24T09:30:00.000Z'
  },
  {
    id: 'log_loc_03',
    unitId: 'unit_04',
    unitIdentifier: 'Carreta Odonto 04 - Região Metropolitana',
    city: 'Itu / Sorocaba - SP',
    address: 'Rodovia Castelo Branco KM 72 - Acostamento',
    odometer: 15800,
    status: 'Em Trânsito',
    notes: 'Parada emergencial no acostamento após estouro de pneu. Aguardando troca.',
    updatedBy: 'Rogério Nascimento',
    updatedRole: 'Motorista',
    updatedAt: '2026-09-27T16:25:00.000Z'
  }
];

export const initialInventory: InventoryItem[] = [
  {
    id: 'inv_01',
    name: 'Anestésico Cloridrato de Lidocaína 2% c/ Epinefrina 1:100.000 (DFL)',
    category: 'Anestésicos & Medicamentos',
    currentQuantity: 28,
    minQuantity: 15,
    unit: 'caixa',
    batchNumber: 'LID-2026-904',
    expiryDate: '2027-11-30',
    allocatedUnitId: 'unit_01',
    allocatedUnitName: 'Carreta Odonto 01 - SUS Campinas',
    status: 'Adequado',
    lastMovementDate: '2026-09-20'
  },
  {
    id: 'inv_02',
    name: 'Anestésico Cloridrato de Articaína 4% c/ Epinefrina 1:100.000',
    category: 'Anestésicos & Medicamentos',
    currentQuantity: 6,
    minQuantity: 10,
    unit: 'caixa',
    batchNumber: 'ART-2026-112',
    expiryDate: '2027-08-15',
    allocatedUnitId: 'unit_01',
    allocatedUnitName: 'Carreta Odonto 01 - SUS Campinas',
    status: 'Baixo',
    lastMovementDate: '2026-09-25'
  },
  {
    id: 'inv_03',
    name: 'Agulha Gengival Descartável Curta 30G (cx c/ 100 un)',
    category: 'Descartáveis & EPI',
    currentQuantity: 45,
    minQuantity: 20,
    unit: 'caixa',
    batchNumber: 'AG-8891-K',
    expiryDate: '2028-05-20',
    allocatedUnitId: 'unit_01',
    allocatedUnitName: 'Carreta Odonto 01 - SUS Campinas',
    status: 'Adequado',
    lastMovementDate: '2026-09-18'
  },
  {
    id: 'inv_04',
    name: 'Resina Composta Nanohíbrida Cor A2 (Filtek Z350 XT 4g)',
    category: 'Resinas & Restauradores',
    currentQuantity: 18,
    minQuantity: 8,
    unit: 'tubete',
    batchNumber: 'RES-441-A2',
    expiryDate: '2028-01-10',
    allocatedUnitId: 'unit_01',
    allocatedUnitName: 'Carreta Odonto 01 - SUS Campinas',
    status: 'Adequado',
    lastMovementDate: '2026-09-22'
  },
  {
    id: 'inv_05',
    name: 'Resina Composta Nanohíbrida Cor A3 (Filtek Z350 XT 4g)',
    category: 'Resinas & Restauradores',
    currentQuantity: 4,
    minQuantity: 10,
    unit: 'tubete',
    batchNumber: 'RES-442-A3',
    expiryDate: '2027-12-05',
    allocatedUnitId: 'unit_02',
    allocatedUnitName: 'Carreta Odonto 02 - Circuito das Águas',
    status: 'Baixo',
    lastMovementDate: '2026-09-26'
  },
  {
    id: 'inv_06',
    name: 'Ácido Fosfórico 37% Gel Condicionador (kit c/ 3 seringas)',
    category: 'Resinas & Restauradores',
    currentQuantity: 14,
    minQuantity: 6,
    unit: 'kit',
    batchNumber: 'ACD-998',
    expiryDate: '2027-10-30',
    allocatedUnitId: 'unit_01',
    allocatedUnitName: 'Carreta Odonto 01 - SUS Campinas',
    status: 'Adequado',
    lastMovementDate: '2026-09-15'
  },
  {
    id: 'inv_07',
    name: 'Adesivo Odontológico Monocomponente Single Bond Universal',
    category: 'Resinas & Restauradores',
    currentQuantity: 2,
    minQuantity: 5,
    unit: 'frasco',
    batchNumber: 'SBU-773',
    expiryDate: '2027-04-12',
    allocatedUnitId: 'unit_03',
    allocatedUnitName: 'Carreta Odonto 03 - Vale do Paraíba',
    status: 'Crítico',
    lastMovementDate: '2026-09-24'
  },
  {
    id: 'inv_08',
    name: 'Luva de Procedimento Nitrílica Azul Tamanho M (cx c/ 100)',
    category: 'Descartáveis & EPI',
    currentQuantity: 95,
    minQuantity: 40,
    unit: 'caixa',
    batchNumber: 'LUV-019-M',
    expiryDate: '2029-01-30',
    allocatedUnitId: 'central',
    allocatedUnitName: 'Almoxarifado Central',
    status: 'Adequado',
    lastMovementDate: '2026-09-25'
  },
  {
    id: 'inv_09',
    name: 'Sugador Odontológico Descartável Flexível (pct c/ 40 un)',
    category: 'Descartáveis & EPI',
    currentQuantity: 60,
    minQuantity: 25,
    unit: 'pacote',
    batchNumber: 'SUG-551',
    expiryDate: '2028-09-15',
    allocatedUnitId: 'unit_01',
    allocatedUnitName: 'Carreta Odonto 01 - SUS Campinas',
    status: 'Adequado',
    lastMovementDate: '2026-09-21'
  },
  {
    id: 'inv_10',
    name: 'Envelope Autosselante p/ Esterilização em Autoclave (cx c/ 200)',
    category: 'Esterilização & Biossegurança',
    currentQuantity: 12,
    minQuantity: 10,
    unit: 'caixa',
    batchNumber: 'ENV-334',
    expiryDate: '2029-06-30',
    allocatedUnitId: 'unit_01',
    allocatedUnitName: 'Carreta Odonto 01 - SUS Campinas',
    status: 'Adequado',
    lastMovementDate: '2026-09-19'
  },
  {
    id: 'inv_11',
    name: 'Óleo Sintético Lubrificante p/ Turbinas e Canetas Alta Rotação',
    category: 'Peças & Manutenção de Veículo',
    currentQuantity: 8,
    minQuantity: 4,
    unit: 'frasco',
    batchNumber: 'LUB-780',
    expiryDate: '2028-03-31',
    allocatedUnitId: 'central',
    allocatedUnitName: 'Almoxarifado Central',
    status: 'Adequado',
    lastMovementDate: '2026-09-10'
  },
  {
    id: 'inv_12',
    name: 'Kit de Pneus Rodoviários Pesados 295/80R22.5 Michelin',
    category: 'Peças & Manutenção de Veículo',
    currentQuantity: 2,
    minQuantity: 4,
    unit: 'unidade',
    batchNumber: 'MICH-295-80',
    expiryDate: '2030-12-31',
    allocatedUnitId: 'central',
    allocatedUnitName: 'Almoxarifado Central',
    status: 'Baixo',
    lastMovementDate: '2026-09-27'
  }
];

export const initialPatients: PatientClient[] = [
  {
    id: 'pat_01',
    name: 'Ana Carolina Silveira',
    cpf: '234.567.890-12',
    phone: '(19) 99876-5432',
    birthDate: '1988-04-12',
    city: 'Campinas - SP',
    address: 'Rua das Amoreiras, 142 - Parque Prado',
    susCardNumber: '789123456789012',
    primaryProfessionalName: 'Dra. Beatriz Santos',
    primaryProfessionalCro: 'SP-CD-78201',
    registeredAt: '2026-09-18T10:00:00.000Z',
    kinshipContactName: 'Cláudio Silveira',
    kinshipRelation: 'Cônjuge',
    kinshipPhone: '(19) 99876-1122',
    attendances: [
      {
        id: 'att_01',
        procedureName: 'Restauração em Resina Composta (Dentes 14 e 15)',
        date: '2026-09-25T14:30:00.000Z',
        durationMinutes: 45,
        unitId: 'unit_01',
        unitName: 'Carreta Odonto 01 - SUS Campinas',
        city: 'Campinas',
        professionalName: 'Dra. Beatriz Santos',
        professionalCro: 'SP-CD-78201',
        professionalRole: 'Cirurgião-Dentista',
        clinicalNotes: 'Remoção de lesão cariosa oclusal profunda e restauração fotopolimerizável com Resina Filtek Z350 XT cor A2. Ajuste oclusal e polimento satisfatório.'
      },
      {
        id: 'att_02',
        procedureName: 'Profilaxia e Raspagem Supragengival',
        date: '2026-09-18T10:30:00.000Z',
        durationMinutes: 30,
        unitId: 'unit_01',
        unitName: 'Carreta Odonto 01 - SUS Campinas',
        city: 'Campinas',
        professionalName: 'Marcos Vinicius Alves',
        professionalCro: 'SP-TSB-1249',
        professionalRole: 'Técnico em Saúde Bucal (TSB)',
        clinicalNotes: 'Remoção de biofilme dental calcificado em sextante anteroinferior com ultrassom e profilaxia com pasta profilática.'
      }
    ]
  },
  {
    id: 'pat_02',
    name: 'José Roberto de Andrade',
    cpf: '145.890.321-45',
    phone: '(19) 98711-2233',
    birthDate: '1962-11-03',
    city: 'Campinas - SP',
    address: 'Av. Washington Luiz, 310 - Bloco B',
    susCardNumber: '892019283019283',
    primaryProfessionalName: 'Dra. Beatriz Santos',
    primaryProfessionalCro: 'SP-CD-78201',
    registeredAt: '2026-09-24T08:30:00.000Z',
    kinshipContactName: 'Maria de Lourdes Andrade',
    kinshipRelation: 'Cônjuge',
    kinshipPhone: '(19) 98711-5544',
    attendances: [
      {
        id: 'att_03',
        procedureName: 'Exodontia Simples de Resto Radicular (Dente 36)',
        date: '2026-09-24T09:00:00.000Z',
        durationMinutes: 40,
        unitId: 'unit_01',
        unitName: 'Carreta Odonto 01 - SUS Campinas',
        city: 'Campinas',
        professionalName: 'Dra. Beatriz Santos',
        professionalCro: 'SP-CD-78201',
        professionalRole: 'Cirurgião-Dentista',
        clinicalNotes: 'Anestesia por bloqueio alveolar inferior com Lidocaína 2%. Luxação e avulsão sem intercorrências. Sutura com seda 3-0. Paciente orientado.'
      }
    ]
  },
  {
    id: 'pat_03',
    name: 'Mariana Costa Fagundes',
    cpf: '312.445.678-90',
    phone: '(19) 99654-1199',
    birthDate: '2015-08-20',
    city: 'Amparo - SP',
    address: 'Rua XV de Novembro, 88 - Centro',
    susCardNumber: '702938475619283',
    primaryProfessionalName: 'Dr. Carlos Eduardo Lima',
    primaryProfessionalCro: 'SP-CD-45892',
    registeredAt: '2026-09-26T13:00:00.000Z',
    kinshipContactName: 'Patrícia Costa Fagundes',
    kinshipRelation: 'Mãe / Responsável Legal',
    kinshipPhone: '(19) 99654-8877',
    attendances: [
      {
        id: 'att_04',
        procedureName: 'Aplicação Tópica de Flúor e Selante de Fóssulas',
        date: '2026-09-26T13:15:00.000Z',
        durationMinutes: 25,
        unitId: 'unit_02',
        unitName: 'Carreta Odonto 02 - Circuito das Águas',
        city: 'Amparo',
        professionalName: 'Dr. Carlos Eduardo Lima',
        professionalCro: 'SP-CD-45892',
        professionalRole: 'Coordenador',
        clinicalNotes: 'Profilaxia pediátrica, aplicação de selante de fóssulas e fissuras nos primeiros molares permanentes (16, 26, 36, 46) e aplicação tópica de flúor fosfato acidulado.'
      }
    ]
  },
  {
    id: 'pat_04',
    name: 'Benedito dos Santos Souza',
    cpf: '089.332.114-87',
    phone: '(12) 99182-7364',
    birthDate: '1955-03-15',
    city: 'Taubaté - SP',
    address: 'Estrada Velha de Quiririm, 500',
    susCardNumber: '891029384756192',
    primaryProfessionalName: 'Dra. Juliana Mendes',
    primaryProfessionalCro: 'SP-CD-89102',
    registeredAt: '2026-09-22T09:30:00.000Z',
    kinshipContactName: 'Sebastião Souza',
    kinshipRelation: 'Filho(a)',
    kinshipPhone: '(12) 99182-9900',
    attendances: [
      {
        id: 'att_05',
        procedureName: 'Moldagem Funcional para Prótese Total Superior',
        date: '2026-09-22T10:00:00.000Z',
        durationMinutes: 50,
        unitId: 'unit_03',
        unitName: 'Carreta Odonto 03 - Vale do Paraíba',
        city: 'Taubaté',
        professionalName: 'Dra. Juliana Mendes',
        professionalCro: 'SP-CD-89102',
        professionalRole: 'Admin',
        clinicalNotes: 'Moldagem com moldeira individual e pasta de óxido de zinco e eugenol. Envio para bancada protética da carreta.'
      }
    ]
  },
  {
    id: 'pat_05',
    name: 'Camila Fernandes Braga',
    cpf: '456.789.012-33',
    phone: '(19) 98456-7890',
    birthDate: '1997-12-05',
    city: 'Campinas - SP',
    address: 'Rua Barão de Jaguara, 1020 - Centro',
    susCardNumber: '782910293847561',
    primaryProfessionalName: 'Dra. Beatriz Santos',
    primaryProfessionalCro: 'SP-CD-78201',
    registeredAt: '2026-09-26T15:00:00.000Z',
    kinshipContactName: 'Renata Fernandes Braga',
    kinshipRelation: 'Irmã',
    kinshipPhone: '(19) 98456-1100',
    attendances: [
      {
        id: 'att_06',
        procedureName: 'Urgência Odontológica / Curativo Sedativo Pulpar',
        date: '2026-09-26T15:30:00.000Z',
        durationMinutes: 35,
        unitId: 'unit_01',
        unitName: 'Carreta Odonto 01 - SUS Campinas',
        city: 'Campinas',
        professionalName: 'Dra. Beatriz Santos',
        professionalCro: 'SP-CD-78201',
        professionalRole: 'Cirurgião-Dentista',
        clinicalNotes: 'Queixa de dor espontânea e pulsátil no elemento 24. Abertura coronária, instrumentação e medicação intracanal analgésica com selamento provisório.'
      }
    ]
  },
  {
    id: 'pat_06',
    name: 'Everaldo Martins de Oliveira',
    cpf: '567.123.890-44',
    phone: '(19) 97654-3210',
    birthDate: '1974-06-28',
    city: 'Campinas - SP',
    address: 'Rua São José do Rio Pardo, 45',
    susCardNumber: '891273918273918',
    primaryProfessionalName: 'Dra. Beatriz Santos',
    primaryProfessionalCro: 'SP-CD-78201',
    registeredAt: '2026-09-27T09:00:00.000Z',
    attendances: [
      {
        id: 'att_07',
        procedureName: 'Restauração em Resina Composta (Dente 21 Estético)',
        date: '2026-09-27T09:30:00.000Z',
        durationMinutes: 50,
        unitId: 'unit_01',
        unitName: 'Carreta Odonto 01 - SUS Campinas',
        city: 'Campinas',
        professionalName: 'Dra. Beatriz Santos',
        professionalCro: 'SP-CD-78201',
        professionalRole: 'Cirurgião-Dentista',
        clinicalNotes: 'Fratura de ângulo incisal classe IV. Estratificação de esmalte e dentina, acabamento com discos Sof-Lex. Resultado estético excelente.'
      },
      {
        id: 'att_08',
        procedureName: 'Profilaxia e Raspagem Supragengival',
        date: '2026-09-27T10:30:00.000Z',
        durationMinutes: 30,
        unitId: 'unit_01',
        unitName: 'Carreta Odonto 01 - SUS Campinas',
        city: 'Campinas',
        professionalName: 'Marcos Vinicius Alves',
        professionalCro: 'SP-TSB-1249',
        professionalRole: 'Técnico em Saúde Bucal (TSB)',
        clinicalNotes: 'Raspagem e polimento coronário geral.'
      }
    ]
  }
];
