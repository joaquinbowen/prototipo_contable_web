import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  UploadCloud,
  FileText,
  CheckCircle2,
  Loader2,
  Building2,
  MapPin,
  Calendar,
  Sparkles,
  ShieldCheck,
  QrCode,
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
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-sm">
        <div className="flex items-center gap-2 text-xs text-blue-600 font-semibold mb-1">
          <Sparkles className="w-4 h-4" />
          <span>PERFIL · CONFIGURACIÓN TRIBUTARIA</span>
        </div>
        <h1 className="text-2xl md:text-[28px] font-bold text-slate-900 tracking-tight">
          Cargar RUC y revisar datos
        </h1>
        <p className="text-xs text-slate-500 mt-1 max-w-3xl">
          En la simulación, la carga representa una lectura OCR que propone datos para el perfil. Revísalos antes de continuar; no se consulta ni valida el RUC en el SRI.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Drag & Drop Dropzone */}
        <div className="lg:col-span-5 space-y-4">
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 relative bg-white flex flex-col items-center justify-center min-h-[320px] ${
              dragOver
                ? 'border-blue-500 bg-blue-50/50 scale-[1.01]'
                : 'border-slate-300 hover:border-blue-400'
            }`}
          >
            <input
              type="file"
              accept=".pdf,.png,.jpg"
              onChange={handleFileUpload}
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              disabled={isParsingRuc}
            />

            <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4 shadow-xs">
              {isParsingRuc ? (
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
              ) : (
                <UploadCloud className="w-8 h-8" />
              )}
            </div>

            <h3 className="text-sm font-bold text-slate-800 mb-1">
              {isParsingRuc ? 'Procesando Documento RUC...' : 'Arrastra tu RUC en PDF aquí'}
            </h3>
            <p className="text-xs text-slate-500 max-w-xs mb-4">
              Selecciona un archivo para simular el flujo. El prototipo solo utiliza su nombre, no lo analiza.
            </p>

            <button
              type="button"
              onClick={handleTriggerDemo}
              disabled={isParsingRuc}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer disabled:opacity-50"
            >
              Cargar RUC de Prueba (Simular OCR)
            </button>

            {selectedFileName && (
              <div className="mt-4 flex items-center gap-2 text-[11px] text-slate-600 font-mono bg-slate-100 px-3 py-1.5 rounded-md">
                <FileText className="w-3.5 h-3.5 text-blue-600" />
                <span className="truncate max-w-[200px]">{selectedFileName}</span>
              </div>
            )}
          </div>

          {/* OCR Progress Stepper Visualizer */}
          {isParsingRuc && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl space-y-3">
              <div className="flex items-center justify-between text-xs font-semibold text-blue-900">
                <span className="flex items-center gap-2">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-blue-600" />
                  Extracción OCR en curso
                </span>
                <span>Procesando...</span>
              </div>
              <p className="text-[11px] text-blue-700 font-mono">{ocrProgressStep}</p>
              <div className="w-full bg-blue-200 rounded-full h-2 overflow-hidden">
                <div className="bg-blue-600 h-full rounded-full animate-pulse w-3/4" />
              </div>
            </div>
          )}

          {/* Guidelines Box */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-2 text-slate-600">
            <h4 className="font-bold text-slate-800 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Nota sobre la demostración
            </h4>
            <p className="text-[11px] leading-relaxed">
              Los campos se completan con datos de ejemplo. No se valida firma, QR, estado del RUC ni obligaciones reales.
            </p>
          </div>
        </div>

        {/* Right Column: Taxpayer Profile Card (Extracted Data) */}
        <div className="lg:col-span-7 bg-white p-6 rounded-xl border border-slate-200 space-y-6">
          <div className="flex items-start justify-between pb-4 border-b border-slate-200">
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
            <QrCode className="w-10 h-10 text-slate-400 hidden sm:block" />
          </div>

          {/* Form / Extracted Fields Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
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
            <div className="sm:col-span-2 p-3 bg-slate-50 border border-slate-200 rounded-lg">
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                Razón Social / Nombre Comercial
              </span>
              <p className="font-semibold text-slate-900">{profile.razonSocial}</p>
              <p className="text-[11px] text-slate-500">{profile.nombreComercial}</p>
            </div>

            {/* Field: Actividades Económicas */}
            <div className="sm:col-span-2 p-3 bg-slate-50 border border-slate-200 rounded-lg">
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                Actividades Económicas Registradas
              </span>
              <p className="text-slate-800 leading-snug">{profile.actividadEconomica}</p>
            </div>

            {/* Field: Matriz */}
            <div className="sm:col-span-2 p-3 bg-slate-50 border border-slate-200 rounded-lg">
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-500" />
                Establecimiento Matriz (001)
              </span>
              <p className="text-slate-800">{profile.direccion}</p>
            </div>
          </div>

          {/* Obligations Box */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-2 text-xs">
            <h4 className="font-bold text-slate-800 flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-blue-600" />
              Obligaciones Tributarias Detectadas
            </h4>
            <div className="space-y-1.5 text-[11px] text-slate-700">
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
        </div>
      </div>
    </div>
  );
};
