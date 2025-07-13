import { DocumentFile } from '@textsculpt/document-cache';

export interface BlockEditorProps {
  file: DocumentFile;
  user: EditorUser;
}

export interface EditorUser {
  id: string;
  name: string;
}

// Enhanced loading states for optimistic loading
export type LoadingState = 
  | 'idle'
  | 'loading-cached'           // Loading from cache (optimistic)
  | 'processing-background'    // Processing new file in background
  | 'processing-foreground'    // Processing new file (no cache available)
  | 'caching'                  // Storing processed content
  | 'error';                   // Error state

// Enhanced cache status
export type CacheStatus = 'new' | 'cached-db' | 'cached-storage' | 'stale';

// Performance metrics
export interface PerformanceMetrics {
  process?: number;
  cache?: number;
  retrieve?: number;
  total?: number;
}

// Error information
export interface ProcessingError {
  type: 'processing' | 'caching' | 'retrieval' | 'network';
  message: string;
  retryable: boolean;
  retryCount: number;
}

// Document processing result
export interface DocumentResult {
  content: string;
  status: CacheStatus;
  metrics: PerformanceMetrics;
  error?: ProcessingError;
} 