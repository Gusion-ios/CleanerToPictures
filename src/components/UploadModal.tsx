import React, { useRef, useState } from 'react';
import { ImageItem } from '../types';
import { Upload, X, Image as ImageIcon, Sparkles, Check } from 'lucide-react';
import { INITIAL_IMAGES } from '../data/sampleImages';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddImages: (images: ImageItem[]) => void;
}

export const UploadModal: React.FC<UploadModalProps> = ({
  isOpen,
  onClose,
  onAddImages,
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [previewFiles, setPreviewFiles] = useState<ImageItem[]>([]);

  if (!isOpen) return null;

  const handleFiles = (files: FileList | File[]) => {
    const newItems: ImageItem[] = [];

    Array.from(files).forEach((file) => {
      if (!file.type.startsWith('image/')) return;
      const url = URL.createObjectURL(file);
      newItems.push({
        id: `user-img-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        name: file.name,
        url,
        sizeBytes: file.size,
        date: new Date(file.lastModified).toISOString().slice(0, 16).replace('T', ' '),
        isDeleted: false,
        isFavorite: false,
      });
    });

    setPreviewFiles((prev) => [...prev, ...newItems]);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleConfirmAdd = () => {
    if (previewFiles.length === 0) return;
    onAddImages(previewFiles);
    setPreviewFiles([]);
    onClose();
  };

  const handleAddSampleBatch = () => {
    // Clone fresh sample images with new IDs
    const freshSamples = INITIAL_IMAGES.map((img) => ({
      ...img,
      id: `sample-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      isDeleted: false,
      folderId: undefined,
    }));
    onAddImages(freshSamples);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-slate-950 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-900/60">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-sky-500/10 border border-sky-500/20 text-sky-400">
              <Upload className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white">Cargar Fotos para Limpiar</h3>
              <p className="text-xs text-slate-400">
                Sube imágenes de tu dispositivo para clasificarlas rápidamente con gestos
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
        <div className="p-6 space-y-5 overflow-y-auto flex-1">
          {/* Dropzone */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`p-8 rounded-3xl border-2 border-dashed transition-all cursor-pointer flex flex-col items-center justify-center text-center ${
              isDragging
                ? 'border-sky-400 bg-sky-500/10 scale-[0.99]'
                : 'border-slate-800 hover:border-slate-600 bg-slate-900/40 hover:bg-slate-900/60'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              className="hidden"
              onChange={(e) => e.target.files && handleFiles(e.target.files)}
            />

            <div className="p-4 rounded-2xl bg-slate-800/80 text-sky-400 mb-3 shadow-inner">
              <ImageIcon className="w-8 h-8" />
            </div>

            <h4 className="text-sm font-bold text-white mb-1">
              Arrastra y suelta tus fotos aquí o haz clic para explorar
            </h4>
            <p className="text-xs text-slate-400 max-w-sm mb-3">
              Admite JPG, PNG, WEBP, GIF, HEIC y capturas de pantalla de tu ordenador o teléfono móvil.
            </p>
            <span className="text-[11px] font-mono text-sky-400 font-semibold bg-sky-500/10 px-3 py-1 rounded-full border border-sky-500/20">
              Seleccionar Archivos
            </span>
          </div>

          {/* Preset Samples Option */}
          <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
              <div>
                <h5 className="text-xs font-bold text-white">¿Quieres probar sin subir fotos?</h5>
                <p className="text-[11px] text-slate-400">
                  Carga un lote de prueba de 10 imágenes (paisajes, capturas, comida y fotos borrosas).
                </p>
              </div>
            </div>

            <button
              onClick={handleAddSampleBatch}
              className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 font-semibold border border-slate-700 transition-all shrink-0"
            >
              Cargar Muestras
            </button>
          </div>

          {/* Staged files preview */}
          {previewFiles.length > 0 && (
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs font-mono text-slate-400">
                <span>Fotos Seleccionadas ({previewFiles.length})</span>
                <button
                  onClick={() => setPreviewFiles([])}
                  className="text-rose-400 hover:underline"
                >
                  Limpiar lista
                </button>
              </div>

              <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 max-h-36 overflow-y-auto p-1">
                {previewFiles.map((img) => (
                  <div
                    key={img.id}
                    className="relative aspect-square rounded-xl overflow-hidden bg-slate-900 border border-slate-800"
                  >
                    <img src={img.url} alt={img.name} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/60 flex items-center justify-between">
          <span className="text-xs text-slate-400 font-mono">
            {previewFiles.length} fotos listas
          </span>

          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 font-medium"
            >
              Cancelar
            </button>
            <button
              onClick={handleConfirmAdd}
              disabled={previewFiles.length === 0}
              className="px-5 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 disabled:opacity-40 text-slate-950 font-bold text-xs shadow-md transition-all"
            >
              Comenzar a Deslizar ({previewFiles.length})
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
