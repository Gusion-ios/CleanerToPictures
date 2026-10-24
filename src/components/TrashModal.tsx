import React from 'react';
import { ImageItem } from '../types';
import {
  Trash2,
  RotateCcw,
  AlertTriangle,
  HardDrive,
  X,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';

interface TrashModalProps {
  isOpen: boolean;
  onClose: () => void;
  deletedImages: ImageItem[];
  onRestoreImage: (id: string) => void;
  onRestoreAll: () => void;
  onEmptyTrash: () => void;
}

export const TrashModal: React.FC<TrashModalProps> = ({
  isOpen,
  onClose,
  deletedImages,
  onRestoreImage,
  onRestoreAll,
  onEmptyTrash,
}) => {
  if (!isOpen) return null;

  const totalBytes = deletedImages.reduce((sum, img) => sum + img.sizeBytes, 0);

  const formatSize = (bytes: number) => {
    if (bytes >= 1000000000) return `${(bytes / 1000000000).toFixed(2)} GB`;
    if (bytes >= 1000000) return `${(bytes / 1000000).toFixed(1)} MB`;
    return `${Math.round(bytes / 1000)} KB`;
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-3xl bg-slate-950 border border-slate-800 rounded-3xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-900/60">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <span>Papelera de Reciclaje</span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono">
                  {deletedImages.length} fotos
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Revisa las imágenes descartadas antes del vaciado permanente
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Saved Storage Banner */}
        <div className="p-4 bg-gradient-to-r from-rose-950/40 via-slate-900 to-slate-950 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 px-6">
          <div className="flex items-center gap-3">
            <HardDrive className="w-5 h-5 text-rose-400" />
            <div>
              <span className="text-xs text-slate-400 block font-medium">Espacio Total Liberado:</span>
              <span className="text-xl font-mono font-extrabold text-white">
                {formatSize(totalBytes)}
              </span>
            </div>
          </div>

          {deletedImages.length > 0 && (
            <div className="flex items-center gap-2">
              <button
                onClick={onRestoreAll}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-all"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Restaurar Todo</span>
              </button>

              <button
                onClick={onEmptyTrash}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-all shadow-lg shadow-rose-950/50"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Vaciar Definitivamente</span>
              </button>
            </div>
          )}
        </div>

        {/* Image Grid List */}
        <div className="flex-1 overflow-y-auto p-5">
          {deletedImages.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center text-slate-500">
              <div className="p-4 rounded-full bg-slate-900 border border-slate-800 mb-3">
                <CheckCircle2 className="w-8 h-8 text-emerald-400" />
              </div>
              <h4 className="text-base font-semibold text-white mb-1">La papelera está limpia</h4>
              <p className="text-xs max-w-sm text-slate-400">
                A medida que deslices fotos hacia la izquierda, aparecerán aquí para que puedas
                recuperarlas o liberar espacio permanentemente.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {deletedImages.map((img) => (
                <div
                  key={img.id}
                  className="group relative rounded-2xl overflow-hidden bg-slate-900 border border-slate-800 aspect-square shadow-md"
                >
                  <img
                    src={img.url}
                    alt={img.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-80 group-hover:opacity-100"
                  />

                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-black/30 pointer-events-none" />

                  {/* Badge Size */}
                  <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-md text-[10px] font-mono text-white">
                    {formatSize(img.sizeBytes)}
                  </div>

                  {/* Restore Button */}
                  <div className="absolute bottom-2 inset-x-2 flex items-center justify-between gap-1">
                    <span className="text-[11px] text-white font-medium truncate drop-shadow-md">
                      {img.name}
                    </span>
                    <button
                      onClick={() => onRestoreImage(img.id)}
                      className="p-1.5 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 shrink-0 shadow-md transition-transform active:scale-90"
                      title="Restaurar a la galería"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
