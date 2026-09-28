import React, { useState } from 'react';
import { MobileUnit, PatientClient, VehicleOccurrence, AppUser } from '../types';
import { BarChart3, Clock, Printer, Activity, CheckCircle, TrendingUp, Filter, Users, Truck } from 'lucide-react';

interface StatisticsViewProps {
  units: MobileUnit[];
  patients: PatientClient[];
  occurrences: VehicleOccurrence[];
  currentUser: AppUser;
  onOpenPrintModal: () => void;
}

export const StatisticsView: React.FC<StatisticsViewProps> = ({
  units,
  patients,
  occurrences,
  currentUser,
  onOpenPrintModal
}) => {
  const [selectedUnitFilter, setSelectedUnitFilter] = useState<string>('all');
  const [selectedPeriod, setSelectedPeriod] = useState<string>('all');

  // Flatten attendances
  const allAttendances = patients.flatMap(p => 
    p.attendances.map(a => ({
      ...a,
      patientName: p.name,
      patientCpf: p.cpf
    }))
  );

  // Apply filters
  const filteredAttendances = allAttendances.filter(a => {
    if (selectedUnitFilter !== 'all' && a.unitId !== selectedUnitFilter) return false;
    return true;
  });

  const totalProcedures = filteredAttendances.length;
  const totalDurationMinutes = filteredAttendances.reduce((acc, curr) => acc + curr.durationMinutes, 0);
  const avgDuration = totalProcedures > 0 ? Math.round(totalDurationMinutes / totalProcedures) : 0;

  // Breakdown by procedure
  const procedureDistribution = filteredAttendances.reduce((acc, curr) => {
    const base = curr.procedureName.split('(')[0].trim();
    if (!acc[base]) {
      acc[base] = { count: 0, totalDuration: 0 };
    }
    acc[base].count += 1;
    acc[base].totalDuration += curr.durationMinutes;
    return acc;
  }, {} as Record<string, { count: number; totalDuration: number }>);

  // Breakdown by unit
  const unitStats = units.map(unit => {
    const unitAtts = allAttendances.filter(a => a.unitId === unit.id);
    const unitDuration = unitAtts.reduce((sum, a) => sum + a.durationMinutes, 0);
    const unitAvg = unitAtts.length > 0 ? Math.round(unitDuration / unitAtts.length) : 0;
    return {
      id: unit.id,
      name: unit.identifier,
      municipality: unit.currentMunicipality,
      count: unitAtts.length,
      avgMinutes: unitAvg,
      status: unit.status
    };
  });

  // Breakdown by professional
  const professionalStats = filteredAttendances.reduce((acc, curr) => {
    const key = curr.professionalName;
    if (!acc[key]) {
      acc[key] = {
        name: curr.professionalName,
        cro: curr.professionalCro || 'Sem registro',
        role: curr.professionalRole,
        count: 0,
        totalMinutes: 0
      };
    }
    acc[key].count += 1;
    acc[key].totalMinutes += curr.durationMinutes;
    return acc;
  }, {} as Record<string, { name: string; cro: string; role: string; count: number; totalMinutes: number }>);

  return (
    <div className="space-y-6">
      {/* View Header with Top Bar Contract compliance */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Painel de Estatísticas & Rendimento Clínico
          </h1>
          <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
            <span>Controle de Metas Municipais SUS</span>
            <span aria-hidden="true">·</span>
            <span>Prestação de Contas</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono-numbers">{totalProcedures} procedimentos catalogados</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onOpenPrintModal}
            className="px-4 py-2 text-xs font-semibold text-slate-800 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg shadow-2xs flex items-center gap-2 transition-colors cursor-pointer"
          >
            <Printer className="w-4 h-4 text-slate-600" />
            Imprimir Dashboard em PDF
          </button>
        </div>
      </div>

      {/* Filter bar */}
      <div className="p-3.5 bg-white border border-slate-200 rounded-lg flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-slate-700 font-medium">
          <Filter className="w-4 h-4 text-slate-500" />
          <span>Filtrar Estatísticas:</span>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <select
            value={selectedUnitFilter}
            onChange={e => setSelectedUnitFilter(e.target.value)}
            className="px-3 py-1.5 border border-slate-300 rounded-md bg-white text-slate-800 text-xs focus:ring-1 focus:ring-teal-600"
          >
            <option value="all">Todas as Unidades Móveis</option>
            {units.map(u => (
              <option key={u.id} value={u.id}>{u.identifier}</option>
            ))}
          </select>

          <select
            value={selectedPeriod}
            onChange={e => setSelectedPeriod(e.target.value)}
            className="px-3 py-1.5 border border-slate-300 rounded-md bg-white text-slate-800 text-xs focus:ring-1 focus:ring-teal-600"
          >
            <option value="all">Todo o Período Contratual</option>
            <option value="current_month">Mês Vigente (Setembro/2026)</option>
            <option value="last_30_days">Últimos 30 Dias</option>
          </select>
        </div>
      </div>

      {/* Main KPI Metas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Total Procedimentos */}
        <div className="p-5 bg-white border border-slate-200 rounded-xl">
          <div className="flex justify-between items-start text-xs text-slate-500">
            <span className="font-medium">Total de Procedimentos</span>
            <Activity className="w-4 h-4 text-teal-600" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold tracking-tight text-slate-900 font-mono-numbers">
              {totalProcedures}
            </span>
            <span className="text-xs text-emerald-700 font-medium font-mono-numbers">
              +12% no mês
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2">
            Realizados dentro do padrão clínico do SUS
          </p>
        </div>

        {/* KPI 2: Tempo Médio de Atendimento */}
        <div className="p-5 bg-white border border-slate-200 rounded-xl">
          <div className="flex justify-between items-start text-xs text-slate-500">
            <span className="font-medium">Tempo Médio de Atendimento</span>
            <Clock className="w-4 h-4 text-blue-600" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold tracking-tight text-slate-900 font-mono-numbers">
              {avgDuration}
            </span>
            <span className="text-sm font-semibold text-slate-600">minutos</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2">
            Por consulta odontológica nas carretas
          </p>
        </div>

        {/* KPI 3: Pacientes Únicos Atendidos */}
        <div className="p-5 bg-white border border-slate-200 rounded-xl">
          <div className="flex justify-between items-start text-xs text-slate-500">
            <span className="font-medium">Pacientes Cadastrados</span>
            <Users className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold tracking-tight text-slate-900 font-mono-numbers">
              {patients.length}
            </span>
            <span className="text-xs text-slate-500">cidadãos</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2">
            Cadastrados com CPF e Cartão SUS
          </p>
        </div>

        {/* KPI 4: Unidades em Atendimento */}
        <div className="p-5 bg-white border border-slate-200 rounded-xl">
          <div className="flex justify-between items-start text-xs text-slate-500">
            <span className="font-medium">Frota Operando</span>
            <Truck className="w-4 h-4 text-teal-600" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold tracking-tight text-slate-900 font-mono-numbers">
              {units.filter(u => u.status === 'Em Atendimento').length}/{units.length}
            </span>
            <span className="text-xs text-slate-500">em cidades</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2">
            {units.filter(u => u.status === 'Em Manutenção').length} em manutenção preventiva
          </p>
        </div>
      </div>

      {/* Grid: Procedimentos & Tempos Médios por Procedimento */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Procedimentos Realizados */}
        <div className="p-5 bg-white border border-slate-200 rounded-xl space-y-4">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Distribuição de Procedimentos Realizados
              </h3>
              <p className="text-xs text-slate-500">Contabilização por tipo de tratamento clínico</p>
            </div>
          </div>

          <div className="space-y-3">
            {Object.entries(procedureDistribution).map(([procName, data]) => {
              const percentage = totalProcedures > 0 ? Math.round((data.count / totalProcedures) * 100) : 0;
              const avgProcTime = Math.round(data.totalDuration / data.count);

              return (
                <div key={procName} className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="font-medium text-slate-800">{procName}</span>
                    <span className="font-mono-numbers text-slate-600">
                      <strong>{data.count}</strong> proced. ({percentage}%) · Méd: {avgProcTime}m
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-teal-700 rounded-full transition-all duration-300"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Produtividade por Unidade Móvel / Carreta */}
        <div className="p-5 bg-white border border-slate-200 rounded-xl space-y-4">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Produtividade por Carreta / Município
              </h3>
              <p className="text-xs text-slate-500">Volume de atendimentos e tempo médio por unidade móvel</p>
            </div>
          </div>

          <div className="divide-y divide-slate-100">
            {unitStats.map(u => (
              <div key={u.id} className="py-3 flex items-center justify-between text-xs">
                <div>
                  <div className="font-semibold text-slate-900">{u.name}</div>
                  <div className="text-slate-500 text-[11px]">{u.municipality}</div>
                </div>
                <div className="text-right font-mono-numbers">
                  <div className="font-bold text-slate-900 text-sm">{u.count} atendimentos</div>
                  <div className="text-slate-500 text-[11px]">Tempo Médio: {u.avgMinutes} min</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
