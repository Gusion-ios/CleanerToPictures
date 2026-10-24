import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  Sparkles,
  Trash2,
  FolderCheck,
  Star,
  FileArchive,
  RefreshCw,
  HardDrive,
  Upload,
} from 'lucide-react';
import { ImageItem, Folder } from '../types';

interface SessionSummaryProps {
  allImages: ImageItem[];
  folders: Folder[];
  onOpenTrash: () => void;
  onOpenExplorer: () => void;
  onOpenUpload: () => void;
  onRestartSamples: () => void;
}

export const SessionSummary: React.FC<SessionSummaryProps> = ({
  allImages,
  folders,
  onOpenTrash,
  onOpenExplorer,
  onOpenUpload,
  onRestartSamples,
}) => {
  const deleted = allImages.filter((i) => i.isDeleted);
  const organized = allImages.filter((i) => !i.isDeleted && i.folderId);
  const favorites = allImages.filter((i) => !i.isDeleted && i.isFavorite);
  const totalSavedBytes = deleted.reduce((acc, i) => acc + i.sizeBytes, 0);

  const formatSize = (bytes: number) => {
    if (bytes >= 1000000000) return `${(bytes / 1000000000).toFixed(2)} GB`;
    if (bytes >= 1000000) return `${(bytes / 1000000).toFixed(1)} MB`;
    return `${Math.round(bytes / 1000)} KB`;
  };

  useEffect(() => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#38bdf8', '#34d399', '#f59e0b', '#ec4899'],
    });
  }, []);

  return (
    <div className="w-full max-w-xl mx-auto p-6 sm:p-8 rounded-3xl bg-slate-950 border border-slate-800 shadow-2xl text-center space-y-6">
      {/* Trophy Badge */}
      <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-sky-500 to-emerald-400 p-0.5 mx-auto shadow-xl shadow-sky-500/20 flex items-center justify-center">
        <div className="w-full h-full bg-slate-950 rounded-[22px] flex items-center justify-center">
          <Sparkles className="w-8 h-8 text-sky-400" />
        </div>
      </div>

      <div className="space-y-1">
        <h3 className="text-2xl font-extrabold text-white tracking-tight">
          ¡Lote de Fotos Limpiado con Éxito!
        </h3>
        <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto">
          Has revisado y clasificado todas las fotos de tu pila. Aquí tienes el resumen de tu sesión:
        </p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-left">
        {/* Saved Storage */}
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 col-span-2 sm:col-span-1">
          <div className="flex items-center gap-2 text-rose-400 mb-1">
            <HardDrive className="w-4 h-4" />
            <span className="text-xs font-semibold">Espacio Liberado</span>
          </div>
          <div className="text-xl font-bold font-mono text-white">
            {formatSize(totalSavedBytes)}
          </div>
          <span className="text-[10px] text-slate-400">{deleted.length} fotos a papelera</span>
        </div>

        {/* Organized */}
        <div className="p-4 rounded-2xl bg-sky-500/10 border border-sky-500/20">
          <div className="flex items-center gap-2 text-sky-400 mb-1">
            <FolderCheck className="w-4 h-4" />
            <span className="text-xs font-semibold">Organizadas</span>
          </div>
          <div className="text-xl font-bold font-mono text-white">
            {organized.length}
          </div>
          <span className="text-[10px] text-slate-400">en carpetas destino</span>
        </div>

        {/* Favorites */}
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20">
          <div className="flex items-center gap-2 text-amber-400 mb-1">
            <Star className="w-4 h-4" />
            <span className="text-xs font-semibold">Favoritas</span>
          </div>
          <div className="text-xl font-bold font-mono text-white">
            {favorites.length}
          </div>
          <span className="text-[10px] text-slate-400">destacadas</span>
        </div>
      </div>

      {/* Primary Actions */}
      <div className="pt-2 space-y-2.5">
        <button
          onClick={onOpenExplorer}
          className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-gradient-to-r from-sky-500 to-indigo-500 hover:from-sky-400 hover:to-indigo-400 text-slate-950 font-bold text-xs sm:text-sm shadow-xl shadow-sky-500/20 transition-all active:scale-95"
        >
          <FileArchive className="w-4 h-4" />
          <span>Ver Carpetas y Descargar ZIP</span>
        </button>

        <div className="grid grid-cols-2 gap-2.5">
          <button
            onClick={onOpenTrash}
            className="flex items-center justify-center gap-2 py-3 rounded-2xl bg-slate-900 hover:bg-slate-850 text-slate-200 border border-slate-800 text-xs font-semibold transition-all"
          >
            <Trash2 className="w-4 h-4 text-rose-400" />
            <span>Revisar Papelera</span>
          </button>

          <button
            onClick={onOpenUpload}
            className="flex items-center justify-center gap-2 py-3 rounded-2xl bg-slate-900 hover:bg-slate-850 text-slate-200 border border-slate-800 text-xs font-semibold transition-all"
          >
            <Upload className="w-4 h-4 text-sky-400" />
            <span>Cargar Más Fotos</span>
          </button>
        </div>

        <button
          onClick={onRestartSamples}
          className="text-xs text-slate-500 hover:text-slate-300 font-mono transition-colors pt-2 block mx-auto"
        >
          Reiniciar fotos de prueba
        </button>
      </div>
    </div>
  );
};
