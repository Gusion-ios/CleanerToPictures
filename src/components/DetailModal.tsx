import React, { useState } from 'react';
import { ImageItem, Folder } from '../types';
import {
  X,
  ZoomIn,
  ZoomOut,
  Star,
  Trash2,
  FolderInput,
  Info,
  Calendar,
  HardDrive,
  Maximize2,
} from 'lucide-react';

interface DetailModalProps {
  image: ImageItem | null;
  allFolders: Folder[];
  onClose: () => void;
  onMoveToFolder: (imageId: string, folderId: string) => void;
  onTrash: (imageId: string) => void;
  onToggleFavorite: (imageId: string) => void;
}

export const DetailModal: React.FC<DetailModalProps> = ({
  image,
  allFolders,
  onClose,
  onMoveToFolder,
  onTrash,
  onToggleFavorite,
}) => {
  const [zoomLevel, setZoomLevel] = useState<number>(1);

  if (!image) return null;

  const currentFolder = allFolders.find((f) => f.id === image.folderId);

  const formatSize = (bytes: number) => {
    if (bytes >= 1000000) return `${(bytes / 1000000).toFixed(2)} MB`;
    return `${Math.round(bytes / 1000)} KB`;
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-5xl h-[88vh] bg-slate-950 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row">
        {/* Left: Interactive Zoomable Image Stage */}
        <div className="flex-1 relative bg-black flex items-center justify-center overflow-hidden p-4">
          <img
            src={image.url}
            alt={image.name}
            style={{ transform: `scale(${zoomLevel})` }}
            className="max-w-full max-h-full object-contain transition-transform duration-200 select-none"
          />

          {/* Zoom floating controls */}
          <div className="absolute bottom-4 left-4 flex items-center gap-1.5 p-1.5 rounded-2xl bg-slate-900/80 backdrop-blur-md border border-slate-800">
            <button
              onClick={() => setZoomLevel((z) => Math.max(0.5, z - 0.25))}
              className="p-2 rounded-xl hover:bg-slate-800 text-slate-300"
              title="Alejar"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="text-xs font-mono px-2 text-slate-400">
              {Math.round(zoomLevel * 100)}%
            </span>
            <button
              onClick={() => setZoomLevel((z) => Math.min(3, z + 0.25))}
              className="p-2 rounded-xl hover:bg-slate-800 text-slate-300"
              title="Acercar"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              onClick={() => setZoomLevel(1)}
              className="px-2 py-1 text-xs rounded-xl hover:bg-slate-800 text-slate-400"
            >
              Reset
            </button>
          </div>
        </div>

        {/* Right: Metadata & Actions Sidebar */}
        <div className="w-full md:w-80 bg-slate-900/90 border-t md:border-t-0 md:border-l border-slate-800 p-6 flex flex-col justify-between">
          <div className="space-y-6">
            {/* Top Close */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">
                Detalles de Imagen
              </span>
              <button
                onClick={onClose}
                className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <h4 className="text-base font-bold text-white break-words mb-2">
                {image.name}
              </h4>
              <div className="flex items-center gap-2">
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-800 font-mono text-slate-300">
                  {formatSize(image.sizeBytes)}
                </span>
                {image.isFavorite && (
                  <span className="flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                    <Star className="w-3 h-3 fill-current" />
                    <span>Favorita</span>
                  </span>
                )}
              </div>
            </div>

            {/* EXIF / Info list */}
            <div className="space-y-3 pt-4 border-t border-slate-800 text-xs">
              <div className="flex items-center justify-between text-slate-400">
                <span className="flex items-center gap-1.5">
                  <HardDrive className="w-4 h-4 text-sky-400" />
                  <span>Tamaño:</span>
                </span>
                <span className="font-mono text-slate-200">{formatSize(image.sizeBytes)}</span>
              </div>

              <div className="flex items-center justify-between text-slate-400">
                <span className="flex items-center gap-1.5">
                  <Maximize2 className="w-4 h-4 text-purple-400" />
                  <span>Resolución:</span>
                </span>
                <span className="font-mono text-slate-200">
                  {image.width ? `${image.width} × ${image.height} px` : 'Ultra HD'}
                </span>
              </div>

              <div className="flex items-center justify-between text-slate-400">
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-emerald-400" />
                  <span>Fecha:</span>
                </span>
                <span className="font-mono text-slate-200">{image.date}</span>
              </div>

              <div className="flex items-center justify-between text-slate-400">
                <span className="flex items-center gap-1.5">
                  <FolderInput className="w-4 h-4 text-indigo-400" />
                  <span>Carpeta:</span>
                </span>
                <span className="font-semibold text-white">
                  {currentFolder ? currentFolder.name : 'Sin clasificar'}
                </span>
              </div>
            </div>

            {/* Destination folder picker */}
            <div className="pt-4 border-t border-slate-800 space-y-2">
              <label className="text-xs text-slate-400 block font-medium">Mover a otra carpeta:</label>
              <select
                value={image.folderId || ''}
                onChange={(e) => onMoveToFolder(image.id, e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-sky-400"
              >
                <option value="" disabled>Seleccionar carpeta...</option>
                {allFolders.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Action buttons */}
          <div className="pt-4 border-t border-slate-800 space-y-2">
            <button
              onClick={() => {
                onToggleFavorite(image.id);
              }}
              className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border text-xs font-semibold transition-all ${
                image.isFavorite
                  ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
              }`}
            >
              <Star className={`w-4 h-4 ${image.isFavorite ? 'fill-current' : ''}`} />
              <span>{image.isFavorite ? 'Quitar de Favoritas' : 'Marcar como Favorita'}</span>
            </button>

            <button
              onClick={() => {
                onTrash(image.id);
                onClose();
              }}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 text-xs font-bold transition-all"
            >
              <Trash2 className="w-4 h-4" />
              <span>Enviar a Papelera</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
