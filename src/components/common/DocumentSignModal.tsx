import React, { useState } from 'react';
import { VaultDocument } from '../../types';
import { useApp } from '../../context/AppContext';
import { X, KeyRound, ShieldCheck, FileText, CheckCircle2, QrCode, Lock, Loader2 } from 'lucide-react';

interface DocumentSignModalProps {
  document: VaultDocument;
  onClose: () => void;
}

export const DocumentSignModal: React.FC<DocumentSignModalProps> = ({ document, onClose }) => {
  const { profile, signDocument, isSigning } = useApp();
  const [password, setPassword] = useState('1234');
  const [showStamp, setShowStamp] = useState(document.estadoFirma === 'FIRMADO');
  const [signedHash, setSignedHash] = useState(document.hashFirma || '');
  const [signedDate, setSignedDate] = useState(document.fechaFirma || '');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) {
      setErrorMsg('Ingrese la contraseña de su firma digital (.pfx)');
      return;
    }
    setErrorMsg('');
    const result = await signDocument(document.id, password);
    if (result.success) {
      setShowStamp(true);
      setSignedHash(result.hash);
      setSignedDate(new Date().toISOString().replace('T', ' ').slice(0, 19));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/75 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden my-6 max-h-[94vh] flex flex-col">
        {/* Modal Topbar */}
        <div className="flex items-center justify-between px-6 py-3.5 bg-slate-900 text-white shrink-0">
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-5 h-5 text-blue-400" />
            <div>
              <span className="text-sm font-semibold tracking-wide">BÓVEDA · MÓDULO DE FIRMA ELECTRÓNICA</span>
              <p className="text-[11px] text-slate-400 font-mono">{document.nombre}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Cerrar modal de firma"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Main Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-12 flex-1 overflow-hidden">
          {/* Left / Center: PDF Document Viewer Page */}
          <div className="lg:col-span-8 p-6 bg-slate-100 overflow-y-auto flex flex-col items-center justify-start border-r border-slate-200">
            <div className="w-full max-w-lg bg-white shadow-md border border-slate-300 rounded-sm p-8 text-slate-800 text-xs min-h-[520px] relative flex flex-col justify-between">
              <div>
                {/* Header of the simulated document */}
                <div className="border-b border-slate-200 pb-4 mb-4 flex items-start justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500">Documento Oficial</span>
                    <h3 className="font-bold text-sm text-slate-900">{document.nombre}</h3>
                    <p className="text-[11px] text-slate-500">Emisor: {profile.razonSocial}</p>
                    <p className="text-[10px] text-slate-400">RUC: {profile.ruc}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 font-mono block">REF: {document.id}</span>
                    <span className="text-[10px] text-slate-500">Fecha: {document.fechaSubida}</span>
                  </div>
                </div>

                {/* Simulated Legal / Financial Body */}
                <div className="space-y-3 text-slate-700 leading-relaxed text-[11px]">
                  <p>
                    <strong>DESCRIPCIÓN DEL ARCHIVO:</strong> {document.descripcion}
                  </p>
                  <p>
                    Vista previa de prueba. Este prototipo no crea una firma con validez legal, no contacta al SRI ni altera el archivo original.
                  </p>
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-sm space-y-1 text-[10px] text-slate-600">
                    <p>• Formato de archivo original: <strong>{document.formato}</strong> ({document.tamanoMb} MB)</p>
                    <p>• Entidad Certificadora: <strong>{profile.signatureCertIssuer}</strong></p>
                    <p>• El emisor y estado mostrados son datos ilustrativos, sin validación criptográfica.</p>
                  </div>
                </div>
              </div>

              {/* Document Signature Stamp Box */}
              <div className="mt-8 pt-4 border-t border-slate-200">
                {showStamp ? (
                  <div className="relative p-3.5 border-2 border-emerald-500 bg-emerald-50/70 rounded-md text-emerald-900 transition-all duration-300">
                    <div className="flex items-start gap-3">
                      <div className="p-1.5 bg-emerald-600 text-white rounded-md shrink-0">
                        <CheckCircle2 className="w-5 h-5" />
                      </div>
                      <div className="flex-1 text-[10px] leading-tight space-y-0.5">
                        <span className="font-bold text-emerald-800 text-xs block">
                          FIRMA SIMULADA · CONT MARJO 360
                        </span>
                        <p><strong className="text-emerald-950">Firmante:</strong> {profile.razonSocial}</p>
                        <p><strong className="text-emerald-950">RUC:</strong> {profile.ruc}</p>
                        <p><strong className="text-emerald-950">Fecha/Hora:</strong> {signedDate || '2026-10-06 17:30:15'}</p>
                        <p className="font-mono text-[9px] text-emerald-700 break-all pt-0.5">
                          <strong>HASH:</strong> {signedHash || 'sha256:7c9e12f38d4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c'}
                        </p>
                      </div>
                      <QrCode className="w-12 h-12 text-emerald-800 shrink-0 self-center opacity-85" />
                    </div>
                    {/* Visual Gold Security Ribbon */}
                    <div className="absolute top-2 right-2 text-[9px] uppercase tracking-wider font-semibold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded-xs">
                      Estado ilustrativo
                    </div>
                  </div>
                ) : (
                  <div className="p-4 border-2 border-dashed border-amber-300 bg-amber-50/50 rounded-md text-center text-[11px] text-amber-800">
                    <Lock className="w-4 h-4 mx-auto mb-1 text-amber-600" />
                    <span>Este documento aún no tiene el estado simulado de firma. No introduzcas una contraseña real.</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Sidebar: Certificate Status & Cryptographic Action Form */}
          <div className="lg:col-span-4 p-6 bg-white flex flex-col justify-between overflow-y-auto space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <KeyRound className="w-4 h-4 text-blue-600" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">Certificado Digital (.PFX)</h4>
              </div>

              {/* Certificate Widget */}
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 text-[11px]">Estado Firma:</span>
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" /> Estado de demostración
                  </span>
                </div>
                <div className="text-[11px] text-slate-600">
                  <p><strong>Emisor:</strong> {profile.signatureCertIssuer}</p>
                  <p><strong>Caducidad:</strong> {profile.signatureCertExpiryDate} ({profile.signatureExpiryDays} días restantes)</p>
                  <p><strong>Titular:</strong> {profile.razonSocial}</p>
                </div>
              </div>

              {/* Signature Action Section */}
              <div className="mt-6">
                {showStamp ? (
                  <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 space-y-2 text-xs">
                    <div className="flex items-center gap-2 font-semibold text-emerald-900">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Documento Sellado
                    </div>
                    <p className="text-[11px]">
                      El estado se actualizó solo en la interfaz; el hash es aleatorio y no representa una firma real.
                    </p>
                    <button
                      onClick={() => alert(`Descargando copia legal firmada: ${document.nombre}`)}
                      className="w-full mt-2 py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-medium transition-colors cursor-pointer"
                    >
                      Descargar Copia Firmada
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSign} className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Clave de ejemplo (no uses una real)
                      </label>
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono"
                      />
                      <span className="text-[11px] text-slate-400 mt-1 block">
                        No se valida ni se guarda esta clave en la demostración.
                      </span>
                      {errorMsg && <p className="text-xs text-red-600 mt-1">{errorMsg}</p>}
                    </div>

                    <div className="p-3 bg-blue-50/60 border border-blue-200 rounded-lg text-[11px] text-blue-800 leading-tight">
                      Al pulsar el botón, solo cambia la etiqueta visual de este documento.
                    </div>

                    <button
                      type="submit"
                      disabled={isSigning}
                      className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      {isSigning ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Actualizando estado de demostración...</span>
                        </>
                      ) : (
                        <>
                          <ShieldCheck className="w-4 h-4" />
                          <span>Firmar Documento Ahora</span>
                        </>
                      )}
                    </button>
                  </form>
                )}
              </div>
            </div>

            {/* Document stats */}
            <div className="pt-4 border-t border-slate-200 text-[11px] text-slate-400 flex justify-between">
              <span>Bóveda CONT MARJO</span>
              <span>Protección AES-256</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
