import React from 'react';
import { MobileUnit, PatientClient, VehicleOccurrence } from '../types';
import { Printer, X, Download, ShieldCheck, Truck, Users, BarChart3 } from 'lucide-react';

interface PrintReportModalProps {
  type: 'vehicles' | 'patients' | 'statistics';
  isOpen: boolean;
  onClose: () => void;
  units: MobileUnit[];
  patients: PatientClient[];
  occurrences: VehicleOccurrence[];
}

export const PrintReportModal: React.FC<PrintReportModalProps> = ({
  type,
  isOpen,
  onClose,
  units,
  patients,
  occurrences
}) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  // Aggregated statistics
  const allAttendances = patients.flatMap(p => p.attendances);
  const totalProcedures = allAttendances.length;
  const avgDuration = totalProcedures > 0
    ? Math.round(allAttendances.reduce((acc, curr) => acc + curr.durationMinutes, 0) / totalProcedures)
    : 0;

  const activeOccurrences = occurrences.filter(o => o.status !== 'Resolvido');

  const currentDateFormatted = new Date().toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative w-full max-w-4xl bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Top Control Bar (Hidden when printing) */}
        <div className="no-print flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-2">
            <Printer className="w-5 h-5 text-teal-700" />
            <h2 className="text-base font-semibold text-slate-900">
              {type === 'vehicles' && 'Relatório Oficial: Status e Localidade da Frota'}
              {type === 'patients' && 'Relatório Clínico: Pacientes Atendidos & Procedimentos'}
              {type === 'statistics' && 'Relatório Estatístico: Produtividade & Tempo Médio'}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 text-xs font-semibold text-white bg-teal-700 hover:bg-teal-800 rounded-lg shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Download className="w-4 h-4" />
              Imprimir / Salvar em PDF
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Body */}
        <div className="p-8 overflow-y-auto print-container space-y-6 text-slate-900 bg-white">
          {/* Official Document Header */}
          <div className="border-b-2 border-slate-800 pb-4">
            <div className="flex justify-between items-start">
              <div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-teal-800 text-white flex items-center justify-center font-bold text-sm">
                    OM
                  </div>
                  <div>
                    <h1 className="text-xl font-bold tracking-tight text-slate-900 uppercase">
                      OdontoMóvel
                    </h1>
                    <p className="text-xs text-slate-600 font-medium">
                      Gestão Integrada de Carretas Odontológicas
                    </p>
                  </div>
                </div>
              </div>
              <div className="text-right text-xs text-slate-500 font-mono-numbers">
                <p className="font-semibold text-slate-700">Emissão: {currentDateFormatted}</p>
                <p>Contrato de Locação & Prestação de Contas</p>
                <p>Autenticação Digital: OM-{Math.random().toString(36).substring(2, 8).toUpperCase()}</p>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-200 flex justify-between text-xs text-slate-700">
              <span><strong>Documento:</strong> {type === 'vehicles' ? 'Diagnóstico de Frota e Telemetria' : type === 'patients' ? 'Relação Nominal de Atendimentos Clínicos' : 'Demonstrativo de Metas e Rendimento Clínico'}</span>
              <span><strong>Ambiente:</strong> Carretas Móveis de Tratamento Odontológico</span>
            </div>
          </div>

          {/* REPORT TYPE 1: VEHICLES */}
          {type === 'vehicles' && (
            <div className="space-y-6">
              <div className="grid grid-cols-3 gap-4 p-4 bg-slate-50 border border-slate-200 rounded-lg text-xs">
                <div>
                  <span className="text-slate-500 block">Total de Carretas Cadastradas</span>
                  <span className="text-lg font-bold text-slate-900 font-mono-numbers">{units.length} unidades</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Em Atendimento Ativo</span>
                  <span className="text-lg font-bold text-emerald-700 font-mono-numbers">
                    {units.filter(u => u.status === 'Em Atendimento').length} unidades
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block">Ocorrências Ativas / Alertas</span>
                  <span className="text-lg font-bold text-amber-700 font-mono-numbers">
                    {activeOccurrences.length} pendências
                  </span>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3">
                  Status e Localização Atual das Unidades Móveis
                </h3>
                <table className="w-full text-left text-xs border border-slate-200">
                  <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="p-2.5">Identificação / Placa</th>
                      <th className="p-2.5">Município / Ponto de Apoio</th>
                      <th className="p-2.5">Status Operacional</th>
                      <th className="p-2.5">Odômetro</th>
                      <th className="p-2.5">Pressão Ar / Gerador</th>
                      <th className="p-2.5">Cadeiras</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {units.map((unit) => (
                      <tr key={unit.id} className="hover:bg-slate-50">
                        <td className="p-2.5">
                          <div className="font-semibold text-slate-900">{unit.identifier}</div>
                          <div className="text-[11px] text-slate-500 font-mono-numbers">Placa: {unit.plate} · Ano {unit.year}</div>
                        </td>
                        <td className="p-2.5">
                          <div className="font-medium text-slate-800">{unit.currentMunicipality}</div>
                          <div className="text-[11px] text-slate-500 truncate max-w-xs">{unit.currentAddress}</div>
                        </td>
                        <td className="p-2.5 font-medium">
                          {unit.status === 'Em Atendimento' && <span className="text-emerald-700">● Operando</span>}
                          {unit.status === 'Em Trânsito' && <span className="text-blue-700">● Em Deslocamento</span>}
                          {unit.status === 'Em Manutenção' && <span className="text-amber-700">● Manutenção</span>}
                          {unit.status === 'Disponível' && <span className="text-slate-600">● Disponível</span>}
                        </td>
                        <td className="p-2.5 font-mono-numbers">
                          {unit.odometer.toLocaleString('pt-BR')} km
                        </td>
                        <td className="p-2.5 font-mono-numbers text-[11px]">
                          <div>Compressor: {unit.compressorPressurePsi || 90} PSI</div>
                          <div>Gerador: {unit.generatorHours || 120}h</div>
                        </td>
                        <td className="p-2.5 font-mono-numbers text-center">
                          {unit.numberOfChairs} consultórios
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {activeOccurrences.length > 0 && (
                <div className="break-inside-avoid">
                  <h3 className="text-sm font-bold text-amber-900 uppercase tracking-wider mb-2">
                    Ocorrências em Aberto / Alertas Mecânicos
                  </h3>
                  <div className="border border-amber-200 rounded-lg divide-y divide-amber-100 bg-amber-50/50">
                    {activeOccurrences.map(occ => (
                      <div key={occ.id} className="p-3 text-xs">
                        <div className="flex justify-between font-semibold text-slate-900 mb-1">
                          <span>{occ.unitIdentifier}: {occ.title} ({occ.occurrenceType})</span>
                          <span className="font-mono-numbers text-amber-800 uppercase">Gravidade: {occ.severity}</span>
                        </div>
                        <p className="text-slate-700 mb-1"><strong>Local do Ocorrido:</strong> {occ.location}</p>
                        <p className="text-slate-600 text-[11px]">{occ.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* REPORT TYPE 2: PATIENTS */}
          {type === 'patients' && (
            <div className="space-y-6">
              <div className="grid grid-cols-3 gap-4 p-4 bg-slate-50 border border-slate-200 rounded-lg text-xs">
                <div>
                  <span className="text-slate-500 block">Pacientes Registrados</span>
                  <span className="text-lg font-bold text-slate-900 font-mono-numbers">{patients.length} pessoas</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Total de Atendimentos Realizados</span>
                  <span className="text-lg font-bold text-teal-700 font-mono-numbers">{totalProcedures} consultas</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Tempo Médio por Procedimento</span>
                  <span className="text-lg font-bold text-slate-900 font-mono-numbers">{avgDuration} minutos</span>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3">
                  Registro de Procedimentos Odontológicos por Paciente
                </h3>
                <table className="w-full text-left text-xs border border-slate-200">
                  <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="p-2.5">Data / Hora</th>
                      <th className="p-2.5">Paciente & CPF</th>
                      <th className="p-2.5">Procedimento Clínico</th>
                      <th className="p-2.5">Duração</th>
                      <th className="p-2.5">Cirurgião-Dentista / Responsável</th>
                      <th className="p-2.5">CRO</th>
                      <th className="p-2.5">Unidade Móvel</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {patients.flatMap(pat => 
                      pat.attendances.map(att => (
                        <tr key={att.id} className="hover:bg-slate-50">
                          <td className="p-2.5 font-mono-numbers whitespace-nowrap text-slate-600">
                            {new Date(att.date).toLocaleDateString('pt-BR')}
                          </td>
                          <td className="p-2.5">
                            <div className="font-semibold text-slate-900">{pat.name}</div>
                            <div className="text-[11px] text-slate-500 font-mono-numbers">CPF: {pat.cpf}</div>
                            {pat.kinshipContactName && (
                              <div className="text-[10px] text-slate-600 mt-0.5">
                                Parentesco: {pat.kinshipContactName} ({pat.kinshipRelation || 'Parente'}{pat.kinshipPhone ? ` · ${pat.kinshipPhone}` : ''})
                              </div>
                            )}
                          </td>
                          <td className="p-2.5">
                            <div className="font-medium text-slate-900">{att.procedureName}</div>
                            <div className="text-[10px] text-slate-500 truncate max-w-xs">{att.clinicalNotes}</div>
                          </td>
                          <td className="p-2.5 font-mono-numbers font-semibold text-slate-800">
                            {att.durationMinutes} min
                          </td>
                          <td className="p-2.5 font-medium text-slate-800">
                            {att.professionalName}
                          </td>
                          <td className="p-2.5 font-mono-numbers text-slate-600">
                            {att.professionalCro || 'N/A'}
                          </td>
                          <td className="p-2.5 text-[11px] text-slate-600">
                            {att.unitName}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* REPORT TYPE 3: STATISTICS */}
          {type === 'statistics' && (
            <div className="space-y-6">
              <div className="grid grid-cols-4 gap-4 p-4 bg-slate-50 border border-slate-200 rounded-lg text-xs">
                <div>
                  <span className="text-slate-500 block">Total de Procedimentos</span>
                  <span className="text-xl font-bold text-teal-800 font-mono-numbers">{totalProcedures}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Tempo Médio por Consulta</span>
                  <span className="text-xl font-bold text-slate-900 font-mono-numbers">{avgDuration} min</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Cidades Atendidas</span>
                  <span className="text-xl font-bold text-slate-900 font-mono-numbers">
                    {new Set(units.map(u => u.currentMunicipality)).size}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block">Unidades Ativas</span>
                  <span className="text-xl font-bold text-slate-900 font-mono-numbers">{units.length}</span>
                </div>
              </div>

              {/* Procedures by category summary */}
              <div>
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3">
                  Demonstrativo de Procedimentos Realizados no Período
                </h3>
                <table className="w-full text-left text-xs border border-slate-200">
                  <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="p-2.5">Tipo de Procedimento Odontológico</th>
                      <th className="p-2.5 text-right">Qtd. Realizada</th>
                      <th className="p-2.5 text-right">% do Total</th>
                      <th className="p-2.5 text-right">Tempo Médio Estimado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 font-mono-numbers">
                    {Object.entries(
                      allAttendances.reduce((acc, curr) => {
                        const base = curr.procedureName.split('(')[0].trim();
                        acc[base] = (acc[base] || 0) + 1;
                        return acc;
                      }, {} as Record<string, number>)
                    ).map(([procName, count]) => (
                      <tr key={procName}>
                        <td className="p-2.5 font-sans font-medium text-slate-800">{procName}</td>
                        <td className="p-2.5 text-right font-bold text-slate-900">{count}</td>
                        <td className="p-2.5 text-right text-slate-600">
                          {totalProcedures > 0 ? Math.round((count / totalProcedures) * 100) : 0}%
                        </td>
                        <td className="p-2.5 text-right text-slate-700">
                          {Math.round(
                            allAttendances
                              .filter(a => a.procedureName.startsWith(procName))
                              .reduce((sum, a) => sum + a.durationMinutes, 0) / count
                          )} min
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Productivity by unit */}
              <div className="break-inside-avoid">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3">
                  Rendimento Operacional por Unidade Móvel / Carreta
                </h3>
                <table className="w-full text-left text-xs border border-slate-200">
                  <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="p-2.5">Unidade Móvel</th>
                      <th className="p-2.5">Município Alocado</th>
                      <th className="p-2.5 text-right">Atendimentos</th>
                      <th className="p-2.5 text-right">Tempo Médio</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {units.map(unit => {
                      const unitAtts = allAttendances.filter(a => a.unitId === unit.id);
                      const unitAvg = unitAtts.length > 0
                        ? Math.round(unitAtts.reduce((sum, a) => sum + a.durationMinutes, 0) / unitAtts.length)
                        : 0;
                      return (
                        <tr key={unit.id}>
                          <td className="p-2.5 font-medium text-slate-900">{unit.identifier}</td>
                          <td className="p-2.5 text-slate-600">{unit.currentMunicipality}</td>
                          <td className="p-2.5 text-right font-mono-numbers font-bold text-slate-900">{unitAtts.length}</td>
                          <td className="p-2.5 text-right font-mono-numbers text-slate-700">{unitAvg} min</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Official Signatures Section for Prefeitura audit */}
          <div className="pt-10 border-t border-slate-300 grid grid-cols-2 gap-12 text-xs text-center break-inside-avoid">
            <div>
              <div className="border-b border-slate-400 w-3/4 mx-auto mb-2 h-10"></div>
              <p className="font-semibold text-slate-800">Coordenador Geral / Responsável Técnico</p>
              <p className="text-[11px] text-slate-500">CRO / Responsabilidade Sanitária</p>
            </div>
            <div>
              <div className="border-b border-slate-400 w-3/4 mx-auto mb-2 h-10"></div>
              <p className="font-semibold text-slate-800">Fiscal do Contrato - Secretaria Municipal de Saúde</p>
              <p className="text-[11px] text-slate-500">Prefeitura Municipal Contratante</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
