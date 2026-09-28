import React, { useState } from 'react';
import { MobileUnit, VehicleOccurrence, LocationUpdateLog, AppUser, RolePermissions } from '../types';
import { 
  Truck, 
  MapPin, 
  Gauge, 
  Printer, 
  AlertTriangle, 
  History, 
  CheckCircle2, 
  Clock, 
  Edit3, 
  Activity, 
  Zap, 
  Wind,
  Plus
} from 'lucide-react';

interface FleetHealthLocationViewProps {
  units: MobileUnit[];
  occurrences: VehicleOccurrence[];
  locationLogs: LocationUpdateLog[];
  currentUser: AppUser;
  permissions: RolePermissions;
  onUpdateUnitLocation: (log: LocationUpdateLog) => void;
  onOpenPrintModal: () => void;
  onNavigateToOccurrences: () => void;
}

export const FleetHealthLocationView: React.FC<FleetHealthLocationViewProps> = ({
  units,
  occurrences,
  locationLogs,
  currentUser,
  permissions,
  onUpdateUnitLocation,
  onOpenPrintModal,
  onNavigateToOccurrences
}) => {
  const [selectedUnitForUpdate, setSelectedUnitForUpdate] = useState<MobileUnit | null>(null);
  const [showHistoryModal, setShowHistoryModal] = useState<boolean>(false);
  const [historyUnitId, setHistoryUnitId] = useState<string | null>(null);

  // Form states for location update
  const [city, setCity] = useState('');
  const [address, setAddress] = useState('');
  const [odometer, setOdometer] = useState<number>(0);
  const [status, setStatus] = useState<MobileUnit['status']>('Em Atendimento');
  const [notes, setNotes] = useState('');

  // Permission check:
  // "o motorista, coordenador ou outro (permitido pelo admin na área de permissão) podem adicionar/mudar a localidade do veículo"
  const canUpdateLocation = currentUser.role === 'Admin' || permissions.updateVehicleLocation.includes(currentUser.role);

  // Requirements:
  // "os demais profissionais podem ver todas áreas, porém apenas informações relacionadas a sua determinada carreta"
  // "coordenador vem com acesso à tudo de todas carretas por default, porém pode ser limitado pelo admin"
  const userCanSeeAllUnits =
    currentUser.role === 'Admin' ||
    (currentUser.role === 'Coordenador' && currentUser.hasAccessToAllUnits !== false) ||
    currentUser.hasAccessToAllUnits === true;

  const assignedUnitIds = currentUser.assignedUnitIds || [];

  const visibleUnits = units.filter(u => {
    if (userCanSeeAllUnits) return true;
    return assignedUnitIds.includes(u.id);
  });

  const openUpdateModal = (unit: MobileUnit) => {
    setSelectedUnitForUpdate(unit);
    setCity(unit.currentMunicipality);
    setAddress(unit.currentAddress);
    setOdometer(unit.odometer);
    setStatus(unit.status);
    setNotes('');
  };

  const handleSaveLocation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUnitForUpdate) return;

    const newLog: LocationUpdateLog = {
      id: `loc_log_${Date.now()}`,
      unitId: selectedUnitForUpdate.id,
      unitIdentifier: selectedUnitForUpdate.identifier,
      city: city.trim(),
      address: address.trim(),
      odometer: Number(odometer),
      status,
      notes: notes.trim() || undefined,
      updatedBy: currentUser.name,
      updatedRole: currentUser.role,
      updatedAt: new Date().toISOString()
    };

    onUpdateUnitLocation(newLog);
    setSelectedUnitForUpdate(null);
  };

  const filteredLogs = historyUnitId
    ? locationLogs.filter(l => l.unitId === historyUnitId)
    : locationLogs;

  return (
    <div className="space-y-6">
      {/* View Header with Top Bar Contract compliance */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Status e Localidade das Unidades Móveis
          </h1>
          <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
            <span>Rastreamento em Tempo Real</span>
            <span aria-hidden="true">·</span>
            <span>Monitoramento Clínico & Operacional</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono-numbers">{visibleUnits.length} carretas em visualização</span>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setShowHistoryModal(true)}
            className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg shadow-2xs flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <History className="w-4 h-4 text-slate-500" />
            Histórico de Deslocamento
          </button>
          <button
            onClick={onOpenPrintModal}
            className="px-4 py-2 text-xs font-semibold text-white bg-teal-700 hover:bg-teal-800 rounded-lg shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            Imprimir Resumo das Situações (PDF)
          </button>
        </div>
      </div>

      {/* Permission Info Banner */}
      {!canUpdateLocation && (
        <div className="p-3 bg-slate-100 border border-slate-200 rounded-lg text-xs text-slate-600">
          Modo de visualização. Permissões para atualização de localidade e odômetro são configuradas pelo Administrador no menu de Permissões.
        </div>
      )}

      {/* Mobile Units Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {visibleUnits.map((unit) => {
          const unitOccurrences = occurrences.filter(
            o => o.unitId === unit.id && o.status !== 'Resolvido'
          );
          const hasCriticalAlert = unitOccurrences.some(o => o.severity === 'Crítica');

          return (
            <div
              key={unit.id}
              className={`p-6 bg-white border rounded-xl shadow-xs space-y-5 transition-shadow hover:shadow-sm ${
                hasCriticalAlert ? 'border-rose-300 ring-1 ring-rose-200' : 'border-slate-200'
              }`}
            >
              {/* Unit Title and Status */}
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Truck className="w-5 h-5 text-teal-700 shrink-0" />
                    <h3 className="text-base font-bold text-slate-900">{unit.identifier}</h3>
                  </div>
                  <p className="text-xs text-slate-500 font-mono-numbers">
                    Placa: <strong className="text-slate-700">{unit.plate}</strong> · {unit.model}
                  </p>
                </div>

                <div className="flex items-center gap-1.5">
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                      unit.status === 'Em Atendimento'
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        : unit.status === 'Em Trânsito'
                        ? 'bg-blue-50 text-blue-800 border border-blue-200'
                        : unit.status === 'Em Manutenção'
                        ? 'bg-amber-50 text-amber-800 border border-amber-200'
                        : 'bg-slate-100 text-slate-700 border border-slate-200'
                    }`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-current" />
                    {unit.status}
                  </span>
                </div>
              </div>

              {/* Current Location Highlight */}
              <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-lg space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-800">
                  <MapPin className="w-4 h-4 text-teal-700 shrink-0" />
                  <span>Localização Atual no Município:</span>
                </div>
                <div className="text-xs text-slate-900 font-medium pl-5.5">
                  {unit.currentMunicipality}
                </div>
                <div className="text-[11px] text-slate-500 pl-5.5">
                  {unit.currentAddress}
                </div>
              </div>

              {/* Vehicle Telemetry & Health Gauges */}
              <div className="grid grid-cols-3 gap-3 text-xs">
                <div className="p-3 bg-white border border-slate-200 rounded-lg space-y-1">
                  <div className="flex items-center gap-1 text-slate-500 text-[11px]">
                    <Gauge className="w-3.5 h-3.5 text-slate-400" />
                    <span>Odômetro</span>
                  </div>
                  <div className="text-sm font-bold text-slate-900 font-mono-numbers">
                    {unit.odometer.toLocaleString('pt-BR')} km
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono-numbers">
                    Rev: {unit.nextMaintenanceKm.toLocaleString('pt-BR')} km
                  </div>
                </div>

                <div className="p-3 bg-white border border-slate-200 rounded-lg space-y-1">
                  <div className="flex items-center gap-1 text-slate-500 text-[11px]">
                    <Wind className="w-3.5 h-3.5 text-blue-500" />
                    <span>Compressor Ar</span>
                  </div>
                  <div className={`text-sm font-bold font-mono-numbers ${
                    (unit.compressorPressurePsi || 90) < 70 ? 'text-amber-600' : 'text-slate-900'
                  }`}>
                    {unit.compressorPressurePsi || 90} PSI
                  </div>
                  <div className="text-[10px] text-slate-400">
                    {(unit.compressorPressurePsi || 90) < 70 ? 'Pressão Baixa' : 'Nominal'}
                  </div>
                </div>

                <div className="p-3 bg-white border border-slate-200 rounded-lg space-y-1">
                  <div className="flex items-center gap-1 text-slate-500 text-[11px]">
                    <Zap className="w-3.5 h-3.5 text-amber-500" />
                    <span>Gerador Diesel</span>
                  </div>
                  <div className="text-sm font-bold text-slate-900 font-mono-numbers">
                    {unit.generatorHours || 120}h
                  </div>
                  <div className="text-[10px] text-slate-400">
                    {unit.numberOfChairs} consultórios
                  </div>
                </div>
              </div>

              {/* Incidents Warning Badge if any */}
              {unitOccurrences.length > 0 && (
                <div
                  onClick={onNavigateToOccurrences}
                  className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs flex items-center justify-between cursor-pointer hover:bg-amber-100/70 transition-colors"
                >
                  <div className="flex items-center gap-2 text-amber-900 font-semibold">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>{unitOccurrences.length} ocorrência(s) registrada(s)</span>
                  </div>
                  <span className="text-[11px] font-semibold text-amber-800 underline">
                    Ver detalhes →
                  </span>
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={() => {
                    setHistoryUnitId(unit.id);
                    setShowHistoryModal(true);
                  }}
                  className="text-xs text-slate-600 hover:text-slate-900 font-medium flex items-center gap-1 cursor-pointer"
                >
                  <History className="w-3.5 h-3.5" />
                  Ver histórico deste veículo
                </button>

                {canUpdateLocation && (
                  <button
                    onClick={() => openUpdateModal(unit)}
                    className="px-3.5 py-1.5 text-xs font-semibold text-teal-800 bg-teal-50 hover:bg-teal-100 border border-teal-200 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    Atualizar Localidade / Odômetro
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Update Location Modal */}
      {selectedUnitForUpdate && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="relative w-full max-w-lg bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-teal-700" />
                <h3 className="text-base font-semibold text-slate-900">
                  Atualizar Localização & Odômetro
                </h3>
              </div>
              <button
                onClick={() => setSelectedUnitForUpdate(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveLocation} className="p-6 space-y-4">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs">
                <span className="text-slate-500 block">Veículo em Atualização:</span>
                <span className="font-bold text-slate-900 text-sm">
                  {selectedUnitForUpdate.identifier} ({selectedUnitForUpdate.plate})
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Município / Cidade Atual *
                </label>
                <input
                  type="text"
                  required
                  value={city}
                  onChange={e => setCity(e.target.value)}
                  placeholder="Ex: Prefeitura Municipal de Sorocaba"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Endereço / Ponto de Apoio Municipal *
                </label>
                <input
                  type="text"
                  required
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                  placeholder="Ex: UBS Central - Praça São Bento, 450"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Odômetro Atual (KM) *
                  </label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={odometer}
                    onChange={e => setOdometer(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-600 font-mono-numbers"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Status Operacional *
                  </label>
                  <select
                    value={status}
                    onChange={e => setStatus(e.target.value as MobileUnit['status'])}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-600 bg-white"
                  >
                    <option value="Em Atendimento">Em Atendimento</option>
                    <option value="Em Trânsito">Em Trânsito</option>
                    <option value="Em Manutenção">Em Manutenção</option>
                    <option value="Disponível">Disponível</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Observações Operacionais do Deslocamento
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="Ex: Chegada sem intercorrências; conectado à rede trifásica da prefeitura."
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-600"
                />
              </div>

              <div className="text-[11px] text-slate-500 font-mono-numbers">
                Registro efetuado por: <strong>{currentUser.name}</strong> ({currentUser.role})
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedUnitForUpdate(null)}
                  className="px-4 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-teal-700 hover:bg-teal-800 rounded-lg transition-colors cursor-pointer"
                >
                  Salvar Nova Localização
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* History Modal */}
      {showHistoryModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="relative w-full max-w-2xl bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
              <div className="flex items-center gap-2">
                <History className="w-5 h-5 text-teal-700" />
                <h3 className="text-base font-semibold text-slate-900">
                  Histórico de Deslocamento & Atualizações de Frota
                </h3>
              </div>
              <button
                onClick={() => {
                  setShowHistoryModal(false);
                  setHistoryUnitId(null);
                }}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4">
              {filteredLogs.length === 0 ? (
                <p className="text-xs text-slate-500 text-center py-6">
                  Nenhum registro de deslocamento gravado para este filtro.
                </p>
              ) : (
                <div className="space-y-3">
                  {filteredLogs.map(log => (
                    <div key={log.id} className="p-3.5 border border-slate-200 rounded-lg text-xs space-y-1 bg-white">
                      <div className="flex justify-between items-start font-semibold text-slate-900">
                        <span>{log.unitIdentifier}</span>
                        <span className="font-mono-numbers text-[11px] text-slate-500">
                          {new Date(log.updatedAt).toLocaleDateString('pt-BR')} às {new Date(log.updatedAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <div className="text-slate-700 font-medium">
                        {log.city} · <span className="font-normal text-slate-500">{log.address}</span>
                      </div>
                      <div className="flex items-center gap-4 text-[11px] text-slate-500 font-mono-numbers">
                        <span>Odômetro: {log.odometer.toLocaleString('pt-BR')} km</span>
                        <span>Status: {log.status}</span>
                        <span>Atualizado por: {log.updatedBy} ({log.updatedRole})</span>
                      </div>
                      {log.notes && (
                        <p className="text-[11px] text-slate-600 italic bg-slate-50 p-2 rounded mt-1">
                          "{log.notes}"
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end">
              <button
                onClick={() => {
                  setShowHistoryModal(false);
                  setHistoryUnitId(null);
                }}
                className="px-4 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
