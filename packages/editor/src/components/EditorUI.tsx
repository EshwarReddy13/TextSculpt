// @ts-nocheck
'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { LoadingState, CacheStatus, PerformanceMetrics, ProcessingError } from '../types';

interface EditorUIProps {
  content: string;
  onContentChange: (newContent: string) => void;
  cacheStatus: CacheStatus;
  loadingState: LoadingState;
  metrics: PerformanceMetrics;
  error: ProcessingError | null;
  onRetry: () => void;
}

// Debounce utility
const useDebounce = <T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T => {
  const timeoutRef = useRef<NodeJS.Timeout | undefined>();
  
  return useCallback((...args: Parameters<T>) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => callback(...args), delay);
  }, [callback, delay]) as T;
};

export function EditorUI({ 
  content, 
  onContentChange, 
  cacheStatus, 
  loadingState,
  metrics,
  error,
  onRetry 
}: EditorUIProps) {
  const [showRawHtml, setShowRawHtml] = useState(false);
  const [localContent, setLocalContent] = useState<string>(content);

  // Update local content when prop changes
  useEffect(() => {
    setLocalContent(content);
  }, [content]);

  // Debounced content change handler
  const debouncedOnContentChange = useDebounce(onContentChange, 300);

  const handleContentChange = (e: React.FormEvent<HTMLDivElement>) => {
    const newContent = e.currentTarget.innerHTML;
    setLocalContent(newContent);
    debouncedOnContentChange(newContent);
  };

  const getStatusLabel = () => {
    switch (cacheStatus) {
      case 'new':
        return 'Processed for the first time (not cached)';
      case 'cached-db':
        return 'Loaded from cache (Realtime Database)';
      case 'cached-storage':
        return 'Loaded from cache (Firebase Storage)';
      case 'stale':
        return 'Loaded from cache (stale, updating in background)';
      default:
        return 'Unknown status';
    }
  };

  const getLoadingLabel = () => {
    switch (loadingState) {
      case 'loading-cached':
        return 'Loading from cache...';
      case 'processing-background':
        return 'Processing document in background...';
      case 'processing-foreground':
        return 'Processing document...';
      case 'caching':
        return 'Saving to cache...';
      case 'error':
        return 'Error occurred';
      default:
        return '';
    }
  };

  const isLoading = loadingState !== 'idle' && loadingState !== 'error';

  return (
    <div className="relative">
      {/* Loading indicator */}
      {isLoading && (
        <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <div className="flex items-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
            <span className="text-blue-700 dark:text-blue-300 text-sm font-medium">
              {getLoadingLabel()}
            </span>
          </div>
        </div>
      )}

      {/* Cache status display */}
      <div className="mb-2 text-xs text-blue-700 dark:text-blue-300 font-medium">
        Cache status: {getStatusLabel()}
      </div>

      {/* Performance metrics */}
      {Object.keys(metrics).length > 0 && (
        <div className="mb-2 text-xs text-gray-600 dark:text-gray-400">
          {metrics.process !== undefined && (
            <span>Process: {metrics.process.toFixed(1)} ms&nbsp;&nbsp;</span>
          )}
          {metrics.cache !== undefined && (
            <span>Cache: {metrics.cache.toFixed(1)} ms&nbsp;&nbsp;</span>
          )}
          {metrics.retrieve !== undefined && (
            <span>Retrieve: {metrics.retrieve.toFixed(1)} ms&nbsp;&nbsp;</span>
          )}
          {metrics.total !== undefined && (
            <span>Total: {metrics.total.toFixed(1)} ms</span>
          )}
        </div>
      )}

      {/* Header with toggle and retry button */}
      <div className="mb-4 flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Document Editor
        </h3>
        <div className="flex items-center gap-2">
          {error?.retryable && (
            <button
              onClick={onRetry}
              className="px-3 py-1 text-sm bg-yellow-600 hover:bg-yellow-700 text-white rounded transition"
            >
              Retry
            </button>
          )}
          <button
            onClick={() => setShowRawHtml(!showRawHtml)}
            className="px-3 py-1 text-sm bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-100 rounded transition"
          >
            {showRawHtml ? 'View Document' : 'View Raw HTML'}
          </button>
        </div>
      </div>

      {/* Content area */}
      <div className="border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
        {showRawHtml ? (
          <pre className="p-4 bg-gray-50 dark:bg-gray-800 text-sm text-gray-800 dark:text-gray-200 overflow-auto max-h-96">
            {localContent}
          </pre>
        ) : (
          <div
            contentEditable
            onInput={handleContentChange}
            className="p-4 min-h-64 focus:outline-none prose dark:prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: localContent }}
            suppressHydrationWarning
          />
        )}
      </div>
    </div>
  );
} 