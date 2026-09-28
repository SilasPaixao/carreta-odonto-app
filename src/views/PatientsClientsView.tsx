import React, { useState } from 'react';
import { PatientClient, AttendanceRecord, MobileUnit, AppUser, RolePermissions } from '../types';
import { Users, UserPlus, Printer, Search, Plus, Calendar, Clock, FileText, CheckCircle2, Shield, Edit3, Trash2 } from 'lucide-react';

interface PatientsClientsViewProps {
  patients: PatientClient[];
  units: MobileUnit[];
  currentUser: AppUser;
  permissions: RolePermissions;
  onAddPatient: (patient: PatientClient) => void;
  onAddAttendance: (patientId: string, attendance: AttendanceRecord) => void;
  onOpenPrintModal: () => void;
  onUpdatePatient?: (patient: PatientClient) => void;
  onDeletePatient?: (id: string) => void;
}

export const PatientsClientsView: React.FC<PatientsClientsViewProps> = ({
  patients,
  units,
  currentUser,
  permissions,
  onAddPatient,
  onAddAttendance,
  onOpenPrintModal,
  onUpdatePatient,
  onDeletePatient
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddPatientModal, setShowAddPatientModal] = useState(false);
  const [selectedPatientForAttendance, setSelectedPatientForAttendance] = useState<PatientClient | null>(null);
  const [editingPatient, setEditingPatient] = useState<PatientClient | null>(null);
  const [deletingPatient, setDeletingPatient] = useState<PatientClient | null>(null);

  // Edit patient form states
  const [editName, setEditName] = useState('');
  const [editCpf, setEditCpf] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editBirthDate, setEditBirthDate] = useState('1990-01-01');
  const [editCity, setEditCity] = useState('');
  const [editAddress, setEditAddress] = useState('');
  const [editSusCardNumber, setEditSusCardNumber] = useState('');
  const [editKinshipName, setEditKinshipName] = useState('');
  const [editKinshipRelation, setEditKinshipRelation] = useState('Mãe');
  const [editKinshipPhone, setEditKinshipPhone] = useState('');
  const [editProfName, setEditProfName] = useState('');
  const [editProfCro, setEditProfCro] = useState('');

  // New patient form states
  const [name, setName] = useState('');
  const [cpf, setCpf] = useState('');
  const [phone, setPhone] = useState('');
  const [birthDate, setBirthDate] = useState('1990-01-01');
  const [city, setCity] = useState(units[0]?.currentMunicipality.split(' - ')[0] || 'Campinas');
  const [address, setAddress] = useState('');
  const [susCardNumber, setSusCardNumber] = useState('');
  const [kinshipContactName, setKinshipContactName] = useState('');
  const [kinshipRelation, setKinshipRelation] = useState('Mãe');
  const [kinshipPhone, setKinshipPhone] = useState('');
  const [primaryProfessionalName, setPrimaryProfessionalName] = useState(currentUser.name);
  const [primaryProfessionalCro, setPrimaryProfessionalCro] = useState(currentUser.cro || '');

  // New attendance form states
  const [procedureName, setProcedureName] = useState('Profilaxia e Raspagem Supragengival');
  const [durationMinutes, setDurationMinutes] = useState<number>(35);
  const [attendanceUnitId, setAttendanceUnitId] = useState(units[0]?.id || '');
  const [attendanceProfName, setAttendanceProfName] = useState(currentUser.name);
  const [attendanceProfCro, setAttendanceProfCro] = useState(currentUser.cro || 'SP-CD-78201');
  const [clinicalNotes, setClinicalNotes] = useState('');

  const canRegister = currentUser.role === 'Admin' || permissions.registerPatients.includes(currentUser.role);

  // Requirements:
  // "os demais profissionais podem ver todas áreas, porém apenas informações relacionadas a sua determinada carreta"
  const userCanSeeAllUnits =
    currentUser.role === 'Admin' ||
    (currentUser.role === 'Coordenador' && currentUser.hasAccessToAllUnits !== false) ||
    currentUser.hasAccessToAllUnits === true;

  const assignedUnitIds = currentUser.assignedUnitIds || [];

  const filteredPatients = patients.filter(p => {
    // Check carreta restriction: if patient has attendances in other units or user only sees their own carreta
    if (!userCanSeeAllUnits && assignedUnitIds.length > 0) {
      // If patient's primary unit or any registered attendance matches assigned units
      const patientAttendances = p.attendances || [];
      const isLinkedToUnit =
        patientAttendances.some(a => assignedUnitIds.includes(a.unitId)) ||
        (p.primaryProfessionalName === currentUser.name) ||
        (patientAttendances.length === 0); // new patient before attendance
      if (!isLinkedToUnit) return false;
    }

    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      p.name.toLowerCase().includes(term) ||
      p.cpf.includes(term) ||
      p.city.toLowerCase().includes(term) ||
      p.primaryProfessionalName.toLowerCase().includes(term)
    );
  });

  const handleSavePatient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !cpf.trim()) return;

    const newPatient: PatientClient = {
      id: `pat_${Date.now()}`,
      name: name.trim(),
      cpf: cpf.trim(),
      phone: phone.trim() || '(Não informado)',
      birthDate,
      city: city.trim(),
      address: address.trim() || 'Residencial',
      susCardNumber: susCardNumber.trim() || undefined,
      kinshipContactName: kinshipContactName.trim() || undefined,
      kinshipRelation: kinshipRelation.trim() || undefined,
      kinshipPhone: kinshipPhone.trim() || undefined,
      primaryProfessionalName: primaryProfessionalName.trim() || currentUser.name,
      primaryProfessionalCro: primaryProfessionalCro.trim() || (currentUser.cro || 'Sem CRO'),
      registeredAt: new Date().toISOString(),
      attendances: []
    };

    onAddPatient(newPatient);
    setShowAddPatientModal(false);
    resetPatientForm();
  };

  const handleSaveAttendance = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatientForAttendance) return;

    const unit = units.find(u => u.id === attendanceUnitId) || units[0];

    const newAtt: AttendanceRecord = {
      id: `att_${Date.now()}`,
      procedureName,
      date: new Date().toISOString(),
      durationMinutes: Number(durationMinutes) || 30,
      unitId: unit.id,
      unitName: unit.identifier,
      city: unit.currentMunicipality,
      professionalName: attendanceProfName.trim() || currentUser.name,
      professionalCro: attendanceProfCro.trim() || 'N/A',
      professionalRole: currentUser.role,
      clinicalNotes: clinicalNotes.trim() || 'Procedimento realizado sem intercorrências clínicas.'
    };

    onAddAttendance(selectedPatientForAttendance.id, newAtt);
    setSelectedPatientForAttendance(null);
    setClinicalNotes('');
  };

  const resetPatientForm = () => {
    setName('');
    setCpf('');
    setPhone('');
    setAddress('');
    setSusCardNumber('');
    setKinshipContactName('');
    setKinshipRelation('Mãe');
    setKinshipPhone('');
  };

  const commonProcedures = [
    'Profilaxia e Raspagem Supragengival',
    'Restauração em Resina Composta',
    'Exodontia Simples',
    'Aplicação Tópica de Flúor e Selante de Fóssulas',
    'Urgência Odontológica / Curativo Sedativo Pulpar',
    'Moldagem Anatômica para Prótese Dentária',
    'Instalação e Ajuste de Prótese Dentária',
    'Tratamento Endodôntico / Abertura Coronária',
    'Exame Clínico Inicial e Avaliação de Risco'
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Cadastro de Pacientes & Atendimentos Clínicos
          </h1>
          <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
            <span>Área Clínica de Saúde Bucal</span>
            <span aria-hidden="true">·</span>
            <span>Vínculo Profissional & Registro CRO</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono-numbers">{patients.length} pacientes cadastrados</span>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={onOpenPrintModal}
            className="px-4 py-2 text-xs font-semibold text-slate-800 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg shadow-2xs flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Printer className="w-4 h-4 text-slate-600" />
            Imprimir Informações de Clientes (PDF)
          </button>

          {canRegister && (
            <button
              onClick={() => setShowAddPatientModal(true)}
              className="px-4 py-2 text-xs font-semibold text-white bg-teal-700 hover:bg-teal-800 rounded-lg shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              Cadastrar Novo Paciente
            </button>
          )}
        </div>
      </div>

      {/* Search Bar */}
      <div className="p-3.5 bg-white border border-slate-200 rounded-lg flex items-center gap-3 text-xs">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Pesquisar por nome do paciente, CPF, cidade ou dentista responsável..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full px-3 py-1.5 pl-8 border border-slate-300 rounded-md focus:ring-1 focus:ring-teal-600"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-2.5 top-2" />
        </div>
        <div className="text-slate-500 text-xs font-mono-numbers whitespace-nowrap">
          {filteredPatients.length} resultado{filteredPatients.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Patients List and Attendances History */}
      <div className="space-y-4">
        {filteredPatients.length === 0 ? (
          <div className="p-12 text-center text-slate-500 bg-white border border-slate-200 rounded-xl text-xs">
            Nenhum paciente localizado com os termos informados.
          </div>
        ) : (
          filteredPatients.map(patient => (
            <div
              key={patient.id}
              className="p-5 bg-white border border-slate-200 rounded-xl shadow-2xs space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-slate-900">{patient.name}</h3>
                    <span className="text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-mono-numbers">
                      CPF: {patient.cpf}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 flex flex-wrap items-center gap-x-3 gap-y-1">
                    <span>Telefone: <strong className="text-slate-700 font-mono-numbers">{patient.phone}</strong></span>
                    <span aria-hidden="true">·</span>
                    <span>Cidade: {patient.city}</span>
                    <span aria-hidden="true">·</span>
                    <span>Endereço: {patient.address}</span>
                    {patient.susCardNumber && (
                      <>
                        <span aria-hidden="true">·</span>
                        <span className="font-mono-numbers">Cartão SUS: {patient.susCardNumber}</span>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {canRegister && (
                    <button
                      onClick={() => {
                        setEditingPatient(patient);
                        setEditName(patient.name);
                        setEditCpf(patient.cpf);
                        setEditPhone(patient.phone);
                        setEditBirthDate(patient.birthDate);
                        setEditCity(patient.city);
                        setEditAddress(patient.address);
                        setEditSusCardNumber(patient.susCardNumber || '');
                        setEditKinshipName(patient.kinshipContactName || '');
                        setEditKinshipRelation(patient.kinshipRelation || 'Mãe');
                        setEditKinshipPhone(patient.kinshipPhone || '');
                        setEditProfName(patient.primaryProfessionalName);
                        setEditProfCro(patient.primaryProfessionalCro);
                      }}
                      className="px-2.5 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                      title="Editar Dados do Paciente"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-slate-600" />
                      Editar
                    </button>
                  )}

                  {currentUser.role === 'Admin' && (
                    <button
                      onClick={() => setDeletingPatient(patient)}
                      className="px-2.5 py-1.5 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                      title="Excluir Paciente"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                      Excluir
                    </button>
                  )}

                  {canRegister && (
                    <button
                      onClick={() => {
                        setSelectedPatientForAttendance(patient);
                        setAttendanceProfName(currentUser.name);
                        setAttendanceProfCro(currentUser.cro || 'SP-CD-78201');
                      }}
                      className="px-3 py-1.5 text-xs font-semibold text-teal-800 bg-teal-50 hover:bg-teal-100 border border-teal-200 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Novo Procedimento
                    </button>
                  )}
                </div>
              </div>

              {/* Responsible Professional & Kinship Contact Callouts */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-lg flex items-center justify-between text-xs text-slate-700">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-teal-700 shrink-0" />
                    <span>
                      Profissional: <strong>{patient.primaryProfessionalName}</strong>
                    </span>
                  </div>
                  <div className="font-mono-numbers font-medium text-slate-900">
                    CRO: {patient.primaryProfessionalCro || 'Não cadastrado'}
                  </div>
                </div>

                {patient.kinshipContactName ? (
                  <div className="p-3 bg-teal-50/50 border border-teal-200/70 rounded-lg flex items-center justify-between text-xs text-slate-700">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-teal-700 shrink-0" />
                      <span>
                        Parentesco ({patient.kinshipRelation || 'Parente'}): <strong>{patient.kinshipContactName}</strong>
                      </span>
                    </div>
                    {patient.kinshipPhone && (
                      <span className="font-mono-numbers font-medium text-teal-900 bg-white px-2 py-0.5 rounded border border-teal-200">
                        {patient.kinshipPhone}
                      </span>
                    )}
                  </div>
                ) : (
                  <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-lg flex items-center text-xs text-slate-400 italic">
                    Nenhum contato de parentesco informado no cadastro.
                  </div>
                )}
              </div>

              {/* Patient Attendances History */}
              <div>
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
                  Histórico de Procedimentos Realizados ({patient.attendances.length})
                </h4>

                {patient.attendances.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">
                    Nenhum procedimento registrado ainda para este paciente.
                  </p>
                ) : (
                  <div className="border border-slate-200 rounded-lg divide-y divide-slate-100 overflow-hidden">
                    {patient.attendances.map(att => (
                      <div key={att.id} className="p-3 text-xs space-y-1 hover:bg-slate-50/60">
                        <div className="flex justify-between items-start font-semibold text-slate-900">
                          <span>{att.procedureName}</span>
                          <span className="font-mono-numbers text-teal-800 bg-teal-50 px-2 py-0.5 rounded text-[11px]">
                            {att.durationMinutes} minutos de atendimento
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-x-3 text-[11px] text-slate-500">
                          <span className="font-mono-numbers">
                            {new Date(att.date).toLocaleDateString('pt-BR')}
                          </span>
                          <span aria-hidden="true">·</span>
                          <span>{att.unitName} ({att.city})</span>
                          <span aria-hidden="true">·</span>
                          <span>
                            Dentista: <strong>{att.professionalName}</strong> (CRO: <span className="font-mono-numbers">{att.professionalCro}</span>)
                          </span>
                        </div>
                        {att.clinicalNotes && (
                          <p className="text-[11px] text-slate-600 bg-slate-50 p-2 rounded mt-1 border border-slate-100">
                            {att.clinicalNotes}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal: Cadastrar Novo Paciente */}
      {showAddPatientModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="relative w-full max-w-lg bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
              <div className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-teal-700" />
                <h3 className="text-base font-semibold text-slate-900">
                  Cadastrar Novo Paciente / Munícipe
                </h3>
              </div>
              <button
                onClick={() => setShowAddPatientModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSavePatient} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nome Completo do Paciente *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Ex: Maria das Graças Oliveira"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    CPF *
                  </label>
                  <input
                    type="text"
                    required
                    value={cpf}
                    onChange={e => setCpf(e.target.value)}
                    placeholder="000.000.000-00"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-600 font-mono-numbers"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Contato / WhatsApp *
                  </label>
                  <input
                    type="text"
                    required
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="(19) 98765-4321"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-600 font-mono-numbers"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Data de Nascimento
                  </label>
                  <input
                    type="date"
                    value={birthDate}
                    onChange={e => setBirthDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-600 font-mono-numbers"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Cartão Nacional de Saúde (SUS)
                  </label>
                  <input
                    type="text"
                    value={susCardNumber}
                    onChange={e => setSusCardNumber(e.target.value)}
                    placeholder="7000..."
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-600 font-mono-numbers"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Município de Residência
                  </label>
                  <input
                    type="text"
                    value={city}
                    onChange={e => setCity(e.target.value)}
                    placeholder="Ex: Campinas - SP"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Endereço / Bairro
                  </label>
                  <input
                    type="text"
                    value={address}
                    onChange={e => setAddress(e.target.value)}
                    placeholder="Rua, número e bairro"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-600"
                  />
                </div>
              </div>

              {/* Contato de Parentesco / Responsável Legal */}
              <div className="p-3.5 bg-teal-50/50 border border-teal-200 rounded-lg space-y-3">
                <div className="flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-teal-700" />
                  <span className="text-xs font-bold text-slate-900 block">
                    Contato de Parentesco / Responsável *
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Nome do Parente / Responsável *
                    </label>
                    <input
                      type="text"
                      required
                      value={kinshipContactName}
                      onChange={e => setKinshipContactName(e.target.value)}
                      placeholder="Ex: Cláudio Silveira"
                      className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-md focus:ring-1 focus:ring-teal-600 bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Grau de Parentesco *
                    </label>
                    <select
                      value={kinshipRelation}
                      onChange={e => setKinshipRelation(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-md focus:ring-1 focus:ring-teal-600 bg-white"
                    >
                      <option value="Mãe">Mãe</option>
                      <option value="Pai">Pai</option>
                      <option value="Cônjuge">Cônjuge / Companheiro(a)</option>
                      <option value="Filho(a)">Filho(a)</option>
                      <option value="Irmão/Irmã">Irmão/Irmã</option>
                      <option value="Avô/Avó">Avô/Avó</option>
                      <option value="Tio(a)">Tio(a)</option>
                      <option value="Responsável Legal">Responsável Legal</option>
                      <option value="Outro">Outro</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Telefone do Parente *
                    </label>
                    <input
                      type="text"
                      required
                      value={kinshipPhone}
                      onChange={e => setKinshipPhone(e.target.value)}
                      placeholder="(19) 99876-1122"
                      className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-md focus:ring-1 focus:ring-teal-600 bg-white font-mono-numbers"
                    />
                  </div>
                </div>
              </div>

              {/* Responsible Professional & CRO requirement as stated in prompt */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-3">
                <span className="text-xs font-bold text-slate-900 block">
                  Profissional de Saúde Responsável pelo Cadastro:
                </span>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Nome do Profissional Responsável *
                    </label>
                    <input
                      type="text"
                      required
                      value={primaryProfessionalName}
                      onChange={e => setPrimaryProfessionalName(e.target.value)}
                      placeholder="Dra. Beatriz Santos"
                      className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-md focus:ring-1 focus:ring-teal-600 bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Número do CRO do Profissional *
                    </label>
                    <input
                      type="text"
                      required
                      value={primaryProfessionalCro}
                      onChange={e => setPrimaryProfessionalCro(e.target.value)}
                      placeholder="SP-CD-78201"
                      className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-md focus:ring-1 focus:ring-teal-600 bg-white font-mono-numbers"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddPatientModal(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-teal-700 hover:bg-teal-800 rounded-lg transition-colors cursor-pointer"
                >
                  Salvar Paciente
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Registrar Novo Procedimento / Atendimento */}
      {selectedPatientForAttendance && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="relative w-full max-w-lg bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
              <div className="flex items-center gap-2">
                <Plus className="w-5 h-5 text-teal-700" />
                <h3 className="text-base font-semibold text-slate-900">
                  Lançar Atendimento Clínico
                </h3>
              </div>
              <button
                onClick={() => setSelectedPatientForAttendance(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveAttendance} className="p-6 space-y-4">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs">
                <span className="text-slate-500 block">Paciente:</span>
                <span className="font-bold text-slate-900 text-sm">
                  {selectedPatientForAttendance.name} (CPF: {selectedPatientForAttendance.cpf})
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Procedimento Realizado *
                </label>
                <select
                  value={procedureName}
                  onChange={e => setProcedureName(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-600 bg-white"
                >
                  {commonProcedures.map(p => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Tempo de Duração (Minutos) *
                  </label>
                  <input
                    type="number"
                    min={5}
                    max={240}
                    required
                    value={durationMinutes}
                    onChange={e => setDurationMinutes(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-600 font-mono-numbers"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Unidade Móvel do Atendimento *
                  </label>
                  <select
                    value={attendanceUnitId}
                    onChange={e => setAttendanceUnitId(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-600 bg-white"
                  >
                    {units.map(u => (
                      <option key={u.id} value={u.id}>{u.identifier}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nome do Profissional Responsável *
                  </label>
                  <input
                    type="text"
                    required
                    value={attendanceProfName}
                    onChange={e => setAttendanceProfName(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Número do CRO *
                  </label>
                  <input
                    type="text"
                    required
                    value={attendanceProfCro}
                    onChange={e => setAttendanceProfCro(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-600 font-mono-numbers"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Evolução Clínica / Anotações
                </label>
                <textarea
                  rows={2}
                  value={clinicalNotes}
                  onChange={e => setClinicalNotes(e.target.value)}
                  placeholder="Dentes envolvidos, material empregado, conduta e orientações passadas ao paciente..."
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-600"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedPatientForAttendance(null)}
                  className="px-4 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-teal-700 hover:bg-teal-800 rounded-lg transition-colors cursor-pointer"
                >
                  Gravar Procedimento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Edit Patient */}
      {editingPatient && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="relative w-full max-w-xl bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
              <div className="flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-teal-700" />
                <h3 className="text-base font-semibold text-slate-900">
                  Editar Prontuário / Dados do Paciente
                </h3>
              </div>
              <button
                onClick={() => setEditingPatient(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!editingPatient || !editName.trim() || !editCpf.trim()) return;

                const updated: PatientClient = {
                  ...editingPatient,
                  name: editName.trim(),
                  cpf: editCpf.trim(),
                  phone: editPhone.trim() || '(Não informado)',
                  birthDate: editBirthDate,
                  city: editCity.trim(),
                  address: editAddress.trim(),
                  susCardNumber: editSusCardNumber.trim() || undefined,
                  kinshipContactName: editKinshipName.trim() || undefined,
                  kinshipRelation: editKinshipRelation.trim() || undefined,
                  kinshipPhone: editKinshipPhone.trim() || undefined,
                  primaryProfessionalName: editProfName.trim() || editingPatient.primaryProfessionalName,
                  primaryProfessionalCro: editProfCro.trim() || editingPatient.primaryProfessionalCro
                };

                if (onUpdatePatient) onUpdatePatient(updated);
                setEditingPatient(null);
              }}
              className="p-6 space-y-4 max-h-[85vh] overflow-y-auto"
            >
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nome Completo do Paciente *
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
                    CPF *
                  </label>
                  <input
                    type="text"
                    required
                    value={editCpf}
                    onChange={e => setEditCpf(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-600 font-mono-numbers"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Contato / WhatsApp
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
                    Data de Nascimento
                  </label>
                  <input
                    type="date"
                    value={editBirthDate}
                    onChange={e => setEditBirthDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-600 font-mono-numbers"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Cartão Nacional de Saúde (SUS)
                  </label>
                  <input
                    type="text"
                    value={editSusCardNumber}
                    onChange={e => setEditSusCardNumber(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-600 font-mono-numbers"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Município de Residência
                  </label>
                  <input
                    type="text"
                    value={editCity}
                    onChange={e => setEditCity(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Endereço / Bairro
                  </label>
                  <input
                    type="text"
                    value={editAddress}
                    onChange={e => setEditAddress(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-600"
                  />
                </div>
              </div>

              {/* Contato de Parentesco / Responsável */}
              <div className="p-3.5 bg-teal-50/50 border border-teal-200 rounded-lg space-y-3">
                <div className="flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-teal-700" />
                  <span className="text-xs font-bold text-slate-900 block">
                    Contato de Parentesco / Responsável Legal
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Nome do Parente
                    </label>
                    <input
                      type="text"
                      value={editKinshipName}
                      onChange={e => setEditKinshipName(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-md focus:ring-1 focus:ring-teal-600 bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Grau de Parentesco
                    </label>
                    <select
                      value={editKinshipRelation}
                      onChange={e => setEditKinshipRelation(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-md focus:ring-1 focus:ring-teal-600 bg-white"
                    >
                      <option value="Mãe">Mãe</option>
                      <option value="Pai">Pai</option>
                      <option value="Cônjuge">Cônjuge / Companheiro(a)</option>
                      <option value="Filho(a)">Filho(a)</option>
                      <option value="Irmão/Irmã">Irmão/Irmã</option>
                      <option value="Avô/Avó">Avô/Avó</option>
                      <option value="Tio(a)">Tio(a)</option>
                      <option value="Responsável Legal">Responsável Legal</option>
                      <option value="Outro">Outro</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Telefone do Parente
                    </label>
                    <input
                      type="text"
                      value={editKinshipPhone}
                      onChange={e => setEditKinshipPhone(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-md focus:ring-1 focus:ring-teal-600 bg-white font-mono-numbers"
                    />
                  </div>
                </div>
              </div>

              {/* Profissional de Referência */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-3">
                <span className="text-xs font-bold text-slate-900 block">
                  Profissional de Saúde de Referência:
                </span>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Nome do Profissional
                    </label>
                    <input
                      type="text"
                      value={editProfName}
                      onChange={e => setEditProfName(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-md focus:ring-1 focus:ring-teal-600 bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Número do CRO
                    </label>
                    <input
                      type="text"
                      value={editProfCro}
                      onChange={e => setEditProfCro(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-md focus:ring-1 focus:ring-teal-600 bg-white font-mono-numbers"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingPatient(null)}
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

      {/* Modal: Delete Patient Confirmation */}
      {deletingPatient && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="relative w-full max-w-md bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden p-6 space-y-4">
            <div className="flex items-center gap-3 text-rose-700">
              <div className="p-2.5 bg-rose-50 rounded-full">
                <Trash2 className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">
                Confirmar Exclusão de Prontuário
              </h3>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Você tem certeza que deseja excluir o cadastro e prontuário de{' '}
              <strong className="text-slate-900">{deletingPatient.name}</strong> (CPF: {deletingPatient.cpf})?
              Esta ação removerá todos os {deletingPatient.attendances.length} procedimentos registrados para este paciente.
            </p>

            <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setDeletingPatient(null)}
                className="px-4 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  if (onDeletePatient) onDeletePatient(deletingPatient.id);
                  setDeletingPatient(null);
                }}
                className="px-4 py-2 text-xs font-semibold text-white bg-rose-700 hover:bg-rose-800 rounded-lg transition-colors cursor-pointer"
              >
                Sim, Excluir Paciente
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
