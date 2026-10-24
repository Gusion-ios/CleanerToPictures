export interface ImageItem {
  id: string;
  name: string;
  url: string;
  sizeBytes: number; // in bytes
  width?: number;
  height?: number;
  date: string;
  folderId?: string; // which folder it belongs to
  isDeleted: boolean;
  isFavorite: boolean;
  isSkipped?: boolean;
}

export interface Folder {
  id: string;
  name: string;
  color: string;
  icon?: string;
  isDefault?: boolean;
  createdAt: string;
}

export type SwipeDirection = 'left' | 'right' | 'up' | 'down';

export interface SwipeHistoryEntry {
  item: ImageItem;
  action: 'trash' | 'move' | 'favorite' | 'skip';
  targetFolderId?: string;
  previousFolderId?: string;
  timestamp: number;
}
