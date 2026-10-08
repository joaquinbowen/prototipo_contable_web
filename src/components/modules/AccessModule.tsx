import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ArrowRight, LockKeyhole, UserPlus } from 'lucide-react';

export const AccessModule: React.FC = () => {
  const { authenticateDemo } = useApp();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [identifier, setIdentifier] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [taxpayerRuc, setTaxpayerRuc] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (mode === 'register' && password !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }
    setError('');
    const enteredRuc = mode === 'register' ? taxpayerRuc.trim() : /^\d{13}$/.test(identifier.trim()) ? identifier.trim() : '';
    authenticateDemo('CONTRIBUYENTE', mode === 'register', displayName.trim(), mode === 'register' ? identifier.trim() : '', '', enteredRuc);
  };

  const switchMode = (nextMode: 'login' | 'register') => {
    setMode(nextMode);
    setError('');
    setPassword('');
    setConfirmPassword('');
  };

  return <main className="grid min-h-dvh place-items-center bg-[#f3f6f5] px-4 py-5 sm:px-6 sm:py-6">
    <section className="mx-auto grid w-full max-w-6xl overflow-hidden rounded-[26px] border border-slate-200/80 bg-white shadow-[0_24px_80px_-48px_rgba(31,51,58,0.35)] md:grid-cols-[0.9fr_1.1fr]">
      <aside className="hidden flex-col justify-between bg-blue-900 p-9 text-white md:flex xl:p-11">
        <div><div className="flex items-center gap-3"><span className="grid h-11 w-11 place-items-center rounded-2xl bg-white/10 font-black ring-1 ring-white/20">360</span><span className="text-lg font-extrabold tracking-tight">CONT MARJO</span></div>
          <div className="mt-12"><p className="text-[11px] font-bold uppercase tracking-[0.18em] text-blue-200">Contabilidad e impuestos</p><h1 className="mt-3 max-w-sm text-3xl font-semibold leading-tight tracking-tight">Tus obligaciones y documentos, en orden.</h1><p className="mt-4 max-w-sm text-sm leading-6 text-slate-200">Accede al espacio de tu negocio o a las herramientas profesionales de tu estudio contable.</p></div>
        </div>
        <p className="rounded-2xl border border-white/15 bg-white/5 p-3.5 text-xs leading-5 text-slate-200">Prototipo local. Los documentos, cálculos y trámites son de demostración.</p>
      </aside>
      <div className="p-6 sm:p-9 lg:p-10">
        <div className="mb-5 md:hidden"><div className="flex items-center gap-2 font-extrabold tracking-tight"><span className="grid h-9 w-9 place-items-center rounded-xl bg-blue-900 text-sm text-white">360</span>CONT MARJO</div></div>
        <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-blue-700">Espacio de demostración</p>
        <h2 className="mt-1 text-3xl font-bold tracking-tight text-slate-950">{mode === 'login' ? 'Bienvenido de nuevo' : 'Crea tu cuenta'}</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">{mode === 'login' ? 'Entra con tu RUC o correo y explora la plataforma.' : 'Completa los datos de tu negocio para comenzar.'} Puedes cambiar de rol desde el encabezado.</p>
        <div className="mt-5 grid grid-cols-2 rounded-xl bg-slate-100 p-1" role="tablist" aria-label="Acceso a la demo">
          <button type="button" role="tab" aria-selected={mode === 'login'} onClick={() => switchMode('login')} className={`rounded-lg px-3 py-3 text-sm font-semibold transition-colors ${mode === 'login' ? 'bg-white text-blue-900 shadow-sm' : 'text-slate-600 hover:text-blue-900'}`}>Iniciar sesión</button>
          <button type="button" role="tab" aria-selected={mode === 'register'} onClick={() => switchMode('register')} className={`rounded-lg px-3 py-3 text-sm font-semibold transition-colors ${mode === 'register' ? 'bg-white text-blue-900 shadow-sm' : 'text-slate-600 hover:text-blue-900'}`}>Registrarse</button>
        </div>
        <form onSubmit={submit} className={`mt-5 grid gap-x-4 gap-y-4 ${mode === 'register' ? 'sm:grid-cols-2' : ''}`}>
          {mode === 'register' && <label className="block text-sm font-semibold text-slate-700">Nombre o razón social<input name="displayName" autoComplete="organization" required value={displayName} onChange={(event) => setDisplayName(event.target.value)} className="mt-1.5 min-h-11 w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm font-normal" placeholder="Nombre de tu negocio" /></label>}
          {mode === 'register' && <label className="block text-sm font-semibold text-slate-700">RUC<input name="ruc" inputMode="numeric" autoComplete="off" required value={taxpayerRuc} onChange={(event) => setTaxpayerRuc(event.target.value)} className="mt-1.5 min-h-11 w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm font-normal" placeholder="13 dígitos" /></label>}
          <label className={`block text-sm font-semibold text-slate-700 ${mode === 'register' ? 'sm:col-span-2' : ''}`}>{mode === 'register' ? 'Correo electrónico' : 'RUC o correo electrónico'}<input name="identifier" type="text" autoComplete={mode === 'register' ? 'email' : 'username'} required value={identifier} onChange={(event) => setIdentifier(event.target.value)} className="mt-1.5 min-h-11 w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm font-normal" placeholder={mode === 'register' ? 'nombre@correo.com' : 'Ingresa tu RUC o correo'} /></label>
          <label className="block text-sm font-semibold text-slate-700">Contraseña<input name="password" autoComplete={mode === 'register' ? 'new-password' : 'current-password'} required type="password" value={password} onChange={(event) => setPassword(event.target.value)} className="mt-1.5 min-h-11 w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm font-normal" placeholder="Escribe cualquier contraseña" /></label>
          {mode === 'register' && <label className="block text-sm font-semibold text-slate-700">Confirmar contraseña<input name="confirmPassword" autoComplete="new-password" required type="password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} className="mt-1.5 min-h-11 w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm font-normal" placeholder="Repite la contraseña" /></label>}
          {error && <p role="alert" className={`rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 ${mode === 'register' ? 'sm:col-span-2' : ''}`}>{error}</p>}
          <button className={`flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-blue-700 px-4 py-3 text-sm font-bold text-white shadow-sm transition-colors hover:bg-blue-800 ${mode === 'register' ? 'sm:col-span-2' : ''}`}>{mode === 'login' ? <LockKeyhole className="h-4 w-4"/> : <UserPlus className="h-4 w-4"/>}{mode === 'login' ? 'Entrar a la demo' : 'Crear cuenta de demostración'}<ArrowRight className="h-4 w-4"/></button>
        </form>
        <p className="mt-3 text-xs leading-5 text-slate-500">{mode === 'login' ? 'Las credenciales son solo para entrar a la demo.' : 'El registro abre el perfil de contribuyente para configurarlo.'} Usa el selector del encabezado para ver contribuyente, contador y superadmin.</p>
      </div>
    </section>
  </main>;
};
