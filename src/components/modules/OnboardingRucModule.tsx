import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  UploadCloud,
  Upload,
  FileText,
  CheckCircle2,
  Loader2,
  Building2,
  MapPin,
  Calendar,
  Sparkles,
  ShieldCheck,
  RefreshCw
} from 'lucide-react';

export const OnboardingRucModule: React.FC = () => {
  const { profile, updateProfile, simulateRucOcrUpload, isParsingRuc, ocrProgressStep } = useApp();
  const [dragOver, setDragOver] = useState(false);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFileName(file.name);
      simulateRucOcrUpload(file.name);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      setSelectedFileName(file.name);
      simulateRucOcrUpload(file.name);
    } else {
      setSelectedFileName('RUC_Oficial_Descargado.pdf');
      simulateRucOcrUpload('RUC_Oficial_Descargado.pdf');
    }
  };

  const handleTriggerDemo = () => {
    setSelectedFileName('Certificado_RUC_1792847592001.pdf');
    simulateRucOcrUpload('Certificado_RUC_1792847592001.pdf');
  };

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex flex-wrap items-center gap-3 rounded-xl border border-blue-100 bg-white px-4 py-2 shadow-sm">
        <div className="flex items-center gap-2 text-xs text-blue-600 font-semibold mb-1">
          <Sparkles className="w-4 h-4" />
          <span>PERFIL · CONFIGURACIÓN TRIBUTARIA</span>
        </div>
        <h2 className="text-base font-bold text-slate-900">Datos tributarios</h2>
        <p className="text-xs text-slate-500">Revisa los datos de ejemplo; la lectura del RUC es simulada.</p>
      </div>

      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        className={`bg-white p-4 sm:p-5 rounded-xl border border-slate-200 space-y-3 transition-colors ${dragOver ? 'border-blue-500 bg-blue-50/40' : ''}`}
      >
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-200">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-lg">
                SRI
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-sm">
                    Datos de ejemplo detectados
                  </span>
                  <span className="text-xs text-slate-400">Revisa y confirma la información</span>
                </div>
                <h2 className="text-lg font-bold text-slate-900 mt-0.5">{profile.razonSocial}</h2>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2 sm:justify-end">
              {selectedFileName && <span className="hidden max-w-48 items-center gap-1.5 truncate text-xs text-slate-500 sm:inline-flex"><FileText className="h-4 w-4 shrink-0 text-blue-600" />{selectedFileName}</span>}
              <label className="relative inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-800 transition hover:bg-blue-100">
                {isParsingRuc ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                {isParsingRuc ? 'Leyendo RUC…' : 'Subir RUC'}
                <input type="file" accept=".pdf,.png,.jpg" onChange={handleFileUpload} disabled={isParsingRuc} className="absolute inset-0 cursor-pointer opacity-0" />
              </label>
              <button type="button" onClick={handleTriggerDemo} disabled={isParsingRuc} className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-blue-700 px-3 py-2 text-xs font-semibold text-white transition hover:bg-blue-800 disabled:opacity-50">
                <UploadCloud className="h-4 w-4" /> Usar RUC de prueba
              </button>
            </div>
          </div>

          {isParsingRuc && <div className="flex flex-wrap items-center gap-x-3 gap-y-1 rounded-lg border border-blue-100 bg-blue-50 px-3 py-2 text-xs text-blue-800"><RefreshCw className="h-3.5 w-3.5 animate-spin text-blue-600" /><strong>Extracción OCR en curso</strong><span>{ocrProgressStep}</span></div>}

          {/* Form / Extracted Fields Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-2 text-xs">
            {/* Field: RUC */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                Número de RUC (13 Dígitos)
              </span>
              <p className="font-mono font-bold text-sm text-slate-900">{profile.ruc}</p>
              <span className="text-[10px] text-slate-500 mt-1 block">9no Dígito: <strong>9</strong> (Vence día 26)</span>
            </div>

            {/* Field: Régimen */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                Régimen Tributario Aplicable
              </span>
              <p className="font-semibold text-slate-900 text-sm text-blue-700">{profile.regimen}</p>
              <span className="text-[10px] text-slate-500 mt-1 block">Tarifa Impositiva Especial PyME</span>
            </div>

            {/* Field: Razón Social */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                Razón Social / Nombre Comercial
              </span>
              <p className="font-semibold text-slate-900">{profile.razonSocial}</p>
              <p className="text-[11px] text-slate-500">{profile.nombreComercial}</p>
            </div>

            {/* Field: Actividades Económicas */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                Actividades Económicas Registradas
              </span>
              <p className="text-slate-800 leading-snug">{profile.actividadEconomica}</p>
            </div>

            {/* Field: Matriz */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-500" />
                Establecimiento Matriz (001)
              </span>
              <p className="text-slate-800">{profile.direccion}</p>
            </div>
          </div>

          {/* Obligations Box */}
          <div className="rounded-lg border border-blue-100 bg-blue-50/50 p-3 text-xs">
            <h4 className="font-bold text-slate-800 flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-blue-600" />
              Obligaciones Tributarias Detectadas
            </h4>
            <div className="mt-2 grid gap-2 text-[11px] text-slate-700 md:grid-cols-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span><strong>Declaración Semestral de IVA:</strong> Formulario 104A (Julio y Enero)</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span><strong>Impuesto a la Renta Anual:</strong> Régimen RIMPE (Marzo / Abril)</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span><strong>Facturación Electrónica Obligatoria:</strong> Emisión de comprobantes autorizados</span>
              </div>
            </div>
          </div>
          <p className="flex items-start gap-1.5 text-[11px] leading-relaxed text-slate-500"><ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600" />Demostración: los datos se completan con ejemplos; no se valida firma, QR, estado del RUC ni obligaciones reales.</p>
      </div>
    </div>
  );
};
