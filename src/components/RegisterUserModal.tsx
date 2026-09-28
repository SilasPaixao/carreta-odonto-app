import React, { useState } from 'react';
import { UserRole, AppUser, MobileUnit } from '../types';
import { hashPassword, generateSalt } from '../utils/crypto';
import { X, UserPlus, Lock, Shield, AlertCircle, CheckCircle2, Truck } from 'lucide-react';

interface RegisterUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUserRegistered: (newUser: AppUser) => void;
  existingUsers: AppUser[];
  currentUser: AppUser;
  units: MobileUnit[];
}

export const RegisterUserModal: React.FC<RegisterUserModalProps> = ({
  isOpen,
  onClose,
  onUserRegistered,
  existingUsers,
  currentUser,
  units
}) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserRole>('Cirurgião-Dentista');
  const [cro, setCro] = useState('');
  const [phone, setPhone] = useState('');
  const [cpf, setCpf] = useState('');
  const [selectedUnitId, setSelectedUnitId] = useState<string>(units[0]?.id || '');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  // Determine if CRO is mandatory or optional
  const mandatoryCroRoles: UserRole[] = [
    'Cirurgião-Dentista',
    'Técnico em Saúde Bucal (TSB)',
    'Auxiliar em Saúde Bucal (ASB)',
    'Técnico em Prótese Dentária (TPD)',
    'Auxiliar em Prótese Dentária (APD)'
  ];

  const isCroMandatory = mandatoryCroRoles.includes(role);
  const isCroOptional = role === 'Coordenador';
  const showCroField = isCroMandatory || isCroOptional;

  // Requirement: "os demais profissionais podem ver todas áreas, porém apenas informações relacionadas a sua determinada carreta (logo, no cadastro de cada profissional deve ter no formulário a seção obrigatória de carreta relacionada a tal profissional)"
  const requiresCarreta = role !== 'Admin';

  const availableRoles: UserRole[] = [
    'Admin',
    'Coordenador',
    'Cirurgião-Dentista',
    'Técnico em Saúde Bucal (TSB)',
    'Auxiliar em Saúde Bucal (ASB)',
    'Técnico em Prótese Dentária (TPD)',
    'Auxiliar em Prótese Dentária (APD)',
    'Recepcionista / Atendente',
    'Gestor Financeiro',
    'Almoxarife',
    'Motorista',
    'Outro'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (!name.trim()) {
      setError('Por favor, informe o nome completo.');
      return;
    }

    if (!email.trim() || !email.includes('@')) {
      setError('Por favor, informe um e-mail válido.');
      return;
    }

    if (existingUsers.some(u => u.email.toLowerCase() === email.trim().toLowerCase())) {
      setError('Este e-mail já está cadastrado no sistema.');
      return;
    }

    if (isCroMandatory && !cro.trim()) {
      setError(`O registro de CRO é OBRIGATÓRIO para a função de ${role}.`);
      return;
    }

    if (requiresCarreta && role !== 'Coordenador' && role !== 'Almoxarife' && !selectedUnitId) {
      setError('A seleção da carreta relacionada é obrigatória para este profissional.');
      return;
    }

    if (!password || password.length < 6) {
      setError('A senha deve ter no mínimo 6 caracteres.');
      return;
    }

    setIsSubmitting(true);

    try {
      const salt = generateSalt();
      const passwordHash = await hashPassword(password, salt);

      const activeAdmins = existingUsers.filter(u => u.role === 'Admin' && u.status === 'active');
      let status: 'active' | 'pending_approval' = 'active';
      let isFirstAdmin = false;

      if (role === 'Admin') {
        if (activeAdmins.length === 0) {
          status = 'active';
          isFirstAdmin = true;
        } else {
          status = 'pending_approval';
        }
      }

      // Default unit assignments:
      // Coordenador: access to all units by default
      // Almoxarife: access to all units by default
      // Other roles: specific assigned unit
      const hasAccessToAllUnits = role === 'Admin' || role === 'Coordenador' || (role === 'Almoxarife' && selectedUnitId === 'all');
      const assignedUnitIds = (role === 'Coordenador' || (role === 'Almoxarife' && selectedUnitId === 'all'))
        ? units.map(u => u.id)
        : selectedUnitId ? [selectedUnitId] : [];

      const newUser: AppUser = {
        id: `usr_${Date.now()}`,
        name: name.trim(),
        email: email.trim().toLowerCase(),
        role,
        cro: showCroField && cro.trim() ? cro.trim() : undefined,
        phone: phone.trim() || '(Não informado)',
        cpf: cpf.trim() || undefined,
        assignedUnitIds,
        hasAccessToAllUnits,
        passwordHash,
        salt,
        status,
        registeredAt: new Date().toISOString(),
        isFirstAdmin: isFirstAdmin ? true : undefined
      };

      onUserRegistered(newUser);

      if (status === 'pending_approval') {
        setSuccessMessage('Administrador registrado com sucesso! O acesso permanecerá pendente até aprovação de um dos administradores ativos.');
      } else {
        setSuccessMessage(`Usuário ${name} cadastrado com sucesso com a função de ${role}.`);
      }

      setTimeout(() => {
        onClose();
        setName('');
        setEmail('');
        setCro('');
        setPhone('');
        setCpf('');
        setPassword('');
        setSuccessMessage(null);
      }, 1600);
    } catch (err) {
      console.error(err);
      setError('Erro ao salvar os dados. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative w-full max-w-xl bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-teal-700" />
            <h2 className="text-base font-semibold text-slate-900">
              Cadastrar Profissional / Usuário
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-800 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>{successMessage}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nome Completo *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Ex: Dra. Mariana Vasconcelos"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-teal-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                E-mail Profissional *
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="nome@odontomovel.com.br"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-teal-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Função / Cargo no Sistema *
              </label>
              <select
                value={role}
                onChange={e => setRole(e.target.value as UserRole)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-teal-600 bg-white"
              >
                {availableRoles.map(r => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>

            {/* Carreta Relacionada (Obrigatória para Profissionais de Saúde e Motoristas) */}
            {requiresCarreta && (
              <div className="sm:col-span-2 bg-slate-50 p-3.5 rounded-lg border border-slate-200 space-y-1">
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
                    <Truck className="w-4 h-4 text-teal-700" />
                    Carreta Odontológica Relacionada *
                  </label>
                  {role === 'Coordenador' || role === 'Almoxarife' ? (
                    <span className="text-[11px] text-teal-700 font-medium">Acesso padrão: todas as carretas</span>
                  ) : (
                    <span className="text-[11px] text-rose-600 font-bold">* Obrigatório</span>
                  )}
                </div>
                <select
                  value={selectedUnitId}
                  onChange={e => setSelectedUnitId(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-teal-600 bg-white"
                >
                  {(role === 'Coordenador' || role === 'Almoxarife') && (
                    <option value="all">Todas as Unidades Móveis (Acesso Geral)</option>
                  )}
                  {units.map(u => (
                    <option key={u.id} value={u.id}>
                      {u.identifier} — Placa: {u.plate} ({u.currentMunicipality})
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-slate-500">
                  {role === 'Coordenador' || role === 'Almoxarife'
                    ? 'Por padrão possui acesso a todas as carretas. Você poderá limitar a uma unidade específica se desejar.'
                    : 'O profissional visualizará apenas os dados e movimentações vinculados a esta unidade móvel.'}
                </p>
              </div>
            )}

            {/* CRO Field with conditional mandatory/optional label */}
            {showCroField && (
              <div className="sm:col-span-2 bg-slate-50 p-3 rounded-lg border border-slate-200">
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-semibold text-slate-700">
                    Número do Registro no CRO (Conselho Regional de Odontologia)
                    {isCroMandatory ? (
                      <span className="text-rose-600 ml-1 font-bold">* (Obrigatório)</span>
                    ) : (
                      <span className="text-slate-500 ml-1 font-normal">(Opcional)</span>
                    )}
                  </label>
                  <span className="text-[11px] text-slate-500">Ex: SP-CD-12345 / SP-TSB-890</span>
                </div>
                <input
                  type="text"
                  required={isCroMandatory}
                  value={cro}
                  onChange={e => setCro(e.target.value)}
                  placeholder="Ex: SP-CD-94821"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-teal-600 bg-white"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Telefone / WhatsApp
              </label>
              <input
                type="text"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="(19) 98765-4321"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-teal-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                CPF do Profissional
              </label>
              <input
                type="text"
                value={cpf}
                onChange={e => setCpf(e.target.value)}
                placeholder="000.000.000-00"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-teal-600"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Senha de Acesso *
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-teal-600"
                />
                <Lock className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
              </div>
            </div>
          </div>

          {role === 'Admin' && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-900 flex items-start gap-2">
              <Shield className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <strong>Atenção:</strong> Novos administradores passarão por aprovação de um dos administradores ativos antes de liberar acesso aos módulos restritos.
              </div>
            </div>
          )}

          <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-xs font-semibold text-white bg-teal-700 hover:bg-teal-800 disabled:opacity-50 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <UserPlus className="w-4 h-4" />
              {isSubmitting ? 'Salvando...' : 'Cadastrar Usuário'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
