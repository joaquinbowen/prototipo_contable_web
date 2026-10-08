import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { UserRole } from '../../types';
import { BadgeCheck, Building2, LockKeyhole } from 'lucide-react';

export const AccessModule: React.FC = () => {
  const { authenticateDemo } = useApp();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [role, setRole] = useState<UserRole>('CONTRIBUYENTE');
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [license, setLicense] = useState('');

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    authenticateDemo(role, mode === 'register', displayName, email, license);
  };

  return <main className="min-h-screen bg-[#f3f6f5] px-4 py-8 sm:px-6 sm:py-12 sm:grid sm:place-items-center">
    <section className="mx-auto grid w-full max-w-5xl overflow-hidden rounded-[28px] border border-slate-200/80 bg-white shadow-[0_24px_80px_-48px_rgba(31,51,58,0.35)] md:grid-cols-[0.9fr_1.1fr]">
      <aside className="hidden flex-col justify-between bg-blue-900 p-9 text-white md:flex lg:p-11">
        <div><div className="flex items-center gap-3"><span className="grid h-11 w-11 place-items-center rounded-2xl bg-white/10 font-black ring-1 ring-white/20">360</span><span className="text-lg font-extrabold tracking-tight">CONT MARJO</span></div>
          <div className="mt-16"><p className="text-[11px] font-bold uppercase tracking-[0.18em] text-blue-200">Contabilidad e impuestos</p><h1 className="mt-3 max-w-sm text-3xl font-semibold leading-tight tracking-tight">Tus obligaciones y documentos, en orden.</h1><p className="mt-4 max-w-sm text-sm leading-6 text-slate-200">Accede al espacio de tu negocio o a las herramientas profesionales de tu estudio contable.</p></div>
        </div>
        <p className="rounded-2xl border border-white/15 bg-white/5 p-3.5 text-xs leading-5 text-slate-200">Prototipo local. Los documentos, cálculos y trámites son de demostración.</p>
      </aside>
      <div className="p-6 sm:p-10 lg:p-12">
        <div className="mb-7 md:hidden"><div className="flex items-center gap-2 font-extrabold tracking-tight"><span className="grid h-9 w-9 place-items-center rounded-xl bg-blue-900 text-white">360</span>CONT MARJO</div><p className="mt-2 text-xs text-slate-500">Acceso al prototipo local de demostración.</p></div>
        <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-blue-700">{mode === 'login' ? 'Acceso seguro' : 'Nueva cuenta'}</p>
        <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-950">{mode === 'login' ? 'Iniciar sesión' : 'Registrarse'}</h2>
        <div className="mt-5 grid grid-cols-2 rounded-xl bg-slate-100/80 p-1 text-sm"><button type="button" onClick={() => setMode('login')} className={`min-h-10 rounded-lg px-3 py-2 font-semibold transition-colors ${mode === 'login' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}>Iniciar sesión</button><button type="button" onClick={() => setMode('register')} className={`min-h-10 rounded-lg px-3 py-2 font-semibold transition-colors ${mode === 'register' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}>Registrarse</button></div>
        <form onSubmit={submit} className="mt-5 space-y-4">
          <label className="block text-sm font-semibold text-slate-700">{mode === 'register' ? 'Tipo de cuenta' : 'Entrar como'}
            <select name="role" value={role} onChange={(event) => setRole(event.target.value as UserRole)} className="mt-1.5 min-h-11 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm font-normal text-slate-800"><option value="CONTRIBUYENTE">Contribuyente o negocio</option><option value="CONTADOR_PROFESIONAL">Contador o estudio contable</option></select>
          </label>
          {mode === 'register' && <>
            <label className="block text-sm font-semibold text-slate-700">{role === 'CONTRIBUYENTE' ? 'Nombre o razón social' : 'Nombre del contador o estudio'}<input name="displayName" autoComplete="organization" required value={displayName} onChange={(event) => setDisplayName(event.target.value)} className="mt-1.5 min-h-11 w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm font-normal" placeholder={role === 'CONTRIBUYENTE' ? 'Ej.: Mi negocio' : 'Ej.: Estudio contable'} /></label>
            {role === 'CONTADOR_PROFESIONAL' && <label className="block text-sm font-semibold text-slate-700">Registro profesional (opcional)<input name="professionalLicense" value={license} onChange={(event) => setLicense(event.target.value)} className="mt-1.5 min-h-11 w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm font-normal" placeholder="Número de registro CPA" /></label>}
          </>}
          <label className="block text-sm font-semibold text-slate-700">Correo electrónico<input name="email" autoComplete="email" spellCheck={false} required type="email" value={email} onChange={(event) => setEmail(event.target.value)} className="mt-1.5 min-h-11 w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm font-normal" placeholder="nombre@correo.com" /></label>
          <label className="block text-sm font-semibold text-slate-700">Contraseña<input name="password" autoComplete={mode === 'login' ? 'current-password' : 'new-password'} required type="password" value={password} onChange={(event) => setPassword(event.target.value)} className="mt-1.5 min-h-11 w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm font-normal" placeholder="Ingresa tu contraseña" /></label>
          <button className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-blue-700 px-4 py-3 text-sm font-bold text-white shadow-sm transition-colors hover:bg-blue-800">{mode === 'login' ? <LockKeyhole className="h-4 w-4"/> : role === 'CONTRIBUYENTE' ? <Building2 className="h-4 w-4"/> : <BadgeCheck className="h-4 w-4"/>}{mode === 'login' ? 'Entrar' : 'Crear cuenta y continuar'}</button>
        </form>
        <p className="mt-4 text-xs leading-5 text-slate-500">La cuenta y contraseña son simuladas en este prototipo; no se envían ni se guardan. {role === 'CONTRIBUYENTE' && mode === 'register' ? 'Después podrás cargar el PDF del RUC y configurar el certificado.' : role === 'CONTADOR_PROFESIONAL' && mode === 'register' ? 'Después ingresarás a la cartera y al espacio profesional del contador.' : 'Elige el tipo de cuenta para entrar al espacio correspondiente.'}</p>
      </div>
    </section>
  </main>;
};
