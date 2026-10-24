import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ImageItem, Folder, SwipeDirection } from '../types';
import {
  Trash2,
  FolderInput,
  Star,
  SkipForward,
  Plus,
  Info,
  Maximize2,
  Sparkles,
  Check,
} from 'lucide-react';

interface SwipeCardProps {
  image: ImageItem;
  defaultFolder: Folder;
  allFolders: Folder[];
  onSwipe: (direction: SwipeDirection, targetFolderId?: string) => void;
  onOpenDetail: (image: ImageItem) => void;
  onCreateFolder: (name: string, color: string) => Folder;
  isTop: boolean;
}

export const SwipeCard: React.FC<SwipeCardProps> = ({
  image,
  defaultFolder,
  allFolders,
  onSwipe,
  onOpenDetail,
  onCreateFolder,
  isTop,
}) => {
  const cardRef = useRef<HTMLDivElement | null>(null);

  // Position & drag state
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [showFolderMenu, setShowFolderMenu] = useState<boolean>(false);
  const [selectedFolderHover, setSelectedFolderHover] = useState<string | null>(null);
  const [isCreatingNewFolder, setIsCreatingNewFolder] = useState<boolean>(false);
  const [newFolderName, setNewFolderName] = useState<string>('');

  const dragStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const holdTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isHoldingRightRef = useRef<boolean>(false);

  const formatSize = (bytes: number) => {
    if (bytes >= 1000000) return `${(bytes / 1000000).toFixed(1)} MB`;
    return `${Math.round(bytes / 1000)} KB`;
  };

  // Determine current swipe direction for badge preview
  const getActiveDirection = (): SwipeDirection | null => {
    const { x, y } = dragOffset;
    const threshold = 40;
    if (Math.abs(x) > Math.abs(y)) {
      if (x > threshold) return 'right';
      if (x < -threshold) return 'left';
    } else {
      if (y < -threshold) return 'up';
      if (y > threshold) return 'down';
    }
    return null;
  };

  const activeDirection = getActiveDirection();

  // Mouse / Touch handlers
  const handlePointerDown = (e: React.PointerEvent) => {
    if (!isTop) return;
    setIsDragging(true);
    dragStartRef.current = { x: e.clientX, y: e.clientY };
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);

    // Reset hold state
    isHoldingRightRef.current = false;
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging || !isTop) return;

    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;
    setDragOffset({ x: dx, y: dy });

    // Check if dragging right and holding: trigger folder menu
    if (dx > 70 && !showFolderMenu) {
      if (!holdTimerRef.current) {
        holdTimerRef.current = setTimeout(() => {
          setShowFolderMenu(true);
          isHoldingRightRef.current = true;
        }, 220); // 220ms hold trigger
      }
    } else if (dx <= 70 && holdTimerRef.current) {
      clearTimeout(holdTimerRef.current);
      holdTimerRef.current = null;
    }
  };

  const handlePointerUp = () => {
    if (!isDragging || !isTop) return;
    setIsDragging(false);

    if (holdTimerRef.current) {
      clearTimeout(holdTimerRef.current);
      holdTimerRef.current = null;
    }

    // If folder menu is open and a folder was hovered or selected
    if (showFolderMenu) {
      if (selectedFolderHover) {
        onSwipe('right', selectedFolderHover);
        setShowFolderMenu(false);
        setDragOffset({ x: 0, y: 0 });
        return;
      }
      // If no folder selected yet, keep menu open for manual click
      return;
    }

    const { x, y } = dragOffset;
    const threshold = 110;

    if (x > threshold) {
      // Swipe Right -> Move to default proposed folder
      onSwipe('right', defaultFolder.id);
    } else if (x < -threshold) {
      // Swipe Left -> Move to Trash
      onSwipe('left');
    } else if (y < -threshold) {
      // Swipe Up -> Favorite
      onSwipe('up');
    } else if (y > threshold) {
      // Swipe Down -> Skip
      onSwipe('down');
    } else {
      // Snap back
      setDragOffset({ x: 0, y: 0 });
    }
  };

  const handleCreateFolderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;

    const colors = ['#06b6d4', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    const created = onCreateFolder(newFolderName.trim(), randomColor);
    setNewFolderName('');
    setIsCreatingNewFolder(false);

    // Immediately move image to newly created folder
    onSwipe('right', created.id);
    setShowFolderMenu(false);
  };

  // Card transform styles
  const rotation = isDragging ? dragOffset.x * 0.08 : 0;
  const opacity = isDragging ? Math.max(0.65, 1 - Math.abs(dragOffset.x) / 700) : 1;

  return (
    <div
      ref={cardRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      style={{
        transform: `translate3d(${dragOffset.x}px, ${dragOffset.y}px, 0) rotate(${rotation}deg)`,
        opacity,
        transition: isDragging ? 'none' : 'transform 0.35s cubic-bezier(0.175, 0.885, 0.32, 1.275), opacity 0.2s ease',
        touchAction: 'none',
      }}
      className={`absolute inset-0 select-none cursor-grab active:cursor-grabbing rounded-3xl overflow-hidden shadow-2xl border ${
        isTop ? 'border-slate-700/80' : 'border-slate-800/40 pointer-events-none'
      } bg-slate-900`}
    >
      {/* Background Image Container */}
      <img
        src={image.url}
        alt={image.name}
        draggable={false}
        className="w-full h-full object-cover pointer-events-none select-none transition-transform duration-300"
      />

      {/* Subtle Vignette Gradient for readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-black/30 pointer-events-none" />

      {/* SWIPE DIRECTION BADGES (Dynamic Lighting) */}
      {/* 1. LEFT: TRASH / ELIMINAR */}
      <div
        style={{ opacity: activeDirection === 'left' ? Math.min(1, Math.abs(dragOffset.x) / 80) : 0 }}
        className="absolute top-6 right-6 px-4 py-2 rounded-2xl bg-rose-600/90 text-white font-extrabold text-sm sm:text-base tracking-wider border-2 border-white/60 shadow-xl shadow-rose-950/80 rotate-12 flex items-center gap-2 pointer-events-none transition-opacity"
      >
        <Trash2 className="w-5 h-5" />
        <span>PAPELERA</span>
      </div>

      {/* 2. RIGHT: MOVE TO PROPOSED FOLDER */}
      <div
        style={{ opacity: activeDirection === 'right' && !showFolderMenu ? Math.min(1, Math.abs(dragOffset.x) / 80) : 0 }}
        className="absolute top-6 left-6 px-4 py-2 rounded-2xl bg-emerald-600/90 text-white font-extrabold text-sm sm:text-base tracking-wider border-2 border-white/60 shadow-xl shadow-emerald-950/80 -rotate-12 flex items-center gap-2 pointer-events-none transition-opacity"
      >
        <FolderInput className="w-5 h-5" />
        <span className="truncate max-w-[160px]">{defaultFolder.name}</span>
      </div>

      {/* 3. UP: FAVORITE */}
      <div
        style={{ opacity: activeDirection === 'up' ? Math.min(1, Math.abs(dragOffset.y) / 80) : 0 }}
        className="absolute top-6 left-1/2 -translate-x-1/2 px-4 py-2 rounded-2xl bg-amber-500/90 text-slate-950 font-extrabold text-sm sm:text-base tracking-wider border-2 border-white shadow-xl shadow-amber-950/80 flex items-center gap-2 pointer-events-none transition-opacity"
      >
        <Star className="w-5 h-5 fill-current" />
        <span>FAVORITA</span>
      </div>

      {/* 4. DOWN: SKIP / LATER */}
      <div
        style={{ opacity: activeDirection === 'down' ? Math.min(1, Math.abs(dragOffset.y) / 80) : 0 }}
        className="absolute bottom-24 left-1/2 -translate-x-1/2 px-4 py-2 rounded-2xl bg-slate-700/90 text-white font-extrabold text-sm tracking-wider border-2 border-white/40 shadow-xl flex items-center gap-2 pointer-events-none transition-opacity"
      >
        <SkipForward className="w-4 h-4" />
        <span>OMITIR / DESPUÉS</span>
      </div>

      {/* Bottom Info Bar & Metadata */}
      <div className="absolute bottom-0 inset-x-0 p-5 bg-gradient-to-t from-slate-950 via-slate-950/90 to-transparent flex items-end justify-between gap-4 pointer-events-auto">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-white/10 text-white backdrop-blur-md border border-white/20">
              {formatSize(image.sizeBytes)}
            </span>
            <span className="text-xs text-slate-300 font-mono">
              {image.width ? `${image.width}×${image.height}` : 'HD'}
            </span>
            <span className="text-xs text-slate-400 font-mono hidden sm:inline">
              • {image.date}
            </span>
          </div>
          <h3 className="text-base sm:text-lg font-bold text-white tracking-tight drop-shadow-md truncate max-w-[260px] sm:max-w-xs">
            {image.name}
          </h3>
        </div>

        <div className="flex items-center gap-2">
          {/* Quick Folder Menu Trigger Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowFolderMenu(true);
            }}
            className="p-2.5 rounded-2xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700 backdrop-blur-md transition-all active:scale-95"
            title="Elegir otra carpeta de destino"
          >
            <FolderInput className="w-4 h-4 text-sky-400" />
          </button>

          {/* Fullscreen HD Zoom Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onOpenDetail(image);
            }}
            className="p-2.5 rounded-2xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700 backdrop-blur-md transition-all active:scale-95"
            title="Ver imagen en detalle y pantalla completa"
          >
            <Maximize2 className="w-4 h-4 text-white" />
          </button>
        </div>
      </div>

      {/* LONG-PRESS / HOLD RIGHT FOLDER MENU MODAL OVERLAY */}
      {showFolderMenu && (
        <div
          onPointerDown={(e) => e.stopPropagation()}
          className="absolute inset-0 bg-slate-950/90 backdrop-blur-xl p-5 flex flex-col justify-between z-30 animate-in fade-in duration-150"
        >
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <FolderInput className="w-5 h-5 text-sky-400" />
                <h4 className="text-base font-bold text-white">Elegir Carpeta de Destino</h4>
              </div>
              <button
                onClick={() => {
                  setShowFolderMenu(false);
                  setDragOffset({ x: 0, y: 0 });
                }}
                className="text-xs text-slate-400 hover:text-white px-2 py-1 rounded-lg bg-slate-800"
              >
                Cancelar
              </button>
            </div>
            <p className="text-xs text-slate-400 mb-4">
              Selecciona a cuál de tus carpetas quieres mover esta foto, o crea una nueva al instante:
            </p>

            {/* List of user folders */}
            <div className="space-y-2 max-h-[260px] overflow-y-auto pr-1">
              {allFolders.map((folder) => {
                const isDefault = folder.id === defaultFolder.id;
                return (
                  <button
                    key={folder.id}
                    onClick={() => {
                      onSwipe('right', folder.id);
                      setShowFolderMenu(false);
                    }}
                    onPointerEnter={() => setSelectedFolderHover(folder.id)}
                    className="w-full flex items-center justify-between p-3 rounded-2xl bg-slate-900 border border-slate-800 hover:border-sky-500 hover:bg-slate-800/80 transition-all text-left group"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-4 h-4 rounded-full shrink-0 shadow-sm"
                        style={{ backgroundColor: folder.color }}
                      />
                      <span className="text-sm font-semibold text-white group-hover:text-sky-300">
                        {folder.name}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {isDefault && (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20">
                          Por defecto
                        </span>
                      )}
                      <Check className="w-4 h-4 opacity-0 group-hover:opacity-100 text-sky-400" />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Create New Folder Inline Section */}
          <div className="pt-3 border-t border-slate-800">
            {isCreatingNewFolder ? (
              <form onSubmit={handleCreateFolderSubmit} className="space-y-2">
                <input
                  type="text"
                  autoFocus
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  placeholder="Nombre de la nueva carpeta..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white focus:outline-none focus:border-sky-400"
                />
                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="flex-1 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs"
                  >
                    Crear y Mover Aquí
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsCreatingNewFolder(false)}
                    className="px-3 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs"
                  >
                    Volver
                  </button>
                </div>
              </form>
            ) : (
              <button
                onClick={() => setIsCreatingNewFolder(true)}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-dashed border-slate-700 hover:border-sky-400 text-sky-400 text-xs font-semibold transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Crear Nueva Carpeta</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
