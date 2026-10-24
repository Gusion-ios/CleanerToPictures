import React, { useState, useEffect, useCallback } from 'react';
import { ImageItem, Folder, SwipeDirection, SwipeHistoryEntry } from './types';
import { INITIAL_FOLDERS, INITIAL_IMAGES } from './data/sampleImages';
import { SwipeCard } from './components/SwipeCard';
import { TrashModal } from './components/TrashModal';
import { FoldersExplorer } from './components/FoldersExplorer';
import { DetailModal } from './components/DetailModal';
import { UploadModal } from './components/UploadModal';
import { SessionSummary } from './components/SessionSummary';
import { InstallModal } from './components/InstallModal';
import {
  Trash2,
  FolderInput,
  Star,
  SkipForward,
  RotateCcw,
  Upload,
  Layers,
  Sparkles,
  HardDrive,
  Info,
  Maximize2,
  FolderPlus,
  Check,
  Flame,
  Smartphone,
} from 'lucide-react';

export default function App() {
  // Main State
  const [images, setImages] = useState<ImageItem[]>(() => {
    const saved = localStorage.getItem('swipeclean_images');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return INITIAL_IMAGES;
      }
    }
    return INITIAL_IMAGES;
  });

  const [folders, setFolders] = useState<Folder[]>(() => {
    const saved = localStorage.getItem('swipeclean_folders');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return INITIAL_FOLDERS;
      }
    }
    return INITIAL_FOLDERS;
  });

  const [defaultFolderId, setDefaultFolderId] = useState<string>(() => {
    const defaultF = folders.find((f) => f.isDefault) || folders[1] || folders[0];
    return defaultF?.id || 'folder-trips';
  });

  // History stack for Undo
  const [history, setHistory] = useState<SwipeHistoryEntry[]>([]);

  // Modals & Navigation Views
  const [activeTab, setActiveTab] = useState<'swipe' | 'folders' | 'trash'>('swipe');
  const [isTrashOpen, setIsTrashOpen] = useState<boolean>(false);
  const [isUploadOpen, setIsUploadOpen] = useState<boolean>(false);
  const [isInstallOpen, setIsInstallOpen] = useState<boolean>(false);
  const [detailImage, setDetailImage] = useState<ImageItem | null>(null);

  // Sync with LocalStorage
  useEffect(() => {
    localStorage.setItem('swipeclean_images', JSON.stringify(images));
  }, [images]);

  useEffect(() => {
    localStorage.setItem('swipeclean_folders', JSON.stringify(folders));
  }, [folders]);

  // Queue of images remaining to swipe
  const remainingImages = images.filter((img) => !img.isDeleted && !img.folderId);
  const deletedImages = images.filter((img) => img.isDeleted);
  const totalSavedBytes = deletedImages.reduce((sum, img) => sum + img.sizeBytes, 0);

  const defaultFolder = folders.find((f) => f.id === defaultFolderId) || folders[0];

  const formatSize = (bytes: number) => {
    if (bytes >= 1000000000) return `${(bytes / 1000000000).toFixed(2)} GB`;
    if (bytes >= 1000000) return `${(bytes / 1000000).toFixed(1)} MB`;
    return `${Math.round(bytes / 1000)} KB`;
  };

  // Perform Swipe Action
  const handleSwipe = useCallback(
    (direction: SwipeDirection, targetFolderId?: string) => {
      if (remainingImages.length === 0) return;
      const currentItem = remainingImages[0];

      let actionType: 'trash' | 'move' | 'favorite' | 'skip' = 'trash';
      let destFolder = targetFolderId;

      if (direction === 'left') {
        // Move to Trash
        actionType = 'trash';
        setImages((prev) =>
          prev.map((img) =>
            img.id === currentItem.id ? { ...img, isDeleted: true } : img
          )
        );
      } else if (direction === 'right') {
        // Move to folder (target or default proposed folder)
        actionType = 'move';
        destFolder = destFolder || defaultFolderId;
        setImages((prev) =>
          prev.map((img) =>
            img.id === currentItem.id ? { ...img, folderId: destFolder } : img
          )
        );
      } else if (direction === 'up') {
        // Favorite & Move to default folder
        actionType = 'favorite';
        destFolder = destFolder || defaultFolderId;
        setImages((prev) =>
          prev.map((img) =>
            img.id === currentItem.id
              ? { ...img, isFavorite: true, folderId: destFolder }
              : img
          )
        );
      } else if (direction === 'down') {
        // Skip: send to end of queue
        actionType = 'skip';
        setImages((prev) => {
          const others = prev.filter((img) => img.id !== currentItem.id);
          return [...others, currentItem];
        });
      }

      // Record in undo history
      setHistory((prev) => [
        ...prev,
        {
          item: currentItem,
          action: actionType,
          targetFolderId: destFolder,
          timestamp: Date.now(),
        },
      ]);
    },
    [remainingImages, defaultFolderId]
  );

  // Undo Last Action (Ctrl+Z)
  const handleUndo = useCallback(() => {
    if (history.length === 0) return;
    const lastEntry = history[history.length - 1];

    setImages((prev) =>
      prev.map((img) => {
        if (img.id === lastEntry.item.id) {
          return {
            ...img,
            isDeleted: false,
            folderId: undefined,
            isFavorite: lastEntry.item.isFavorite,
          };
        }
        return img;
      })
    );

    setHistory((prev) => prev.slice(0, -1));
  }, [history]);

  // Keyboard Shortcuts Listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement).tagName)) {
        return;
      }

      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handleSwipe('left');
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        handleSwipe('right');
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        handleSwipe('up');
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        handleSwipe('down');
      } else if (e.key === 'z' || e.key === 'Z') {
        e.preventDefault();
        handleUndo();
      } else if (e.key === ' ' && remainingImages.length > 0) {
        e.preventDefault();
        setDetailImage(remainingImages[0]);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleSwipe, handleUndo, remainingImages]);

  // Create New Folder
  const handleCreateFolder = (name: string, color: string): Folder => {
    const newFolder: Folder = {
      id: `folder-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      name,
      color,
      createdAt: new Date().toISOString().slice(0, 10),
    };
    setFolders((prev) => [...prev, newFolder]);
    return newFolder;
  };

  // Delete Folder
  const handleDeleteFolder = (id: string) => {
    setFolders((prev) => prev.filter((f) => f.id !== id));
  };

  // Trash Operations
  const handleRestoreImage = (id: string) => {
    setImages((prev) =>
      prev.map((img) => (img.id === id ? { ...img, isDeleted: false, folderId: undefined } : img))
    );
  };

  const handleRestoreAll = () => {
    setImages((prev) =>
      prev.map((img) => (img.isDeleted ? { ...img, isDeleted: false, folderId: undefined } : img))
    );
  };

  const handleEmptyTrash = () => {
    if (confirm('¿Estás seguro de vaciar definitivamente la papelera?')) {
      setImages((prev) => prev.filter((img) => !img.isDeleted));
      setIsTrashOpen(false);
    }
  };

  // Add Uploaded Images
  const handleAddImages = (newImages: ImageItem[]) => {
    setImages((prev) => [...newImages, ...prev]);
    setActiveTab('swipe');
  };

  // Restart Samples
  const handleRestartSamples = () => {
    setImages(INITIAL_IMAGES);
    setHistory([]);
    setActiveTab('swipe');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-sky-500 selection:text-slate-950">
      {/* Top Navigation Header */}
      <header className="sticky top-0 z-40 w-full bg-slate-950/85 backdrop-blur-xl border-b border-slate-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16 gap-3">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-rose-500 via-sky-500 to-emerald-400 p-0.5 shadow-lg shadow-sky-500/20 flex items-center justify-center">
                <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                  <Flame className="w-4 h-4 text-rose-400" />
                </div>
              </div>
              <div>
                <h1 className="text-sm sm:text-base font-extrabold text-white tracking-tight flex items-center gap-1.5">
                  <span>SwipeClean</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20">
                    Pro
                  </span>
                </h1>
                <p className="text-[11px] text-slate-400 hidden sm:block">
                  Limpia y organiza fotos con gestos al estilo Tinder
                </p>
              </div>
            </div>

            {/* View Switcher Tabs */}
            <nav className="flex items-center gap-1 bg-slate-900/90 p-1 rounded-2xl border border-slate-800">
              <button
                onClick={() => setActiveTab('swipe')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  activeTab === 'swipe'
                    ? 'bg-sky-500 text-slate-950 shadow-md font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Limpiador ({remainingImages.length})
              </button>
              <button
                onClick={() => setActiveTab('folders')}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  activeTab === 'folders'
                    ? 'bg-sky-500 text-slate-950 shadow-md font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Carpetas</span>
              </button>
            </nav>

            {/* Actions: Install, Trash and Upload */}
            <div className="flex items-center gap-2">
              {/* Install on Mobile Button */}
              <button
                onClick={() => setIsInstallOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-sky-400 text-xs font-semibold transition-all shadow-sm"
                title="Cómo instalar en tu celular (Android o iPhone)"
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Instalar en Celular</span>
              </button>

              {/* Trash Quick Button with Saved Storage Counter */}
              <button
                onClick={() => setIsTrashOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 text-xs font-semibold transition-all"
                title="Ver papelera de reciclaje y espacio ahorrado"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span className="font-mono">{formatSize(totalSavedBytes)}</span>
              </button>

              {/* Upload Button */}
              <button
                onClick={() => setIsUploadOpen(true)}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-2xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs transition-all shadow-md shadow-sky-500/20 active:scale-95"
              >
                <Upload className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Cargar Fotos</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-6 flex flex-col items-center justify-center">
        {activeTab === 'swipe' && (
          <div className="w-full flex flex-col items-center space-y-6">
            {/* Gesture Quick Guide & Proposed Folder Pill */}
            <div className="w-full max-w-md flex items-center justify-between px-3 py-2 rounded-2xl bg-slate-900/60 border border-slate-800/80 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <span className="text-slate-500">Mover a:</span>
                <span
                  className="font-semibold text-white px-2 py-0.5 rounded-lg border border-slate-700 flex items-center gap-1.5"
                  style={{ backgroundColor: `${defaultFolder.color}20`, borderColor: defaultFolder.color }}
                >
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: defaultFolder.color }}
                  />
                  <span>{defaultFolder.name}</span>
                </span>
              </div>

              <div className="text-[11px] font-mono text-slate-500 hidden sm:block">
                Mantén presionado derecha para más carpetas
              </div>
            </div>

            {/* THE TINDER CARD STACK CONTAINER */}
            <div className="relative w-full max-w-md aspect-[3/4] sm:aspect-[4/5] min-h-[440px] max-h-[580px]">
              {remainingImages.length === 0 ? (
                <SessionSummary
                  allImages={images}
                  folders={folders}
                  onOpenTrash={() => setIsTrashOpen(true)}
                  onOpenExplorer={() => setActiveTab('folders')}
                  onOpenUpload={() => setIsUploadOpen(true)}
                  onRestartSamples={handleRestartSamples}
                />
              ) : (
                remainingImages
                  .slice(0, 3)
                  .reverse()
                  .map((img, index, array) => {
                    const isTop = index === array.length - 1;
                    const stackOffset = (array.length - 1 - index) * 8;
                    const stackScale = 1 - (array.length - 1 - index) * 0.04;

                    return (
                      <div
                        key={img.id}
                        style={{
                          transform: `translate3d(0, ${stackOffset}px, 0) scale(${stackScale})`,
                          zIndex: index,
                        }}
                        className="absolute inset-0 transition-transform duration-300"
                      >
                        <SwipeCard
                          image={img}
                          defaultFolder={defaultFolder}
                          allFolders={folders}
                          onSwipe={handleSwipe}
                          onOpenDetail={setDetailImage}
                          onCreateFolder={handleCreateFolder}
                          isTop={isTop}
                        />
                      </div>
                    );
                  })
              )}
            </div>

            {/* TACTILE BOTTOM TINDER ACTION CONTROLS */}
            {remainingImages.length > 0 && (
              <div className="w-full max-w-md flex items-center justify-center gap-3 sm:gap-4 pt-2">
                {/* 1. Undo Button */}
                <button
                  onClick={handleUndo}
                  disabled={history.length === 0}
                  className="w-12 h-12 rounded-full bg-slate-900 border border-slate-800 text-amber-400 hover:bg-slate-800 flex items-center justify-center shadow-lg transition-transform active:scale-90 disabled:opacity-30 disabled:pointer-events-none"
                  title="Deshacer último swipe (Z)"
                >
                  <RotateCcw className="w-5 h-5" />
                </button>

                {/* 2. Swipe Left (Trash) */}
                <button
                  onClick={() => handleSwipe('left')}
                  className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-slate-900 border-2 border-rose-500/40 text-rose-500 hover:bg-rose-500 hover:text-white flex items-center justify-center shadow-xl shadow-rose-950/40 transition-all active:scale-90"
                  title="Enviar a Papelera (Flecha Izquierda)"
                >
                  <Trash2 className="w-6 h-6 sm:w-7 sm:h-7" />
                </button>

                {/* 3. Swipe Up (Favorite) */}
                <button
                  onClick={() => handleSwipe('up')}
                  className="w-12 h-12 rounded-full bg-slate-900 border border-slate-800 text-amber-400 hover:bg-amber-400 hover:text-slate-950 flex items-center justify-center shadow-lg transition-all active:scale-90"
                  title="Marcar como Favorita (Flecha Arriba)"
                >
                  <Star className="w-5 h-5 fill-current" />
                </button>

                {/* 4. Swipe Down (Skip) */}
                <button
                  onClick={() => handleSwipe('down')}
                  className="w-12 h-12 rounded-full bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 flex items-center justify-center shadow-lg transition-all active:scale-90"
                  title="Omitir / Decidir después (Flecha Abajo)"
                >
                  <SkipForward className="w-5 h-5" />
                </button>

                {/* 5. Swipe Right (Move to default proposed folder) */}
                <button
                  onClick={() => handleSwipe('right')}
                  className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-slate-900 border-2 border-emerald-500/40 text-emerald-400 hover:bg-emerald-500 hover:text-slate-950 flex items-center justify-center shadow-xl shadow-emerald-950/40 transition-all active:scale-90"
                  title={`Mover a "${defaultFolder.name}" (Flecha Derecha)`}
                >
                  <FolderInput className="w-6 h-6 sm:w-7 sm:h-7" />
                </button>
              </div>
            )}

            {/* Keyboard Shortcuts Help bar */}
            {remainingImages.length > 0 && (
              <div className="flex flex-wrap items-center justify-center gap-3 text-[11px] font-mono text-slate-500 pt-1">
                <span>← Borrar</span>
                <span>•</span>
                <span>→ Mover a {defaultFolder.name}</span>
                <span>•</span>
                <span>↑ Favorita</span>
                <span>•</span>
                <span>↓ Saltar</span>
                <span>•</span>
                <span>Z Deshacer</span>
              </div>
            )}
          </div>
        )}

        {/* FOLDERS EXPLORER TAB */}
        {activeTab === 'folders' && (
          <div className="w-full">
            <FoldersExplorer
              folders={folders}
              images={images}
              defaultFolderId={defaultFolderId}
              onSetDefaultFolder={setDefaultFolderId}
              onCreateFolder={handleCreateFolder}
              onDeleteFolder={handleDeleteFolder}
              onOpenDetail={setDetailImage}
            />
          </div>
        )}
      </main>

      {/* MODALS */}
      {/* 1. Trash Modal */}
      <TrashModal
        isOpen={isTrashOpen}
        onClose={() => setIsTrashOpen(false)}
        deletedImages={deletedImages}
        onRestoreImage={handleRestoreImage}
        onRestoreAll={handleRestoreAll}
        onEmptyTrash={handleEmptyTrash}
      />

      {/* 2. Upload / Batch Import Modal */}
      <UploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onAddImages={handleAddImages}
      />

      {/* 3. Detail & Zoom Modal */}
      <DetailModal
        image={detailImage}
        allFolders={folders}
        onClose={() => setDetailImage(null)}
        onMoveToFolder={(imgId, fId) => {
          setImages((prev) =>
            prev.map((i) => (i.id === imgId ? { ...i, folderId: fId, isDeleted: false } : i))
          );
          setDetailImage(null);
        }}
        onTrash={(imgId) => {
          setImages((prev) =>
            prev.map((i) => (i.id === imgId ? { ...i, isDeleted: true } : i))
          );
        }}
        onToggleFavorite={(imgId) => {
          setImages((prev) =>
            prev.map((i) => (i.id === imgId ? { ...i, isFavorite: !i.isFavorite } : i))
          );
          setDetailImage((prev) => (prev ? { ...prev, isFavorite: !prev.isFavorite } : null));
        }}
      />

      {/* 4. Install on Mobile PWA Modal */}
      <InstallModal
        isOpen={isInstallOpen}
        onClose={() => setIsInstallOpen(false)}
      />
    </div>
  );
}
