import React, { useState } from 'react';
import { MobileUnit, AppUser, RolePermissions } from '../types';
import { Truck, PlusCircle, Shield, CheckCircle2, AlertCircle, Wrench, Settings, Trash2, Edit3 } from 'lucide-react';

interface MobileUnitsAdminViewProps {
  units: MobileUnit[];
  currentUser: AppUser;
  permissions: RolePermissions;
  onAddUnit: (unit: MobileUnit) => void;
  onUpdateUnit: (unit: MobileUnit) => void;
  onDeleteUnit: (id: string) => void;
}

export const MobileUnitsAdminView: React.FC<MobileUnitsAdminViewProps> = ({
  units,
  currentUser,
  permissions,
  onAddUnit,
  onUpdateUnit,
  onDeleteUnit
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingUnit, setEditingUnit] = useState<MobileUnit | null>(null);
  const [deletingUnit, setDeletingUnit] = useState<MobileUnit | null>(null);

  // Form states (Add)
  const [identifier, setIdentifier] = useState('');
  const [plate, setPlate] = useState('');
  const [chassis, setChassis] = useState('');
  const [model, setModel] = useState('');
  const [year, setYear] = useState<number>(2024);
  const [numberOfChairs, setNumberOfChairs] = useState<number>(2);
  const [currentMunicipality, setCurrentMunicipality] = useState('');
  const [currentAddress, setCurrentAddress] = useState('');
  const [odometer, setOdometer] = useState<number>(0);
  const [status, setStatus] = useState<MobileUnit['status']>('Disponível');
  const [equipmentsText, setEquipmentsText] = useState(
    'Cadeiras Odontológicas com LED, Autoclave Cristófoli 21L, Compressor de Ar Silencioso, Gerador Diesel 15kVA, Ar Condicionado Split'
  );

  // Form states (Edit)
  const [editIdentifier, setEditIdentifier] = useState('');
  const [editPlate, setEditPlate] = useState('');
  const [editChassis, setEditChassis] = useState('');
  const [editModel, setEditModel] = useState('');
  const [editYear, setEditYear] = useState<number>(2024);
  const [editNumberOfChairs, setEditNumberOfChairs] = useState<number>(2);
  const [editMunicipality, setEditMunicipality] = useState('');
  const [editAddress, setEditAddress] = useState('');
  const [editOdometer, setEditOdometer] = useState<number>(0);
  const [editStatus, setEditStatus] = useState<MobileUnit['status']>('Disponível');
  const [editEquipmentsText, setEditEquipmentsText] = useState('');

  // Check permissions:
  // "o admin pode dar permissão de cadastro(s), para coordenadores ou outro usuário"
  const canRegister = currentUser.role === 'Admin' || permissions.registerMobileUnits.includes(currentUser.role);

  const handleSaveNewUnit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim() || !plate.trim()) return;

    const equipmentsList = equipmentsText
      .split(',')
      .map(item => item.trim())
      .filter(item => item.length > 0);

    const newUnit: MobileUnit = {
      id: `unit_${Date.now()}`,
      identifier: identifier.trim(),
      plate: plate.trim().toUpperCase(),
      chassis: chassis.trim() || `9BF${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
      model: model.trim() || 'Carreta Semirreboque Clínico Odontológico',
      year: Number(year),
      numberOfChairs: Number(numberOfChairs),
      currentMunicipality: currentMunicipality.trim() || 'Prefeitura Municipal em Trânsito',
      currentAddress: currentAddress.trim() || 'Pátio Central / Garagem',
      status,
      odometer: Number(odometer),
      nextMaintenanceKm: Number(odometer) + 10000,
      lastMaintenanceDate: new Date().toISOString().split('T')[0],
      onboardEquipments: equipmentsList,
      compressorPressurePsi: 95,
      generatorHours: 0,
      autoclaveCycles: 0
    };

    onAddUnit(newUnit);
    setShowAddModal(false);
    resetForm();
  };

  const resetForm = () => {
    setIdentifier('');
    setPlate('');
    setChassis('');
    setModel('');
    setYear(2024);
    setNumberOfChairs(2);
    setCurrentMunicipality('');
    setCurrentAddress('');
    setOdometer(0);
    setStatus('Disponível');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Gerenciamento & Cadastro de Unidades Móveis
          </h1>
          <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
            <span>Controle Patrimonial de Carretas Odontológicas</span>
            <span aria-hidden="true">·</span>
            <span>Área com Permissões Restritas</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono-numbers">{units.length} unidades registradas</span>
          </div>
        </div>

        {canRegister && (
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 text-xs font-semibold text-white bg-teal-700 hover:bg-teal-800 rounded-lg shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            Cadastrar Nova Unidade Móvel
          </button>
        )}
      </div>

      {/* Admin Notice */}
      <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 flex items-start gap-2.5">
        <Shield className="w-4 h-4 text-teal-700 shrink-0 mt-0.5" />
        <div>
          <strong className="text-slate-900 font-semibold block">Regra de Acesso e Governança:</strong>
          Esta área é visível exclusivamente aos Administradores por padrão. Na subárea de <strong>Permissões</strong>, o Administrador pode estender a visibilidade e o direito de cadastro para Coordenadores ou outros cargos.
        </div>
      </div>

      {/* Grid of registered units */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {units.map((unit) => (
          <div
            key={unit.id}
            className="p-5 bg-white border border-slate-200 rounded-xl shadow-2xs space-y-4 hover:shadow-xs transition-shadow"
          >
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[11px] font-semibold text-teal-700 uppercase tracking-wider block">
                  {unit.numberOfChairs} Consultório{unit.numberOfChairs > 1 ? 's' : ''} Clínico{unit.numberOfChairs > 1 ? 's' : ''}
                </span>
                <h3 className="text-base font-bold text-slate-900">{unit.identifier}</h3>
              </div>
              <span
                className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${
                  unit.status === 'Em Atendimento'
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : unit.status === 'Em Trânsito'
                    ? 'bg-blue-50 text-blue-800 border border-blue-200'
                    : 'bg-amber-50 text-amber-800 border border-amber-200'
                }`}
              >
                {unit.status}
              </span>
            </div>

            <div className="space-y-1.5 text-xs text-slate-600">
              <div className="flex justify-between">
                <span>Placa Rodoviária:</span>
                <span className="font-mono-numbers font-semibold text-slate-900">{unit.plate}</span>
              </div>
              <div className="flex justify-between">
                <span>Chassi:</span>
                <span className="font-mono-numbers text-slate-700 text-[11px]">{unit.chassis}</span>
              </div>
              <div className="flex justify-between">
                <span>Ano de Fabricação:</span>
                <span className="font-mono-numbers text-slate-900">{unit.year}</span>
              </div>
              <div className="flex justify-between">
                <span>Odômetro:</span>
                <span className="font-mono-numbers font-semibold text-slate-900">
                  {unit.odometer.toLocaleString('pt-BR')} km
                </span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 text-xs">
              <span className="text-slate-500 block mb-0.5 font-medium">Prefeitura / Contrato Ativo:</span>
              <p className="font-semibold text-slate-800">{unit.currentMunicipality}</p>
              <p className="text-[11px] text-slate-500 truncate">{unit.currentAddress}</p>
            </div>

            {unit.onboardEquipments && unit.onboardEquipments.length > 0 && (
              <div className="pt-2 border-t border-slate-100">
                <span className="text-[11px] font-semibold text-slate-700 block mb-1">
                  Equipamentos Embarcados:
                </span>
                <div className="flex flex-wrap gap-1">
                  {unit.onboardEquipments.slice(0, 3).map((eq, i) => (
                    <span
                      key={i}
                      className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded truncate max-w-[200px]"
                    >
                      {eq}
                    </span>
                  ))}
                  {unit.onboardEquipments.length > 3 && (
                    <span className="text-[10px] text-slate-400 font-mono-numbers">
                      +{unit.onboardEquipments.length - 3} mais
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Actions for Admin / Authorized */}
            {canRegister && (
              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  onClick={() => {
                    setEditingUnit(unit);
                    setEditIdentifier(unit.identifier);
                    setEditPlate(unit.plate);
                    setEditChassis(unit.chassis);
                    setEditModel(unit.model);
                    setEditYear(unit.year);
                    setEditNumberOfChairs(unit.numberOfChairs);
                    setEditMunicipality(unit.currentMunicipality);
                    setEditAddress(unit.currentAddress);
                    setEditOdometer(unit.odometer);
                    setEditStatus(unit.status);
                    setEditEquipmentsText((unit.onboardEquipments || []).join(', '));
                  }}
                  className="px-2.5 py-1 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5 text-slate-600" />
                  Editar
                </button>

                {currentUser.role === 'Admin' && (
                  <button
                    onClick={() => setDeletingUnit(unit)}
                    className="px-2.5 py-1 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                    Excluir
                  </button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Modal: Add New Unit */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="relative w-full max-w-xl bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
              <div className="flex items-center gap-2">
                <Truck className="w-5 h-5 text-teal-700" />
                <h3 className="text-base font-semibold text-slate-900">
                  Cadastrar Nova Unidade Móvel / Carreta
                </h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveNewUnit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Identificador / Nome da Unidade *
                  </label>
                  <input
                    type="text"
                    required
                    value={identifier}
                    onChange={e => setIdentifier(e.target.value)}
                    placeholder="Ex: Carreta Odonto 05 - SUS Vale do Paraíba"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Placa Rodoviária (Mercosul) *
                  </label>
                  <input
                    type="text"
                    required
                    value={plate}
                    onChange={e => setPlate(e.target.value)}
                    placeholder="Ex: BRA-2E19"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-600 uppercase font-mono-numbers"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Número do Chassi
                  </label>
                  <input
                    type="text"
                    value={chassis}
                    onChange={e => setChassis(e.target.value)}
                    placeholder="9BF..."
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-600 uppercase font-mono-numbers"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Ano de Fabricação / Modelo
                  </label>
                  <input
                    type="number"
                    value={year}
                    onChange={e => setYear(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-600 font-mono-numbers"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Consultórios Odontológicos (Cadeiras) *
                  </label>
                  <select
                    value={numberOfChairs}
                    onChange={e => setNumberOfChairs(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-600 bg-white font-mono-numbers"
                  >
                    <option value={1}>1 Consultório Clínico</option>
                    <option value={2}>2 Consultórios Clínicos</option>
                    <option value={3}>3 Consultórios Clínicos</option>
                    <option value={4}>4 Consultórios Clínicos</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Prefeitura Municipal Contratante
                  </label>
                  <input
                    type="text"
                    value={currentMunicipality}
                    onChange={e => setCurrentMunicipality(e.target.value)}
                    placeholder="Ex: Prefeitura Municipal de Piracicaba"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Endereço / Ponto de Apoio
                  </label>
                  <input
                    type="text"
                    value={currentAddress}
                    onChange={e => setCurrentAddress(e.target.value)}
                    placeholder="Ex: Praça Central ou UBS"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Odômetro Inicial (KM)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={odometer}
                    onChange={e => setOdometer(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-600 font-mono-numbers"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Status Inicial
                  </label>
                  <select
                    value={status}
                    onChange={e => setStatus(e.target.value as MobileUnit['status'])}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-600 bg-white"
                  >
                    <option value="Disponível">Disponível</option>
                    <option value="Em Atendimento">Em Atendimento</option>
                    <option value="Em Trânsito">Em Trânsito</option>
                    <option value="Em Manutenção">Em Manutenção</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Equipamentos Embarcados (separados por vírgula)
                  </label>
                  <textarea
                    rows={2}
                    value={equipmentsText}
                    onChange={e => setEquipmentsText(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-600"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-teal-700 hover:bg-teal-800 rounded-lg transition-colors cursor-pointer"
                >
                  Cadastrar Unidade
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Edit Mobile Unit */}
      {editingUnit && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="relative w-full max-w-xl bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
              <div className="flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-teal-700" />
                <h3 className="text-base font-semibold text-slate-900">
                  Editar Unidade Móvel / Carreta
                </h3>
              </div>
              <button
                onClick={() => setEditingUnit(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!editingUnit || !editIdentifier.trim() || !editPlate.trim()) return;

                const equipmentsList = editEquipmentsText
                  .split(',')
                  .map(item => item.trim())
                  .filter(item => item.length > 0);

                const updated: MobileUnit = {
                  ...editingUnit,
                  identifier: editIdentifier.trim(),
                  plate: editPlate.trim().toUpperCase(),
                  chassis: editChassis.trim(),
                  model: editModel.trim(),
                  year: Number(editYear),
                  numberOfChairs: Number(editNumberOfChairs),
                  currentMunicipality: editMunicipality.trim(),
                  currentAddress: editAddress.trim(),
                  status: editStatus,
                  odometer: Number(editOdometer),
                  onboardEquipments: equipmentsList
                };

                onUpdateUnit(updated);
                setEditingUnit(null);
              }}
              className="p-6 space-y-4"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Identificador / Nome da Unidade *
                  </label>
                  <input
                    type="text"
                    required
                    value={editIdentifier}
                    onChange={e => setEditIdentifier(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Placa Rodoviária *
                  </label>
                  <input
                    type="text"
                    required
                    value={editPlate}
                    onChange={e => setEditPlate(e.target.value.toUpperCase())}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-600 font-mono-numbers"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Número do Chassi
                  </label>
                  <input
                    type="text"
                    value={editChassis}
                    onChange={e => setEditChassis(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-600 font-mono-numbers"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Modelo do Semirreboque
                  </label>
                  <input
                    type="text"
                    value={editModel}
                    onChange={e => setEditModel(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Ano de Fabricação
                  </label>
                  <input
                    type="number"
                    min={2000}
                    max={2030}
                    value={editYear}
                    onChange={e => setEditYear(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-600 font-mono-numbers"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Quantidade de Consultórios
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={5}
                    value={editNumberOfChairs}
                    onChange={e => setEditNumberOfChairs(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-600 font-mono-numbers"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Município / Convênio Atual
                  </label>
                  <input
                    type="text"
                    value={editMunicipality}
                    onChange={e => setEditMunicipality(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Endereço / Ponto de Parada
                  </label>
                  <input
                    type="text"
                    value={editAddress}
                    onChange={e => setEditAddress(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Odômetro Atual (km)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={editOdometer}
                    onChange={e => setEditOdometer(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-600 font-mono-numbers"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Status Operacional
                  </label>
                  <select
                    value={editStatus}
                    onChange={e => setEditStatus(e.target.value as MobileUnit['status'])}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-600 bg-white"
                  >
                    <option value="Disponível">Disponível</option>
                    <option value="Em Atendimento">Em Atendimento</option>
                    <option value="Em Trânsito">Em Trânsito</option>
                    <option value="Em Manutenção">Em Manutenção</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Equipamentos Embarcados (separados por vírgula)
                  </label>
                  <textarea
                    rows={2}
                    value={editEquipmentsText}
                    onChange={e => setEditEquipmentsText(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-600"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingUnit(null)}
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

      {/* Modal: Delete Mobile Unit Confirmation */}
      {deletingUnit && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="relative w-full max-w-md bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden p-6 space-y-4">
            <div className="flex items-center gap-3 text-rose-700">
              <div className="p-2.5 bg-rose-50 rounded-full">
                <Trash2 className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">
                Confirmar Exclusão de Unidade Móvel
              </h3>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Você tem certeza que deseja excluir o cadastro da unidade móvel{' '}
              <strong className="text-slate-900">{deletingUnit.identifier}</strong> (Placa:{' '}
              <strong className="text-slate-900 font-mono-numbers">{deletingUnit.plate}</strong>)?
              Esta ação removerá a carreta do inventário patrimonial da frota.
            </p>

            <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setDeletingUnit(null)}
                className="px-4 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  onDeleteUnit(deletingUnit.id);
                  setDeletingUnit(null);
                }}
                className="px-4 py-2 text-xs font-semibold text-white bg-rose-700 hover:bg-rose-800 rounded-lg transition-colors cursor-pointer"
              >
                Sim, Excluir Carreta
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
