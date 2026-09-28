import React, { useState } from 'react';
import { InventoryItem, MobileUnit, AppUser, RolePermissions, SupplyCategory } from '../types';
import { Package, PlusCircle, AlertTriangle, ArrowDownRight, ArrowUpRight, Filter, Search, CheckCircle2, Edit3, Trash2 } from 'lucide-react';

interface InventoryViewProps {
  inventory: InventoryItem[];
  units: MobileUnit[];
  currentUser: AppUser;
  permissions: RolePermissions;
  onUpdateInventory: (items: InventoryItem[]) => void;
}

export const InventoryView: React.FC<InventoryViewProps> = ({
  inventory,
  units,
  currentUser,
  permissions,
  onUpdateInventory
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [movementItem, setMovementItem] = useState<InventoryItem | null>(null);
  const [movementType, setMovementType] = useState<'Entrada' | 'Saída'>('Entrada');
  const [movementQuantity, setMovementQuantity] = useState<number>(1);
  const [movementReason, setMovementReason] = useState<string>('');

  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [deletingItem, setDeletingItem] = useState<InventoryItem | null>(null);

  // New item states
  const [name, setName] = useState('');
  const [category, setCategory] = useState<SupplyCategory>('Anestésicos & Medicamentos');
  const [currentQuantity, setCurrentQuantity] = useState<number>(10);
  const [minQuantity, setMinQuantity] = useState<number>(5);
  const [unit, setUnit] = useState<InventoryItem['unit']>('caixa');
  const [batchNumber, setBatchNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('2028-12-31');
  const [allocatedUnitId, setAllocatedUnitId] = useState('central');

  // Edit item states
  const [editItemName, setEditItemName] = useState('');
  const [editItemCategory, setEditItemCategory] = useState<SupplyCategory>('Anestésicos & Medicamentos');
  const [editItemCurrentQty, setEditItemCurrentQty] = useState<number>(0);
  const [editItemMinQty, setEditItemMinQty] = useState<number>(0);
  const [editItemUnit, setEditItemUnit] = useState<InventoryItem['unit']>('caixa');
  const [editItemBatch, setEditItemBatch] = useState('');
  const [editItemExpiry, setEditItemExpiry] = useState('');
  const [editItemAllocatedUnitId, setEditItemAllocatedUnitId] = useState('central');

  const canEdit = currentUser.role === 'Admin' || permissions.editInventory.includes(currentUser.role);

  // Requirements:
  // "coordenador tem acesso default ao estoque de todas carretas, porém isso pode ser limitado pelo admin em permissões"
  // "Almoxarife pode visualizar apenas a área Estoque odontológico (por default de todas as carretas, podendo ser limitado a apenas uma carreta específica)"
  // "os demais profissionais podem ver todas áreas, porém apenas informações relacionadas a sua determinada carreta"
  const hasAccessToAllUnits = currentUser.role === 'Admin' || currentUser.hasAccessToAllUnits;
  const userUnitIds = currentUser.assignedUnitIds || [];

  const visibleInventory = inventory.filter(item => {
    if (hasAccessToAllUnits) return true;
    // Central stock is visible or items allocated to user's assigned units
    return item.allocatedUnitId === 'central' || userUnitIds.includes(item.allocatedUnitId);
  });

  const filteredItems = visibleInventory.filter(item => {
    if (searchTerm && !item.name.toLowerCase().includes(searchTerm.toLowerCase()) && !item.batchNumber.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    if (categoryFilter !== 'all' && item.category !== categoryFilter) return false;
    if (statusFilter !== 'all' && item.status !== statusFilter) return false;
    return true;
  });

  const lowStockCount = visibleInventory.filter(i => i.status !== 'Adequado').length;

  const handleApplyMovement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!movementItem || movementQuantity <= 0) return;

    let newQty = movementItem.currentQuantity;
    if (movementType === 'Entrada') {
      newQty += movementQuantity;
    } else {
      newQty = Math.max(0, newQty - movementQuantity);
    }

    let newStatus: InventoryItem['status'] = 'Adequado';
    if (newQty <= movementItem.minQuantity / 2) {
      newStatus = 'Crítico';
    } else if (newQty <= movementItem.minQuantity) {
      newStatus = 'Baixo';
    }

    const updated = inventory.map(item => {
      if (item.id === movementItem.id) {
        return {
          ...item,
          currentQuantity: newQty,
          status: newStatus,
          lastMovementDate: new Date().toISOString().split('T')[0]
        };
      }
      return item;
    });

    onUpdateInventory(updated);
    setMovementItem(null);
    setMovementQuantity(1);
    setMovementReason('');
  };

  const handleAddNewItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const unitObj = units.find(u => u.id === allocatedUnitId);
    const allocatedUnitName = allocatedUnitId === 'central' ? 'Almoxarifado Central' : (unitObj ? unitObj.identifier : 'Unidade Móvel');

    let initialStatus: InventoryItem['status'] = 'Adequado';
    if (currentQuantity <= minQuantity / 2) {
      initialStatus = 'Crítico';
    } else if (currentQuantity <= minQuantity) {
      initialStatus = 'Baixo';
    }

    const newItem: InventoryItem = {
      id: `inv_${Date.now()}`,
      name: name.trim(),
      category,
      currentQuantity: Number(currentQuantity),
      minQuantity: Number(minQuantity),
      unit,
      batchNumber: batchNumber.trim() || `LOTE-${Math.floor(1000 + Math.random() * 9000)}`,
      expiryDate,
      allocatedUnitId,
      allocatedUnitName,
      status: initialStatus,
      lastMovementDate: new Date().toISOString().split('T')[0]
    };

    onUpdateInventory([newItem, ...inventory]);
    setShowAddModal(false);
    setName('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Estoque Odontológico & Almoxarifado Central
          </h1>
          <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
            <span>Insumos Clínicos, Anestésicos & Peças</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono-numbers">{inventory.length} itens cadastrados</span>
            {lowStockCount > 0 && (
              <>
                <span aria-hidden="true">·</span>
                <span className="text-amber-700 font-semibold font-mono-numbers">
                  {lowStockCount} itens com estoque baixo/crítico
                </span>
              </>
            )}
          </div>
        </div>

        {canEdit && (
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 text-xs font-semibold text-white bg-teal-700 hover:bg-teal-800 rounded-lg shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            Cadastrar Novo Insumo
          </button>
        )}
      </div>

      {/* Low stock alert box */}
      {lowStockCount > 0 && (
        <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-900 flex items-center justify-between">
          <div className="flex items-center gap-2 font-medium">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              Atenção: Existem {lowStockCount} itens abaixo do estoque mínimo exigido para as operações das carretas móveis.
            </span>
          </div>
          <button
            onClick={() => setStatusFilter(statusFilter === 'all' ? 'Baixo' : 'all')}
            className="text-xs font-semibold text-amber-800 underline hover:text-amber-900 cursor-pointer whitespace-nowrap"
          >
            {statusFilter === 'all' ? 'Ver Apenas Críticos' : 'Ver Todos'}
          </button>
        </div>
      )}

      {/* Search and filters */}
      <div className="p-3.5 bg-white border border-slate-200 rounded-lg flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="relative flex-1 min-w-[200px]">
          <input
            type="text"
            placeholder="Buscar por insumo, resina, anestésico, lote..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full px-3 py-1.5 pl-8 border border-slate-300 rounded-md focus:ring-1 focus:ring-teal-600"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-2.5 top-2" />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
            className="px-3 py-1.5 border border-slate-300 rounded-md bg-white text-slate-800 text-xs focus:ring-1 focus:ring-teal-600"
          >
            <option value="all">Todas as Categorias</option>
            <option value="Anestésicos & Medicamentos">Anestésicos & Medicamentos</option>
            <option value="Resinas & Restauradores">Resinas & Restauradores</option>
            <option value="Descartáveis & EPI">Descartáveis & EPI</option>
            <option value="Esterilização & Biossegurança">Esterilização & Biossegurança</option>
            <option value="Peças & Manutenção de Veículo">Peças & Manutenção de Veículo</option>
          </select>

          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 border border-slate-300 rounded-md bg-white text-slate-800 text-xs focus:ring-1 focus:ring-teal-600"
          >
            <option value="all">Todos os Níveis de Estoque</option>
            <option value="Adequado">Adequado</option>
            <option value="Baixo">Estoque Baixo</option>
            <option value="Crítico">Crítico</option>
          </select>
        </div>
      </div>

      {/* Inventory table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="p-3">Material / Insumo</th>
                <th className="p-3">Categoria</th>
                <th className="p-3 text-right">Qtd. Atual</th>
                <th className="p-3 text-right">Estoque Mínimo</th>
                <th className="p-3">Alocação</th>
                <th className="p-3">Lote / Validade</th>
                <th className="p-3">Status</th>
                {canEdit && <th className="p-3 text-right">Ações</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredItems.map(item => (
                <tr key={item.id} className="hover:bg-slate-50/70">
                  <td className="p-3">
                    <div className="font-semibold text-slate-900">{item.name}</div>
                    <div className="text-[11px] text-slate-500 font-mono-numbers">
                      Unidade de medida: {item.unit}
                    </div>
                  </td>
                  <td className="p-3 text-slate-600">{item.category}</td>
                  <td className="p-3 text-right font-mono-numbers font-bold text-slate-900 text-sm">
                    {item.currentQuantity} <span className="text-xs font-normal text-slate-500">{item.unit}s</span>
                  </td>
                  <td className="p-3 text-right font-mono-numbers text-slate-500">
                    {item.minQuantity} {item.unit}s
                  </td>
                  <td className="p-3 text-slate-700 font-medium">
                    {item.allocatedUnitName}
                  </td>
                  <td className="p-3 text-slate-600 font-mono-numbers text-[11px]">
                    <div>Lote: {item.batchNumber}</div>
                    <div className="text-slate-400">Val: {new Date(item.expiryDate).toLocaleDateString('pt-BR')}</div>
                  </td>
                  <td className="p-3">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold ${
                        item.status === 'Adequado'
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          : item.status === 'Baixo'
                          ? 'bg-amber-50 text-amber-800 border border-amber-200'
                          : 'bg-rose-50 text-rose-800 border border-rose-200'
                      }`}
                    >
                      ● {item.status}
                    </span>
                  </td>
                  {canEdit && (
                    <td className="p-3 text-right whitespace-nowrap">
                      <button
                        onClick={() => {
                          setMovementItem(item);
                          setMovementType('Entrada');
                        }}
                        className="px-2 py-1 text-[11px] font-semibold text-teal-800 bg-teal-50 hover:bg-teal-100 rounded border border-teal-200 mr-1 transition-colors cursor-pointer"
                        title="Registrar Entrada"
                      >
                        + Entrada
                      </button>
                      <button
                        onClick={() => {
                          setMovementItem(item);
                          setMovementType('Saída');
                        }}
                        className="px-2 py-1 text-[11px] font-semibold text-amber-800 bg-amber-50 hover:bg-amber-100 rounded border border-amber-200 mr-1 transition-colors cursor-pointer"
                        title="Registrar Baixa"
                      >
                        - Baixa
                      </button>
                      <button
                        onClick={() => {
                          setEditingItem(item);
                          setEditItemName(item.name);
                          setEditItemCategory(item.category);
                          setEditItemCurrentQty(item.currentQuantity);
                          setEditItemMinQty(item.minQuantity);
                          setEditItemUnit(item.unit);
                          setEditItemBatch(item.batchNumber);
                          setEditItemExpiry(item.expiryDate);
                          setEditItemAllocatedUnitId(item.allocatedUnitId);
                        }}
                        className="px-2 py-1 text-[11px] font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded border border-slate-300 mr-1 transition-colors cursor-pointer"
                        title="Editar Dados do Item"
                      >
                        Editar
                      </button>
                      {currentUser.role === 'Admin' && (
                        <button
                          onClick={() => setDeletingItem(item)}
                          className="px-2 py-1 text-[11px] font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded border border-rose-200 transition-colors cursor-pointer"
                          title="Excluir Item do Estoque"
                        >
                          Excluir
                        </button>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Movement Modal (Entrada / Saída de Insumo) */}
      {movementItem && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="relative w-full max-w-md bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
              <div className="flex items-center gap-2">
                <Package className="w-5 h-5 text-teal-700" />
                <h3 className="text-base font-semibold text-slate-900">
                  {movementType === 'Entrada' ? 'Registrar Entrada de Material' : 'Registrar Baixa / Saída de Material'}
                </h3>
              </div>
              <button
                onClick={() => setMovementItem(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleApplyMovement} className="p-6 space-y-4">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs">
                <span className="text-slate-500 block">Item Selecionado:</span>
                <span className="font-bold text-slate-900 text-sm">{movementItem.name}</span>
                <span className="text-slate-600 block mt-0.5 font-mono-numbers">
                  Saldo Atual: {movementItem.currentQuantity} {movementItem.unit}s
                </span>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setMovementType('Entrada')}
                  className={`flex-1 py-1.5 text-xs font-semibold rounded-lg border transition-colors cursor-pointer ${
                    movementType === 'Entrada'
                      ? 'bg-teal-700 text-white border-teal-700'
                      : 'bg-white text-slate-700 border-slate-300'
                  }`}
                >
                  Entrada (Recebimento)
                </button>
                <button
                  type="button"
                  onClick={() => setMovementType('Saída')}
                  className={`flex-1 py-1.5 text-xs font-semibold rounded-lg border transition-colors cursor-pointer ${
                    movementType === 'Saída'
                      ? 'bg-rose-700 text-white border-rose-700'
                      : 'bg-white text-slate-700 border-slate-300'
                  }`}
                >
                  Saída (Consumo Clínico)
                </button>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Quantidade a movimentar ({movementItem.unit}s) *
                </label>
                <input
                  type="number"
                  min={1}
                  required
                  value={movementQuantity}
                  onChange={e => setMovementQuantity(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-600 font-mono-numbers"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Motivo / Justificativa da Movimentação
                </label>
                <input
                  type="text"
                  value={movementReason}
                  onChange={e => setMovementReason(e.target.value)}
                  placeholder="Ex: Abastecimento do consultório 01 ou Nota Fiscal nº 49102"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-600"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setMovementItem(null)}
                  className="px-4 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-teal-700 hover:bg-teal-800 rounded-lg transition-colors cursor-pointer"
                >
                  Confirmar Movimentação
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add new Item modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="relative w-full max-w-lg bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
              <div className="flex items-center gap-2">
                <Package className="w-5 h-5 text-teal-700" />
                <h3 className="text-base font-semibold text-slate-900">
                  Cadastrar Novo Insumo Odontológico
                </h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddNewItem} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nome do Material / Insumo *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Ex: Resina Composta Z350 XT Cor A1"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Categoria *
                  </label>
                  <select
                    value={category}
                    onChange={e => setCategory(e.target.value as SupplyCategory)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-600 bg-white"
                  >
                    <option value="Anestésicos & Medicamentos">Anestésicos & Medicamentos</option>
                    <option value="Resinas & Restauradores">Resinas & Restauradores</option>
                    <option value="Instrumentais & Brocas">Instrumentais & Brocas</option>
                    <option value="Descartáveis & EPI">Descartáveis & EPI</option>
                    <option value="Esterilização & Biossegurança">Esterilização & Biossegurança</option>
                    <option value="Peças & Manutenção de Veículo">Peças & Manutenção de Veículo</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Unidade de Medida *
                  </label>
                  <select
                    value={unit}
                    onChange={e => setUnit(e.target.value as InventoryItem['unit'])}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-600 bg-white"
                  >
                    <option value="caixa">Caixa</option>
                    <option value="tubete">Tubete</option>
                    <option value="unidade">Unidade</option>
                    <option value="frasco">Frasco</option>
                    <option value="kit">Kit</option>
                    <option value="pacote">Pacote</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Quantidade Inicial
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={currentQuantity}
                    onChange={e => setCurrentQuantity(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-600 font-mono-numbers"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Estoque Mínimo de Alerta
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={minQuantity}
                    onChange={e => setMinQuantity(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-600 font-mono-numbers"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Número do Lote
                  </label>
                  <input
                    type="text"
                    value={batchNumber}
                    onChange={e => setBatchNumber(e.target.value)}
                    placeholder="LOTE-..."
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-600 uppercase font-mono-numbers"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Data de Validade
                  </label>
                  <input
                    type="date"
                    value={expiryDate}
                    onChange={e => setExpiryDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-600 font-mono-numbers"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Local de Armazenamento / Unidade Alocada
                </label>
                <select
                  value={allocatedUnitId}
                  onChange={e => setAllocatedUnitId(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-600 bg-white"
                >
                  <option value="central">Almoxarifado Central (Sede)</option>
                  {units.map(u => (
                    <option key={u.id} value={u.id}>
                      {u.identifier} ({u.plate})
                    </option>
                  ))}
                </select>
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
                  Cadastrar Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Edit Inventory Item */}
      {editingItem && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="relative w-full max-w-lg bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
              <div className="flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-teal-700" />
                <h3 className="text-base font-semibold text-slate-900">
                  Editar Item do Estoque
                </h3>
              </div>
              <button
                onClick={() => setEditingItem(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!editingItem || !editItemName.trim()) return;

                const targetUnit = units.find(u => u.id === editItemAllocatedUnitId);
                const unitName = editItemAllocatedUnitId === 'central'
                  ? 'Almoxarifado Central'
                  : (targetUnit ? targetUnit.identifier : 'Unidade');

                const curQty = Number(editItemCurrentQty);
                const minQty = Number(editItemMinQty);
                let newStatus: InventoryItem['status'] = 'Adequado';
                if (curQty <= minQty / 2) {
                  newStatus = 'Crítico';
                } else if (curQty <= minQty) {
                  newStatus = 'Baixo';
                }

                const updated: InventoryItem = {
                  ...editingItem,
                  name: editItemName.trim(),
                  category: editItemCategory,
                  currentQuantity: curQty,
                  minQuantity: minQty,
                  unit: editItemUnit,
                  batchNumber: editItemBatch.trim(),
                  expiryDate: editItemExpiry,
                  allocatedUnitId: editItemAllocatedUnitId,
                  allocatedUnitName: unitName,
                  status: newStatus,
                  lastMovementDate: new Date().toISOString().split('T')[0]
                };

                onUpdateInventory(inventory.map(item => item.id === updated.id ? updated : item));
                setEditingItem(null);
              }}
              className="p-6 space-y-4"
            >
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nome do Material / Insumo *
                </label>
                <input
                  type="text"
                  required
                  value={editItemName}
                  onChange={e => setEditItemName(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Categoria *
                  </label>
                  <select
                    value={editItemCategory}
                    onChange={e => setEditItemCategory(e.target.value as SupplyCategory)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-600 bg-white"
                  >
                    <option value="Anestésicos & Medicamentos">Anestésicos & Medicamentos</option>
                    <option value="Resinas & Restauradores">Resinas & Restauradores</option>
                    <option value="Instrumentais & Brocas">Instrumentais & Brocas</option>
                    <option value="Descartáveis & EPI">Descartáveis & EPI</option>
                    <option value="Esterilização & Biossegurança">Esterilização & Biossegurança</option>
                    <option value="Peças & Manutenção de Veículo">Peças & Manutenção de Veículo</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Unidade de Medida *
                  </label>
                  <select
                    value={editItemUnit}
                    onChange={e => setEditItemUnit(e.target.value as InventoryItem['unit'])}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-600 bg-white"
                  >
                    <option value="caixa">Caixa</option>
                    <option value="unidade">Unidade</option>
                    <option value="frasco">Frasco</option>
                    <option value="tubete">Tubete</option>
                    <option value="kit">Kit</option>
                    <option value="rolo">Rolo</option>
                    <option value="pacote">Pacote</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Quantidade Atual *
                  </label>
                  <input
                    type="number"
                    min={0}
                    required
                    value={editItemCurrentQty}
                    onChange={e => setEditItemCurrentQty(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-600 font-mono-numbers"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Estoque Mínimo de Alerta *
                  </label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={editItemMinQty}
                    onChange={e => setEditItemMinQty(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-600 font-mono-numbers"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Número do Lote
                  </label>
                  <input
                    type="text"
                    value={editItemBatch}
                    onChange={e => setEditItemBatch(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-600 font-mono-numbers"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Data de Validade
                  </label>
                  <input
                    type="date"
                    value={editItemExpiry}
                    onChange={e => setEditItemExpiry(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-600 font-mono-numbers"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Local de Armazenamento / Unidade Alocada
                </label>
                <select
                  value={editItemAllocatedUnitId}
                  onChange={e => setEditItemAllocatedUnitId(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-600 bg-white"
                >
                  <option value="central">Almoxarifado Central (Sede)</option>
                  {units.map(u => (
                    <option key={u.id} value={u.id}>
                      {u.identifier} ({u.plate})
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
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

      {/* Modal: Delete Inventory Item Confirmation */}
      {deletingItem && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="relative w-full max-w-md bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden p-6 space-y-4">
            <div className="flex items-center gap-3 text-rose-700">
              <div className="p-2.5 bg-rose-50 rounded-full">
                <Trash2 className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">
                Confirmar Exclusão de Insumo
              </h3>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Você tem certeza que deseja remover o item <strong className="text-slate-900">{deletingItem.name}</strong> (Lote: {deletingItem.batchNumber}) do almoxarifado?
              Esta ação removerá o insumo e seus alertas de saldo mínimo.
            </p>

            <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setDeletingItem(null)}
                className="px-4 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  onUpdateInventory(inventory.filter(i => i.id !== deletingItem.id));
                  setDeletingItem(null);
                }}
                className="px-4 py-2 text-xs font-semibold text-white bg-rose-700 hover:bg-rose-800 rounded-lg transition-colors cursor-pointer"
              >
                Sim, Excluir Item
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
