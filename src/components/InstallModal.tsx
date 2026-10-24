import React, { useState } from 'react';
import {
  Smartphone,
  QrCode,
  Share,
  Download,
  X,
  Check,
  Copy,
  ExternalLink,
  Flame,
  ArrowRight,
} from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface InstallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InstallModal: React.FC<InstallModalProps> = ({ isOpen, onClose }) => {
  const { isInstallable, install } = usePWAInstall();
  const [copied, setCopied] = useState<boolean>(false);
  const [activeOS, setActiveOS] = useState<'android' | 'ios'>('android');

  if (!isOpen) return null;

  const currentUrl = window.location.href;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
    currentUrl
  )}&bgcolor=0f172a&color=38bdf8`;

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(currentUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-xl bg-slate-950 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-900/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-rose-500 to-sky-400 p-0.5 flex items-center justify-center shadow-lg shadow-rose-500/20">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                <Smartphone className="w-5 h-5 text-sky-400" />
              </div>
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <span>Instalar en tu Celular</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  App PWA Nativa
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Funciona sin descargar desde la Play Store o App Store
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1">
          {/* Quick Direct Install Button if browser supports it */}
          {isInstallable && (
            <div className="p-4 rounded-2xl bg-gradient-to-r from-sky-500/10 via-indigo-500/10 to-purple-500/10 border border-sky-500/30 flex items-center justify-between gap-3">
              <div>
                <h4 className="text-xs font-bold text-white">Instalación Rápida Detectada</h4>
                <p className="text-[11px] text-slate-300">
                  Tu navegador permite instalar la app con un solo clic.
                </p>
              </div>
              <button
                onClick={install}
                className="px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs shadow-md transition-all shrink-0"
              >
                Instalar Ahora
              </button>
            </div>
          )}

          {/* QR Code and URL Section */}
          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col sm:flex-row items-center gap-5">
            <div className="w-36 h-36 bg-slate-900 border border-slate-800 rounded-2xl p-2 flex items-center justify-center shadow-inner shrink-0">
              <img
                src={qrUrl}
                alt="Código QR para abrir en celular"
                className="w-full h-full object-contain rounded-xl"
              />
            </div>

            <div className="space-y-2 text-center sm:text-left flex-1">
              <span className="text-xs font-mono font-bold text-sky-400 uppercase tracking-wider block">
                Paso 1: Abrir en tu teléfono
              </span>
              <h5 className="text-sm font-bold text-white">
                Apunta con la cámara de tu celular al código QR
              </h5>
              <p className="text-xs text-slate-400 leading-relaxed">
                Escanea el código QR con tu móvil para abrir la aplicación directamente en tu navegador móvil, o copia el enlace:
              </p>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="text"
                  readOnly
                  value={currentUrl}
                  className="flex-1 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-[11px] font-mono text-slate-300 truncate select-all"
                />
                <button
                  onClick={handleCopyUrl}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 shrink-0"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Copiado</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copiar</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* OS Selector Tabs */}
          <div className="space-y-3">
            <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider block">
              Paso 2: Guardar como Aplicación
            </span>

            <div className="grid grid-cols-2 gap-2 bg-slate-900 p-1 rounded-2xl border border-slate-800">
              <button
                onClick={() => setActiveOS('android')}
                className={`py-2 text-xs font-semibold rounded-xl transition-all ${
                  activeOS === 'android'
                    ? 'bg-sky-500 text-slate-950 font-bold shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Android (Chrome)
              </button>
              <button
                onClick={() => setActiveOS('ios')}
                className={`py-2 text-xs font-semibold rounded-xl transition-all ${
                  activeOS === 'ios'
                    ? 'bg-sky-500 text-slate-950 font-bold shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                iPhone / iPad (Safari)
              </button>
            </div>

            {/* Android Instructions */}
            {activeOS === 'android' && (
              <div className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800 space-y-3 text-xs text-slate-300">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-sky-500/20 text-sky-400 font-bold font-mono flex items-center justify-center shrink-0">
                    1
                  </div>
                  <div>
                    <p className="font-semibold text-white">Abre el enlace en Google Chrome</p>
                    <p className="text-slate-400">Asegúrate de estar en Chrome para Android.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-sky-500/20 text-sky-400 font-bold font-mono flex items-center justify-center shrink-0">
                    2
                  </div>
                  <div>
                    <p className="font-semibold text-white">Toca el menú de opciones (⋮)</p>
                    <p className="text-slate-400">
                      Son los 3 puntos verticales en la esquina superior derecha del navegador.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-sky-500/20 text-sky-400 font-bold font-mono flex items-center justify-center shrink-0">
                    3
                  </div>
                  <div>
                    <p className="font-semibold text-white">
                      Selecciona &quot;Instalar aplicación&quot; o &quot;Añadir a pantalla de inicio&quot;
                    </p>
                    <p className="text-slate-400">
                      Aparecerá el icono de <strong>SwipeClean</strong> en tu pantalla de inicio junto a tus demás apps.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* iOS Instructions */}
            {activeOS === 'ios' && (
              <div className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800 space-y-3 text-xs text-slate-300">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-purple-500/20 text-purple-400 font-bold font-mono flex items-center justify-center shrink-0">
                    1
                  </div>
                  <div>
                    <p className="font-semibold text-white">Abre el enlace en Safari</p>
                    <p className="text-slate-400">En iPhone e iPad, la instalación se realiza desde Safari.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-purple-500/20 text-purple-400 font-bold font-mono flex items-center justify-center shrink-0">
                    2
                  </div>
                  <div>
                    <p className="font-semibold text-white">
                      Toca el botón Compartir <span className="inline-block px-1 bg-slate-800 rounded">⎋</span>
                    </p>
                    <p className="text-slate-400">
                      Es el icono de un cuadrado con una flecha hacia arriba en la barra inferior de Safari.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-purple-500/20 text-purple-400 font-bold font-mono flex items-center justify-center shrink-0">
                    3
                  </div>
                  <div>
                    <p className="font-semibold text-white">
                      Desliza hacia abajo y toca &quot;Añadir a la pantalla de inicio&quot;
                    </p>
                    <p className="text-slate-400">
                      Luego presiona <strong>&quot;Añadir&quot;</strong> en la esquina superior derecha.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/60 flex items-center justify-between">
          <span className="text-[11px] text-slate-400">
            Sin ocupar espacio en tu memoria de aplicaciones
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-white font-semibold transition-all"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
};
