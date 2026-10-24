import React, { useState } from 'react';
import { Folder, ImageItem } from '../types';
import JSZip from 'jszip';
import {
  Folder as FolderIcon,
  FolderPlus,
  Download,
  Trash2,
  Check,
  Star,
  ExternalLink,
  Layers,
  ArrowRight,
  Loader2,
  FileArchive,
} from 'lucide-react';

interface FoldersExplorerProps {
  folders: Folder[];
  images: ImageItem[];
  defaultFolderId: string;
  onSetDefaultFolder: (id: string) => void;
  onCreateFolder: (name: string, color: string) => Folder;
  onDeleteFolder: (id: string) => void;
  onOpenDetail: (image: ImageItem) => void;
}

export const FoldersExplorer: React.FC<FoldersExplorerProps> = ({
  folders,
  images,
  defaultFolderId,
  onSetDefaultFolder,
  onCreateFolder,
  onDeleteFolder,
  onOpenDetail,
}) => {
  const [selectedFolderId, setSelectedFolderId] = useState<string>(defaultFolderId || folders[0]?.id);
  const [isCreating, setIsCreating] = useState<boolean>(false);
  const [newFolderName, setNewFolderName] = useState<string>('');
  const [newFolderColor, setNewFolderColor] = useState<string>('#06b6d4');
  const [isZipping, setIsZipping] = useState<boolean>(false);
  const [zipProgress, setZipProgress] = useState<string>('');

  const currentFolder = folders.find((f) => f.id === selectedFolderId) || folders[0];
  const folderImages = images.filter((img) => !img.isDeleted && img.folderId === currentFolder?.id);

  const colors = ['#06b6d4', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#f43f5e'];

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;
    const created = onCreateFolder(newFolderName.trim(), newFolderColor);
    setSelectedFolderId(created.id);
    setNewFolderName('');
    setIsCreating(false);
  };

  // Download all organized folders as a real ZIP file using JSZip
  const handleDownloadZip = async () => {
    try {
      setIsZipping(true);
      setZipProgress('Iniciando empaquetado ZIP...');

      const zip = new JSZip();
      const classifiedImages = images.filter((img) => !img.isDeleted && img.folderId);

      if (classifiedImages.length === 0) {
        alert('No hay imágenes organizadas en carpetas para descargar todavía. ¡Desliza algunas hacia la derecha primero!');
        setIsZipping(false);
        return;
      }

      // Group images by folder name
      for (let i = 0; i < classifiedImages.length; i++) {
        const img = classifiedImages[i];
        const folder = folders.find((f) => f.id === img.folderId);
        const folderName = folder ? folder.name.replace(/[^a-zA-Z0-9_\-áéíóúÁÉÍÓÚ ]/g, '_') : 'General';

        setZipProgress(`Descargando y empaquetando (${i + 1}/${classifiedImages.length}): ${img.name}`);

        try {
          // Fetch image blob
          const response = await fetch(img.url);
          const blob = await response.blob();
          // Add into zip subfolder
          zip.folder(folderName)?.file(img.name, blob);
        } catch {
          // Fallback text reference if CORS blocks external image binary
          zip.folder(folderName)?.file(`${img.name}.url.txt`, `URL: ${img.url}\nFecha: ${img.date}`);
        }
      }

      setZipProgress('Comprimiendo archivo ZIP final...');
      const content = await zip.generateAsync({ type: 'blob' });

      // Trigger browser download
      const downloadUrl = URL.createObjectURL(content);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `galeria_organizada_${new Date().toISOString().slice(0, 10)}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(downloadUrl);

      setIsZipping(false);
      setZipProgress('');
    } catch (err: any) {
      console.error('ZIP error:', err);
      setIsZipping(false);
      alert('Ocurrió un error al generar el archivo ZIP.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner with ZIP Export */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-5 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-sky-500/10 border border-sky-500/20 text-sky-400">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Explorador de Carpetas Clasificadas</h3>
            <p className="text-xs text-slate-400">
              Gestiona tus carpetas de destino y exporta tu colección en un archivo ZIP estructurado.
            </p>
          </div>
        </div>

        <button
          onClick={handleDownloadZip}
          disabled={isZipping}
          className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-sky-500 to-indigo-500 hover:from-sky-400 hover:to-indigo-400 text-slate-950 font-bold text-xs transition-all shadow-lg shadow-sky-500/20 active:scale-95 disabled:opacity-50"
        >
          {isZipping ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>{zipProgress || 'Generando ZIP...'}</span>
            </>
          ) : (
            <>
              <FileArchive className="w-4 h-4" />
              <span>Descargar ZIP Organizado</span>
            </>
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Folders List Sidebar */}
        <div className="lg:col-span-4 space-y-4">
          <div className="p-4 rounded-3xl bg-slate-950 border border-slate-800 shadow-xl space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">
                Mis Carpetas ({folders.length})
              </span>
              <button
                onClick={() => setIsCreating(true)}
                className="flex items-center gap-1 text-xs text-sky-400 hover:text-sky-300 font-semibold"
              >
                <FolderPlus className="w-4 h-4" />
                <span>Nueva</span>
              </button>
            </div>

            {/* Folder creation form */}
            {isCreating && (
              <form onSubmit={handleCreateSubmit} className="p-3 rounded-2xl bg-slate-900 border border-slate-700 space-y-3">
                <input
                  type="text"
                  autoFocus
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  placeholder="Nombre de la carpeta..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-sky-400"
                />

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    {colors.map((c) => (
                      <button
                        type="button"
                        key={c}
                        onClick={() => setNewFolderColor(c)}
                        className={`w-5 h-5 rounded-full transition-transform ${
                          newFolderColor === c ? 'scale-125 ring-2 ring-white' : 'opacity-70'
                        }`}
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="submit"
                      className="px-3 py-1.5 rounded-lg bg-sky-500 text-slate-950 font-bold text-xs"
                    >
                      Crear
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsCreating(false)}
                      className="px-2 py-1.5 rounded-lg bg-slate-800 text-slate-400 text-xs"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              </form>
            )}

            {/* Folder cards */}
            <div className="space-y-1.5 max-h-[460px] overflow-y-auto pr-1">
              {folders.map((f) => {
                const count = images.filter((img) => !img.isDeleted && img.folderId === f.id).length;
                const isSelected = f.id === currentFolder?.id;
                const isDefault = f.id === defaultFolderId;

                return (
                  <div
                    key={f.id}
                    onClick={() => setSelectedFolderId(f.id)}
                    className={`flex items-center justify-between p-3 rounded-2xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-slate-900 border-sky-400 shadow-md shadow-sky-500/10'
                        : 'bg-slate-950 border-slate-850 hover:bg-slate-900/60 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-4 h-4 rounded-full shrink-0 shadow-sm"
                        style={{ backgroundColor: f.color }}
                      />
                      <div>
                        <div className="text-xs font-bold text-white flex items-center gap-1.5">
                          <span>{f.name}</span>
                          {isDefault && (
                            <span className="text-[9px] font-mono px-1.5 py-0.2 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20">
                              Default Swipe
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-slate-500 font-mono">
                          {count} {count === 1 ? 'foto' : 'fotos'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      {!isDefault && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSetDefaultFolder(f.id);
                          }}
                          className="px-2 py-1 rounded-md text-[10px] font-mono bg-slate-800 hover:bg-slate-700 text-slate-300"
                          title="Hacer carpeta por defecto para swipe derecho"
                        >
                          Elegir
                        </button>
                      )}
                      {folders.length > 1 && count === 0 && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteFolder(f.id);
                          }}
                          className="p-1 rounded-md hover:bg-rose-500/20 text-slate-500 hover:text-rose-400"
                          title="Eliminar carpeta vacía"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Selected Folder Gallery View */}
        <div className="lg:col-span-8 space-y-4">
          <div className="p-6 rounded-3xl bg-slate-950 border border-slate-800 shadow-xl min-h-[420px]">
            {/* Folder Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
              <div className="flex items-center gap-3">
                <div
                  className="w-5 h-5 rounded-full shadow-md"
                  style={{ backgroundColor: currentFolder?.color }}
                />
                <div>
                  <h4 className="text-base font-bold text-white">{currentFolder?.name}</h4>
                  <p className="text-xs text-slate-400">
                    {folderImages.length} {folderImages.length === 1 ? 'imagen clasificada' : 'imágenes clasificadas'}
                  </p>
                </div>
              </div>
            </div>

            {/* Gallery Grid */}
            {folderImages.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center text-slate-500">
                <FolderIcon className="w-12 h-12 mb-3 opacity-30 text-sky-400" />
                <h5 className="text-sm font-semibold text-slate-300 mb-1">
                  Esta carpeta aún no tiene fotos
                </h5>
                <p className="text-xs max-w-sm text-slate-500 mb-4">
                  Desliza fotos hacia la derecha en la vista de Swipe para enviarlas automáticamente a esta carpeta.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 gap-3">
                {folderImages.map((img) => (
                  <div
                    key={img.id}
                    onClick={() => onOpenDetail(img)}
                    className="group relative rounded-2xl overflow-hidden bg-slate-900 border border-slate-800 aspect-square cursor-pointer shadow-md hover:border-sky-500 transition-all"
                  >
                    <img
                      src={img.url}
                      alt={img.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                    <div className="absolute bottom-2 inset-x-2 text-[11px] font-semibold text-white truncate drop-shadow-md opacity-0 group-hover:opacity-100 transition-opacity">
                      {img.name}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
