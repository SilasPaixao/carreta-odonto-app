import React, { useState } from 'react';
import { VehicleOccurrence, MobileUnit, AppUser, RolePermissions } from '../types';
import { 
  AlertTriangle, 
  PlusCircle, 
  MapPin, 
  CheckCircle2, 
  Clock, 
  Filter, 
  Wrench, 
  FileText,
  DollarSign,
  Edit3,
  Trash2
} from 'lucide-react';

interface OccurrencesViewProps {
  occurrences: VehicleOccurrence[];
  units: MobileUnit[];
  currentUser: AppUser;
  permissions: RolePermissions;
  onAddOccurrence: (occ: VehicleOccurrence) => void;
  onResolveOccurrence: (id: string, notes: string, cost?: number) => void;
  onUpdateOccurrence?: (occ: VehicleOccurrence) => void;
  onDeleteOccurrence?: (id: string) => void;
}

export const OccurrencesView: React.FC<OccurrencesViewProps> = ({
  occurrences,
  units,
  currentUser,
  permissions,
  onAddOccurrence,
  onResolveOccurrence,
  onUpdateOccurrence,
  onDeleteOccurrence
}) => {
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterSeverity, setFilterSeverity] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [resolvingOccurrence, setResolvingOccurrence] = useState<VehicleOccurrence | null>(null);
  const [editingOccurrence, setEditingOccurrence] = useState<VehicleOccurrence | null>(null);
  const [deletingOccurrence, setDeletingOccurrence] = useState<VehicleOccurrence | null>(null);

  // Edit form states
  const [editTitle, setEditTitle] = useState('');
  const [editType, setEditType] = useState<VehicleOccurrence['occurrenceType']>('Pneu Estourado');
  const [editLocation, setEditLocation] = useState('');
  const [editSeverity, setEditSeverity] = useState<VehicleOccurrence['severity']>('Alta');
  const [editStatus, setEditStatus] = useState<VehicleOccurrence['status']>('Pendente');
  const [editDescription, setEditDescription] = useState('');
  const [editCost, setEditCost] = useState<number>(0);

  // Form states
  const [selectedUnitId, setSelectedUnitId] = useState<string>(units[0]?.id || '');
  const [title, setTitle] = useState('');
  const [occurrenceType, setOccurrenceType] = useState<VehicleOccurrence['occurrenceType']>('Pneu Estourado');
  const [location, setLocation] = useState('');
  const [severity, setSeverity] = useState<VehicleOccurrence['severity']>('Alta');
  const [description, setDescription] = useState('');
  const [estimatedCost, setEstimatedCost] = useState<number>(0);

  // Resolve form states
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [finalCost, setFinalCost] = useState<number>(0);

  const canReport = currentUser.role === 'Admin' || currentUser.role === 'Motorista' || permissions.reportOccurrences.includes(currentUser.role);
  const canResolve = currentUser.role === 'Admin' || permissions.resolveOccurrences.includes(currentUser.role);

  // Requirement:
  // "o motorista deve ter apenas a possibilidade de cadastrar ocorrencias e visualizar apenas esta área de "Alertas de ocorrências" com status da ocorrencia feita por ele só. A menos que o admin adicione mais áreas a ser visualizada por ele."
  // And for other professionals: only occurrences of their assigned carretas unless coordinator/admin with all-units access.
  const isDriver = currentUser.role === 'Motorista';
  const hasAllUnits = currentUser.role === 'Admin' || (currentUser.role === 'Coordenador' && currentUser.hasAccessToAllUnits !== false) || currentUser.hasAccessToAllUnits === true;
  const userUnitIds = currentUser.assignedUnitIds || [];

  const selectableUnits = (!hasAllUnits && userUnitIds.length > 0)
    ? units.filter(u => userUnitIds.includes(u.id))
    : units;

  const visibleOccurrences = occurrences.filter(occ => {
    if (isDriver) {
      // Driver only sees occurrences reported by them
      return occ.reportedBy === currentUser.name;
    }
    if (!hasAllUnits && userUnitIds.length > 0) {
      // Professional or limited coordinator sees only occurrences of their assigned carretas
      return userUnitIds.includes(occ.unitId);
    }
    return true;
  });

  const filteredOccurrences = visibleOccurrences.filter(occ => {
    if (filterStatus === 'pending' && occ.status === 'Resolvido') return false;
    if (filterStatus === 'resolved' && occ.status !== 'Resolvido') return false;
    if (filterSeverity !== 'all' && occ.severity !== filterSeverity) return false;
    return true;
  });

  const handleCreateOccurrence = (e: React.FormEvent) => {
    e.preventDefault();
    const unit = units.find(u => u.id === selectedUnitId);
    if (!unit) return;

    const newOcc: VehicleOccurrence = {
      id: `occ_${Date.now()}`,
      unitId: unit.id,
      unitIdentifier: unit.identifier,
      title: title.trim(),
      occurrenceType,
      location: location.trim(),
      severity,
      status: 'Pendente',
      description: description.trim(),
      reportedBy: currentUser.name,
      reportedRole: currentUser.role,
      reportedAt: new Date().toISOString(),
      estimatedCost: Number(estimatedCost) || undefined
    };

    onAddOccurrence(newOcc);
    setShowAddModal(false);
    setTitle('');
    setLocation('');
    setDescription('');
    setEstimatedCost(0);
  };

  const handleConfirmResolve = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resolvingOccurrence) return;

    onResolveOccurrence(resolvingOccurrence.id, resolutionNotes, Number(finalCost) || undefined);
    setResolvingOccurrence(null);
    setResolutionNotes('');
    setFinalCost(0);
  };

  const criticalPending = occurrences.filter(
    o => o.status !== 'Resolvido' && o.severity === 'Crítica'
  );

  return (
    <div className="space-y-6">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Central de Alertas e Ocorrências de Veículos
          </h1>
          <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
            <span>Monitoramento de Incidentes Mecânicos & Estruturais</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono-numbers">
              {occurrences.filter(o => o.status !== 'Resolvido').length} ocorrências pendentes
            </span>
          </div>
        </div>

        {canReport && (
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 text-xs font-semibold text-white bg-amber-700 hover:bg-amber-800 rounded-lg shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            Registrar Nova Ocorrência
          </button>
        )}
      </div>

      {/* Critical Alerts Banner (e.g. Pneu estourado na rodovia) */}
      {criticalPending.length > 0 && (
        <div className="p-4 bg-rose-50 border-l-4 border-rose-600 rounded-r-lg shadow-xs space-y-2">
          <div className="flex items-center gap-2 text-rose-900 font-bold text-sm">
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
            <span>Alerta de Ocorrência Crítica Ativa</span>
          </div>
          <div className="space-y-2">
            {criticalPending.map(crit => (
              <div key={crit.id} className="text-xs text-rose-800 bg-white/70 p-3 rounded border border-rose-200">
                <div className="flex justify-between items-start font-semibold">
                  <span>{crit.unitIdentifier}: {crit.title}</span>
                  <span className="font-mono-numbers text-[11px] text-rose-700 uppercase bg-rose-100 px-2 py-0.5 rounded">
                    {crit.occurrenceType}
                  </span>
                </div>
                <div className="mt-1 flex items-center gap-1 font-medium text-rose-900">
                  <MapPin className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                  <span>Localidade do Ocorrido: {crit.location}</span>
                </div>
                <p className="mt-1 text-slate-700 text-[11px]">{crit.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="p-3.5 bg-white border border-slate-200 rounded-lg flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-slate-700 font-medium">
          <Filter className="w-4 h-4 text-slate-500" />
          <span>Filtrar Ocorrências:</span>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            className="px-3 py-1.5 border border-slate-300 rounded-md bg-white text-slate-800 text-xs focus:ring-1 focus:ring-teal-600"
          >
            <option value="all">Todos os Status</option>
            <option value="pending">Apenas Pendentes / Em Atendimento</option>
            <option value="resolved">Apenas Resolvidas</option>
          </select>

          <select
            value={filterSeverity}
            onChange={e => setFilterSeverity(e.target.value)}
            className="px-3 py-1.5 border border-slate-300 rounded-md bg-white text-slate-800 text-xs focus:ring-1 focus:ring-teal-600"
          >
            <option value="all">Todas as Gravidades</option>
            <option value="Crítica">Crítica</option>
            <option value="Alta">Alta</option>
            <option value="Média">Média</option>
            <option value="Baixa">Baixa</option>
          </select>
        </div>
      </div>

      {/* Occurrences List */}
      <div className="space-y-4">
        {filteredOccurrences.length === 0 ? (
          <div className="p-12 text-center text-slate-500 bg-white border border-slate-200 rounded-xl text-xs">
            Nenhuma ocorrência encontrada para os filtros selecionados.
          </div>
        ) : (
          filteredOccurrences.map(occ => {
            const isResolved = occ.status === 'Resolvido';

            return (
              <div
                key={occ.id}
                className={`p-5 bg-white border rounded-xl shadow-2xs space-y-4 transition-colors ${
                  occ.severity === 'Crítica' && !isResolved
                    ? 'border-rose-300 bg-rose-50/20'
                    : 'border-slate-200'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`text-[11px] font-semibold px-2 py-0.5 rounded font-mono-numbers ${
                          occ.severity === 'Crítica'
                            ? 'bg-rose-100 text-rose-800'
                            : occ.severity === 'Alta'
                            ? 'bg-amber-100 text-amber-800'
                            : occ.severity === 'Média'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        Gravidade: {occ.severity}
                      </span>
                      <span className="text-xs font-semibold text-slate-800 bg-slate-100 px-2 py-0.5 rounded">
                        {occ.occurrenceType}
                      </span>
                      <span
                        className={`text-xs font-medium px-2 py-0.5 rounded ${
                          isResolved
                            ? 'bg-emerald-100 text-emerald-800'
                            : occ.status === 'Em Atendimento'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        ● {occ.status}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-slate-900 pt-1">{occ.title}</h3>
                    <p className="text-xs text-slate-600 font-medium">{occ.unitIdentifier}</p>
                  </div>

                  <div className="text-right text-xs text-slate-500 font-mono-numbers shrink-0">
                    <div className="flex items-center gap-1 sm:justify-end">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{new Date(occ.reportedAt).toLocaleDateString('pt-BR')} às {new Date(occ.reportedAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      Por {occ.reportedBy} ({occ.reportedRole})
                    </div>
                  </div>
                </div>

                {/* Location Callout */}
                <div className="p-3 bg-slate-50 border border-slate-200/90 rounded-lg flex items-start gap-2 text-xs">
                  <MapPin className="w-4 h-4 text-teal-700 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-slate-800 block">Localidade do Ocorrido:</strong>
                    <span className="text-slate-700 font-medium">{occ.location}</span>
                  </div>
                </div>

                {/* Description */}
                <p className="text-xs text-slate-700 leading-relaxed bg-white p-3 border border-slate-100 rounded-lg">
                  {occ.description}
                </p>

                {/* Resolution Details if resolved */}
                {isResolved && (
                  <div className="p-3.5 bg-emerald-50/80 border border-emerald-200 rounded-lg text-xs space-y-1">
                    <div className="flex items-center gap-1.5 text-emerald-900 font-semibold">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Ocorrência Solucionada</span>
                      {occ.resolvedAt && (
                        <span className="font-mono-numbers text-[11px] font-normal text-emerald-700 ml-1">
                          em {new Date(occ.resolvedAt).toLocaleDateString('pt-BR')}
                        </span>
                      )}
                    </div>
                    {occ.resolutionNotes && (
                      <p className="text-slate-700">{occ.resolutionNotes}</p>
                    )}
                    {occ.estimatedCost && (
                      <p className="text-[11px] text-slate-600 font-mono-numbers">
                        Custo do Reparo / Manutenção: <strong>R$ {occ.estimatedCost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong>
                      </p>
                    )}
                  </div>
                )}

                {/* Action Buttons: Edit, Delete, Resolve */}
                <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {(currentUser.role === 'Admin' || occ.reportedBy === currentUser.name) && (
                      <button
                        onClick={() => {
                          setEditingOccurrence(occ);
                          setEditTitle(occ.title);
                          setEditType(occ.occurrenceType);
                          setEditLocation(occ.location);
                          setEditSeverity(occ.severity);
                          setEditStatus(occ.status);
                          setEditDescription(occ.description);
                          setEditCost(occ.estimatedCost || 0);
                        }}
                        className="px-2.5 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                        title="Editar Ocorrência"
                      >
                        <Edit3 className="w-3.5 h-3.5 text-slate-600" />
                        Editar
                      </button>
                    )}

                    {(currentUser.role === 'Admin' || occ.reportedBy === currentUser.name || canResolve) && (
                      <button
                        onClick={() => setDeletingOccurrence(occ)}
                        className="px-2.5 py-1.5 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                        title="Excluir Ocorrência"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                        Excluir
                      </button>
                    )}
                  </div>

                  {!isResolved && canResolve && (
                    <button
                      onClick={() => {
                        setResolvingOccurrence(occ);
                        setResolutionNotes('');
                        setFinalCost(occ.estimatedCost || 0);
                      }}
                      className="px-3.5 py-1.5 text-xs font-semibold text-white bg-teal-700 hover:bg-teal-800 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      Concluir / Resolver Ocorrência
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal: New Occurrence */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="relative w-full max-w-lg bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-700" />
                <h3 className="text-base font-semibold text-slate-900">
                  Registrar Nova Ocorrência em Veículo
                </h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateOccurrence} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Unidade Móvel Afetada *
                </label>
                <select
                  value={selectedUnitId}
                  onChange={e => setSelectedUnitId(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-600 bg-white"
                >
                  {selectableUnits.map(u => (
                    <option key={u.id} value={u.id}>
                      {u.identifier} (Placa: {u.plate})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Título Resumido da Ocorrência *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="Ex: Pneu traseiro furado no acostamento"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Tipo de Ocorrência *
                  </label>
                  <select
                    value={occurrenceType}
                    onChange={e => setOccurrenceType(e.target.value as VehicleOccurrence['occurrenceType'])}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-600 bg-white"
                  >
                    <option value="Pneu Estourado">Pneu Estourado</option>
                    <option value="Falha no Cavalo Mecânico">Falha no Cavalo Mecânico</option>
                    <option value="Falha no Gerador de Energia">Falha no Gerador de Energia</option>
                    <option value="Vazamento no Compressor Odontológico">Vazamento Compressor Odonto</option>
                    <option value="Falha na Sucção / Sistema Hidráulico">Falha na Sucção / Hidráulico</option>
                    <option value="Problema Elétrico / Bateria">Problema Elétrico / Bateria</option>
                    <option value="Ar Condicionado Inoperante">Ar Condicionado Inoperante</option>
                    <option value="Avaria / Acidente de Trânsito">Avaria / Acidente de Trânsito</option>
                    <option value="Bloqueio de Rota / Imprevisto">Bloqueio de Rota / Imprevisto</option>
                    <option value="Outro">Outro</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Gravidade do Alerta *
                  </label>
                  <select
                    value={severity}
                    onChange={e => setSeverity(e.target.value as VehicleOccurrence['severity'])}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-600 bg-white"
                  >
                    <option value="Crítica">Crítica (Interrompe operação/deslocamento)</option>
                    <option value="Alta">Alta (Urgente reparo em 24h)</option>
                    <option value="Média">Média (Ajuste mecânico previsto)</option>
                    <option value="Baixa">Baixa (Pequena observação)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Localidade Exata do Ocorrido *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={location}
                    onChange={e => setLocation(e.target.value)}
                    placeholder="Ex: Rodovia dos Bandeirantes KM 68 - Acostamento próximo ao pedágio"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-600 pl-8"
                  />
                  <MapPin className="w-4 h-4 text-slate-400 absolute left-2.5 top-2.5" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Descrição Circunstanciada do Incidente *
                </label>
                <textarea
                  rows={3}
                  required
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Relate detalhadamente o que ocorreu, se houve auxílio mecânico, se os equipamentos odontológicos internos sofreram danos..."
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Custo Estimado Inicial (R$)
                </label>
                <input
                  type="number"
                  min={0}
                  step={0.01}
                  value={estimatedCost}
                  onChange={e => setEstimatedCost(Number(e.target.value))}
                  placeholder="0,00"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-600 font-mono-numbers"
                />
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
                  className="px-4 py-2 text-xs font-semibold text-white bg-amber-700 hover:bg-amber-800 rounded-lg transition-colors cursor-pointer"
                >
                  Registrar Ocorrência
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Resolve Occurrence */}
      {resolvingOccurrence && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="relative w-full max-w-lg bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-teal-700" />
                <h3 className="text-base font-semibold text-slate-900">
                  Concluir / Resolver Ocorrência
                </h3>
              </div>
              <button
                onClick={() => setResolvingOccurrence(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleConfirmResolve} className="p-6 space-y-4">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs">
                <span className="text-slate-500 block">Ocorrência em Finalização:</span>
                <span className="font-bold text-slate-900 text-sm">
                  {resolvingOccurrence.unitIdentifier} — {resolvingOccurrence.title}
                </span>
                <span className="text-slate-500 block mt-1">
                  Local: {resolvingOccurrence.location}
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Relatório Técnico da Resolução *
                </label>
                <textarea
                  rows={3}
                  required
                  value={resolutionNotes}
                  onChange={e => setResolutionNotes(e.target.value)}
                  placeholder="Descreva as peças substituídas, oficina que atendeu, testes de funcionamento executados..."
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Custo Final Efetivo do Conserto (R$)
                </label>
                <input
                  type="number"
                  min={0}
                  step={0.01}
                  value={finalCost}
                  onChange={e => setFinalCost(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-600 font-mono-numbers"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setResolvingOccurrence(null)}
                  className="px-4 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-teal-700 hover:bg-teal-800 rounded-lg transition-colors cursor-pointer"
                >
                  Salvar Resolução & Finalizar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Edit Occurrence */}
      {editingOccurrence && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="relative w-full max-w-lg bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
              <div className="flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-teal-700" />
                <h3 className="text-base font-semibold text-slate-900">
                  Editar Registro de Ocorrência
                </h3>
              </div>
              <button
                onClick={() => setEditingOccurrence(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!editingOccurrence) return;
                const updated: VehicleOccurrence = {
                  ...editingOccurrence,
                  title: editTitle.trim(),
                  occurrenceType: editType,
                  location: editLocation.trim(),
                  severity: editSeverity,
                  status: editStatus,
                  description: editDescription.trim(),
                  estimatedCost: Number(editCost) || 0
                };
                if (onUpdateOccurrence) onUpdateOccurrence(updated);
                setEditingOccurrence(null);
              }}
              className="p-6 space-y-4"
            >
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Título da Ocorrência *
                </label>
                <input
                  type="text"
                  required
                  value={editTitle}
                  onChange={e => setEditTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Tipo de Ocorrência *
                  </label>
                  <select
                    value={editType}
                    onChange={e => setEditType(e.target.value as VehicleOccurrence['occurrenceType'])}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-600 bg-white"
                  >
                    <option value="Pneu Estourado">Pneu Estourado</option>
                    <option value="Falha no Cavalo Mecânico">Falha no Cavalo Mecânico</option>
                    <option value="Falha no Gerador de Energia">Falha no Gerador de Energia</option>
                    <option value="Vazamento no Compressor Odontológico">Vazamento no Compressor Odontológico</option>
                    <option value="Falha na Sucção / Sistema Hidráulico">Falha na Sucção / Sistema Hidráulico</option>
                    <option value="Problema Elétrico / Bateria">Problema Elétrico / Bateria</option>
                    <option value="Ar Condicionado Inoperante">Ar Condicionado Inoperante</option>
                    <option value="Avaria / Acidente de Trânsito">Avaria / Acidente de Trânsito</option>
                    <option value="Bloqueio de Rota / Imprevisto">Bloqueio de Rota / Imprevisto</option>
                    <option value="Outro">Outro</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Severidade *
                  </label>
                  <select
                    value={editSeverity}
                    onChange={e => setEditSeverity(e.target.value as VehicleOccurrence['severity'])}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-600 bg-white"
                  >
                    <option value="Crítica">Crítica (Impede Atendimento / Deslocamento)</option>
                    <option value="Alta">Alta (Risco Iminente / Danos Mecânicos)</option>
                    <option value="Média">Média (Atenção / Reparo Necessário)</option>
                    <option value="Baixa">Baixa (Pequena Avaria / Não Impeditiva)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Status da Ocorrência *
                  </label>
                  <select
                    value={editStatus}
                    onChange={e => setEditStatus(e.target.value as VehicleOccurrence['status'])}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-600 bg-white"
                  >
                    <option value="Pendente">Pendente</option>
                    <option value="Em Atendimento">Em Atendimento</option>
                    <option value="Resolvido">Resolvido</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Custo Estimado / Real (R$)
                  </label>
                  <input
                    type="number"
                    min={0}
                    step={0.01}
                    value={editCost}
                    onChange={e => setEditCost(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-600 font-mono-numbers"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Localização Atual do Evento *
                </label>
                <input
                  type="text"
                  required
                  value={editLocation}
                  onChange={e => setEditLocation(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Descrição dos Fatos *
                </label>
                <textarea
                  rows={3}
                  required
                  value={editDescription}
                  onChange={e => setEditDescription(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-600"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingOccurrence(null)}
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

      {/* Modal: Delete Confirmation */}
      {deletingOccurrence && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="relative w-full max-w-md bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden p-6 space-y-4">
            <div className="flex items-center gap-3 text-rose-700">
              <div className="p-2.5 bg-rose-50 rounded-full">
                <Trash2 className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">
                Confirmar Exclusão de Ocorrência
              </h3>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Você está prestes a excluir permanentemente a ocorrência{' '}
              <strong className="text-slate-900">"{deletingOccurrence.title}"</strong> da unidade{' '}
              <strong className="text-slate-900">{deletingOccurrence.unitIdentifier}</strong>.
              Esta ação removerá o registro do histórico de frotas e auditoria.
            </p>

            <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setDeletingOccurrence(null)}
                className="px-4 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  if (onDeleteOccurrence) onDeleteOccurrence(deletingOccurrence.id);
                  setDeletingOccurrence(null);
                }}
                className="px-4 py-2 text-xs font-semibold text-white bg-rose-700 hover:bg-rose-800 rounded-lg transition-colors cursor-pointer"
              >
                Sim, Excluir Ocorrência
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
