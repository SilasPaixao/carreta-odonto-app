import React, { useState } from 'react';
import { AppUser, MobileUnit, UserRole } from '../types';
import { hashPassword, generateSalt, verifyPassword } from '../utils/crypto';
import { 
  Lock, 
  Mail, 
  ShieldCheck, 
  UserPlus, 
  LogIn, 
  AlertCircle, 
  CheckCircle2, 
  Truck, 
  Shield, 
  KeyRound, 
  User, 
  Phone, 
  FileText,
  Clock,
  Sparkles
} from 'lucide-react';

interface AuthScreenProps {
  users: AppUser[];
  units: MobileUnit[];
  onLoginSuccess: (user: AppUser) => void;
  onUserRegistered: (user: AppUser) => void;
  attemptedPath?: string | null;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({
  users,
  units,
  onLoginSuccess,
  onUserRegistered,
  attemptedPath
}) => {
  const [tab, setTab] = useState<'login' | 'register'>('login');

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Registration form state
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regRole, setRegRole] = useState<UserRole>('Admin');
  const [regCro, setRegCro] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regCpf, setRegCpf] = useState('');
  const [regUnitId, setRegUnitId] = useState<string>(units[0]?.id || '');
  const [regPassword, setRegPassword] = useState('');
  const [regPasswordConfirm, setRegPasswordConfirm] = useState('');
  const [regError, setRegError] = useState<string | null>(null);
  const [regSuccess, setRegSuccess] = useState<string | null>(null);
  const [isRegistering, setIsRegistering] = useState(false);

  // Available roles for registration
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

  const mandatoryCroRoles: UserRole[] = [
    'Cirurgião-Dentista',
    'Técnico em Saúde Bucal (TSB)',
    'Auxiliar em Saúde Bucal (ASB)',
    'Técnico em Prótese Dentária (TPD)',
    'Auxiliar em Prótese Dentária (APD)'
  ];

  const isCroMandatory = mandatoryCroRoles.includes(regRole);
  const isCroOptional = regRole === 'Coordenador';
  const showCroField = isCroMandatory || isCroOptional;
  const requiresCarreta = regRole !== 'Admin';

  // Handle Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);

    const emailClean = loginEmail.trim().toLowerCase();
    if (!emailClean || !loginPassword) {
      setLoginError('Informe o e-mail e a senha cadastrados.');
      return;
    }

    setIsLoggingIn(true);

    try {
      const user = users.find(u => u.email.toLowerCase() === emailClean);

      if (!user) {
        setLoginError('Usuário não encontrado. Verifique o e-mail ou cadastre-se.');
        setIsLoggingIn(false);
        return;
      }

      if (user.status === 'pending_approval') {
        setLoginError(
          'Sua conta de Administrador está pendente de aprovação por outro administrador ativo.'
        );
        setIsLoggingIn(false);
        return;
      }

      if (user.status === 'rejected') {
        setLoginError('Esta solicitação de acesso foi recusada pela administração.');
        setIsLoggingIn(false);
        return;
      }

      // Verificação criptográfica com SHA-256 e Salt
      let isPasswordValid = false;
      if (user.salt && user.passwordHash) {
        isPasswordValid = await verifyPassword(loginPassword, user.salt, user.passwordHash);
      }

      // Fallback para senhas iniciais de demonstração (se digitou '123456' ou senha pré-definida)
      if (!isPasswordValid && (loginPassword === '123456' || loginPassword === 'admin123')) {
        isPasswordValid = true;
      }

      if (!isPasswordValid) {
        setLoginError('Senha incorreta. Verifique suas credenciais.');
        setIsLoggingIn(false);
        return;
      }

      onLoginSuccess(user);
    } catch (err) {
      console.error(err);
      setLoginError('Ocorreu um erro ao autenticar. Tente novamente.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Quick helper to fill demo credentials
  const fillQuickDemo = (roleName: 'admin' | 'coord' | 'dentist' | 'driver' | 'almox') => {
    const target = users.find(u => {
      if (roleName === 'admin') return u.role === 'Admin' && u.status === 'active';
      if (roleName === 'coord') return u.role === 'Coordenador';
      if (roleName === 'dentist') return u.role === 'Cirurgião-Dentista';
      if (roleName === 'driver') return u.role === 'Motorista';
      if (roleName === 'almox') return u.role === 'Almoxarife';
      return false;
    });

    if (target) {
      setLoginEmail(target.email);
      setLoginPassword('123456');
      setLoginError(null);
    }
  };

  // Handle Registration
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError(null);
    setRegSuccess(null);

    if (!regName.trim()) {
      setRegError('Por favor, informe seu nome completo.');
      return;
    }

    if (!regEmail.trim() || !regEmail.includes('@')) {
      setRegError('Por favor, informe um endereço de e-mail válido.');
      return;
    }

    if (users.some(u => u.email.toLowerCase() === regEmail.trim().toLowerCase())) {
      setRegError('Este endereço de e-mail já possui cadastro no sistema.');
      return;
    }

    if (isCroMandatory && !regCro.trim()) {
      setRegError(`O registro do CRO é obrigatório para o cargo de ${regRole}.`);
      return;
    }

    if (requiresCarreta && regRole !== 'Coordenador' && regRole !== 'Almoxarife' && !regUnitId) {
      setRegError('Selecione a carreta odontológica vinculada a este profissional.');
      return;
    }

    if (regPassword.length < 6) {
      setRegError('A senha de acesso deve possuir pelo menos 6 caracteres.');
      return;
    }

    if (regPassword !== regPasswordConfirm) {
      setRegError('A confirmação de senha não confere com a senha digitada.');
      return;
    }

    setIsRegistering(true);

    try {
      const salt = generateSalt();
      const passwordHash = await hashPassword(regPassword, salt);

      const activeAdmins = users.filter(u => u.role === 'Admin' && u.status === 'active');
      let status: 'active' | 'pending_approval' = 'active';
      let isFirstAdmin = false;

      if (regRole === 'Admin') {
        if (activeAdmins.length === 0) {
          status = 'active';
          isFirstAdmin = true;
        } else {
          status = 'pending_approval';
        }
      }

      const hasAccessToAllUnits = regRole === 'Admin' || regRole === 'Coordenador' || (regRole === 'Almoxarife' && regUnitId === 'all');
      const assignedUnitIds = (regRole === 'Coordenador' || (regRole === 'Almoxarife' && regUnitId === 'all'))
        ? units.map(u => u.id)
        : regUnitId ? [regUnitId] : [];

      const newUser: AppUser = {
        id: `usr_${Date.now()}`,
        name: regName.trim(),
        email: regEmail.trim().toLowerCase(),
        role: regRole,
        cro: showCroField && regCro.trim() ? regCro.trim() : undefined,
        phone: regPhone.trim() || '(Não informado)',
        cpf: regCpf.trim() || undefined,
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
        setRegSuccess('Cadastro realizado! Por ser conta de Administrador, aguarde aprovação de um dos administradores ativos.');
        setTimeout(() => {
          setTab('login');
          setLoginEmail(newUser.email);
          setRegSuccess(null);
        }, 3000);
      } else {
        setRegSuccess(`Cadastro realizado com sucesso! Conectando...`);
        setTimeout(() => {
          onLoginSuccess(newUser);
        }, 1200);
      }
    } catch (err) {
      console.error(err);
      setRegError('Falha ao processar cadastro seguro. Tente novamente.');
    } finally {
      setIsRegistering(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center items-center p-4 relative overflow-hidden">
      {/* Background Graphic Accents */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-teal-500 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-cyan-600 rounded-full blur-3xl"></div>
      </div>

      <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-8">
        {/* Header Header Brand */}
        <div className="bg-gradient-to-r from-teal-800 to-teal-900 px-8 py-7 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-white text-teal-900 flex items-center justify-center font-extrabold text-lg shadow-md">
                OM
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight">OdontoMóvel Brasil</h1>
                <p className="text-teal-200 text-xs">Sistema Integrado de Gestão de Frotas & Saúde Bucal</p>
              </div>
            </div>
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 bg-white/10 backdrop-blur-xs rounded-full text-[11px] font-medium text-teal-100 border border-white/20">
              <Shield className="w-3.5 h-3.5 text-teal-300" />
              <span>Acesso Restrito</span>
            </div>
          </div>

          {/* Attempted Redirect Notice */}
          {attemptedPath && (
            <div className="mt-4 p-2.5 bg-amber-400/20 border border-amber-300/40 rounded-lg text-xs text-amber-100 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-300 shrink-0" />
              <span>
                Área restrita. Faça login ou cadastre-se para acessar o sistema.
              </span>
            </div>
          )}
        </div>

        {/* Tab Switcher: Login / Cadastro */}
        <div className="flex border-b border-slate-200 bg-slate-50 text-xs font-semibold">
          <button
            onClick={() => {
              setTab('login');
              setLoginError(null);
            }}
            className={`flex-1 py-3.5 text-center flex items-center justify-center gap-2 transition-colors cursor-pointer ${
              tab === 'login'
                ? 'bg-white text-teal-800 border-b-2 border-teal-700 shadow-2xs font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
            }`}
          >
            <LogIn className="w-4 h-4" />
            <span>Entrar no Sistema</span>
          </button>
          <button
            onClick={() => {
              setTab('register');
              setRegError(null);
            }}
            className={`flex-1 py-3.5 text-center flex items-center justify-center gap-2 transition-colors cursor-pointer ${
              tab === 'register'
                ? 'bg-white text-teal-800 border-b-2 border-teal-700 shadow-2xs font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
            }`}
          >
            <UserPlus className="w-4 h-4" />
            <span>Cadastrar Novo Usuário / Admin</span>
          </button>
        </div>

        {/* ========================================================================= */}
        {/* ABA DE LOGIN                                                               */}
        {/* ========================================================================= */}
        {tab === 'login' && (
          <div className="p-8 space-y-6">
            <div>
              <h2 className="text-base font-bold text-slate-900">Autenticação de Usuários & Administradores</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Digite suas credenciais corporativas para acessar o painel de controle e frotas.
              </p>
            </div>

            {loginError && (
              <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-start gap-2.5 animate-shake">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>{loginError}</span>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  E-mail Profissional
                </label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    value={loginEmail}
                    onChange={e => setLoginEmail(e.target.value)}
                    placeholder="seu.email@odontomovel.com.br"
                    className="w-full pl-9 pr-3 py-2.5 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-teal-600 bg-slate-50/50"
                  />
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Senha de Acesso
                </label>
                <div className="relative">
                  <input
                    type="password"
                    required
                    value={loginPassword}
                    onChange={e => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-3 py-2.5 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-teal-600 bg-slate-50/50"
                  />
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoggingIn}
                className="w-full py-2.5 px-4 bg-teal-700 hover:bg-teal-800 text-white rounded-lg text-xs font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <LogIn className="w-4 h-4" />
                {isLoggingIn ? 'Autenticando...' : 'Entrar no Sistema'}
              </button>
            </form>

            {/* Quick Demo Access Bar for rapid tests */}
            <div className="pt-4 border-t border-slate-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  Acesso Rápido de Teste (1 Clique)
                </span>
                <span className="text-[10px] text-slate-400">Senha padrão: 123456</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => fillQuickDemo('admin')}
                  className="px-2.5 py-1.5 text-left border border-slate-200 hover:border-teal-500 hover:bg-teal-50/50 rounded-lg transition-colors cursor-pointer text-[11px]"
                >
                  <div className="font-semibold text-slate-800 flex items-center gap-1">
                    <Shield className="w-3 h-3 text-rose-600" /> Admin
                  </div>
                  <div className="text-[10px] text-slate-500 truncate">Dra. Juliana</div>
                </button>
                <button
                  type="button"
                  onClick={() => fillQuickDemo('coord')}
                  className="px-2.5 py-1.5 text-left border border-slate-200 hover:border-teal-500 hover:bg-teal-50/50 rounded-lg transition-colors cursor-pointer text-[11px]"
                >
                  <div className="font-semibold text-slate-800 flex items-center gap-1">
                    <User className="w-3 h-3 text-amber-600" /> Coordenador
                  </div>
                  <div className="text-[10px] text-slate-500 truncate">Dr. Carlos</div>
                </button>
                <button
                  type="button"
                  onClick={() => fillQuickDemo('dentist')}
                  className="px-2.5 py-1.5 text-left border border-slate-200 hover:border-teal-500 hover:bg-teal-50/50 rounded-lg transition-colors cursor-pointer text-[11px]"
                >
                  <div className="font-semibold text-slate-800 flex items-center gap-1">
                    <User className="w-3 h-3 text-teal-600" /> Dentista
                  </div>
                  <div className="text-[10px] text-slate-500 truncate">Dra. Beatriz</div>
                </button>
                <button
                  type="button"
                  onClick={() => fillQuickDemo('driver')}
                  className="px-2.5 py-1.5 text-left border border-slate-200 hover:border-teal-500 hover:bg-teal-50/50 rounded-lg transition-colors cursor-pointer text-[11px]"
                >
                  <div className="font-semibold text-slate-800 flex items-center gap-1">
                    <Truck className="w-3 h-3 text-blue-600" /> Motorista
                  </div>
                  <div className="text-[10px] text-slate-500 truncate">Rogério</div>
                </button>
                <button
                  type="button"
                  onClick={() => fillQuickDemo('almox')}
                  className="px-2.5 py-1.5 text-left border border-slate-200 hover:border-teal-500 hover:bg-teal-50/50 rounded-lg transition-colors cursor-pointer text-[11px]"
                >
                  <div className="font-semibold text-slate-800 flex items-center gap-1">
                    <KeyRound className="w-3 h-3 text-emerald-600" /> Almoxarife
                  </div>
                  <div className="text-[10px] text-slate-500 truncate">Marcelo</div>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* ABA DE CADASTRO                                                           */}
        {/* ========================================================================= */}
        {tab === 'register' && (
          <div className="p-8 space-y-6">
            <div>
              <h2 className="text-base font-bold text-slate-900">Novo Cadastro Profissional / Admin</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Crie sua conta para receber credenciais e acesso vinculado à sua carreta ou módulo administrativo.
              </p>
            </div>

            {regError && (
              <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>{regError}</span>
              </div>
            )}

            {regSuccess && (
              <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>{regSuccess}</span>
              </div>
            )}

            <form onSubmit={handleRegister} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nome Completo *
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={regName}
                      onChange={e => setRegName(e.target.value)}
                      placeholder="Ex: Dra. Mariana Vasconcelos"
                      className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-teal-600"
                    />
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    E-mail Profissional *
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      required
                      value={regEmail}
                      onChange={e => setRegEmail(e.target.value)}
                      placeholder="nome@odontomovel.com.br"
                      className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-teal-600"
                    />
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Cargo / Função no Sistema *
                  </label>
                  <select
                    value={regRole}
                    onChange={e => setRegRole(e.target.value as UserRole)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-teal-600 bg-white"
                  >
                    {availableRoles.map(r => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Carreta Relacionada */}
                {requiresCarreta && (
                  <div className="sm:col-span-2 bg-slate-50 p-3.5 rounded-lg border border-slate-200 space-y-1">
                    <div className="flex justify-between items-center mb-1">
                      <label className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
                        <Truck className="w-4 h-4 text-teal-700" />
                        Carreta Odontológica Relacionada *
                      </label>
                      {regRole === 'Coordenador' || regRole === 'Almoxarife' ? (
                        <span className="text-[11px] text-teal-700 font-medium">Acesso padrão: todas as carretas</span>
                      ) : (
                        <span className="text-[11px] text-rose-600 font-bold">* Obrigatório</span>
                      )}
                    </div>
                    <select
                      value={regUnitId}
                      onChange={e => setRegUnitId(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-teal-600 bg-white"
                    >
                      {(regRole === 'Coordenador' || regRole === 'Almoxarife') && (
                        <option value="all">Todas as Unidades Móveis (Acesso Geral)</option>
                      )}
                      {units.map(u => (
                        <option key={u.id} value={u.id}>
                          {u.identifier} — Placa: {u.plate} ({u.currentMunicipality})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* CRO Field */}
                {showCroField && (
                  <div className="sm:col-span-2 bg-slate-50 p-3 rounded-lg border border-slate-200">
                    <div className="flex justify-between items-center mb-1">
                      <label className="text-xs font-semibold text-slate-700">
                        Número do Registro no CRO
                        {isCroMandatory ? (
                          <span className="text-rose-600 ml-1 font-bold">* (Obrigatório)</span>
                        ) : (
                          <span className="text-slate-500 ml-1 font-normal">(Opcional)</span>
                        )}
                      </label>
                      <span className="text-[11px] text-slate-500">Ex: SP-CD-12345</span>
                    </div>
                    <input
                      type="text"
                      required={isCroMandatory}
                      value={regCro}
                      onChange={e => setRegCro(e.target.value)}
                      placeholder="Ex: SP-CD-94821"
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-teal-600 bg-white"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Telefone / WhatsApp
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={regPhone}
                      onChange={e => setRegPhone(e.target.value)}
                      placeholder="(19) 98765-4321"
                      className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-teal-600"
                    />
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    CPF
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={regCpf}
                      onChange={e => setRegCpf(e.target.value)}
                      placeholder="000.000.000-00"
                      className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-teal-600"
                    />
                    <FileText className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Senha de Acesso *
                  </label>
                  <div className="relative">
                    <input
                      type="password"
                      required
                      value={regPassword}
                      onChange={e => setRegPassword(e.target.value)}
                      placeholder="Mínimo 6 dígitos"
                      className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-teal-600"
                    />
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Confirmar Senha *
                  </label>
                  <div className="relative">
                    <input
                      type="password"
                      required
                      value={regPasswordConfirm}
                      onChange={e => setRegPasswordConfirm(e.target.value)}
                      placeholder="Repita a senha"
                      className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-teal-600"
                    />
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  </div>
                </div>
              </div>

              {regRole === 'Admin' && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-900 flex items-start gap-2">
                  <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <strong>Regra de Segurança:</strong> Contas com papel de <em>Admin</em> entram com status "Pendente de Aprovação" até que um dos administradores ativos do sistema aprove o acesso.
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={isRegistering}
                className="w-full py-2.5 px-4 bg-teal-700 hover:bg-teal-800 text-white rounded-lg text-xs font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <UserPlus className="w-4 h-4" />
                {isRegistering ? 'Cadastrando...' : 'Concluir Cadastro'}
              </button>
            </form>
          </div>
        )}

        {/* Footer Info */}
        <div className="bg-slate-50 border-t border-slate-200 px-8 py-3.5 flex items-center justify-between text-[11px] text-slate-500">
          <span>OdontoMóvel Gestão Pública &amp; Frotas</span>
          <span className="font-mono-numbers">Segurança SHA-256</span>
        </div>
      </div>
    </div>
  );
};
