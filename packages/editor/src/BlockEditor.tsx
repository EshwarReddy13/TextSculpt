'use client';

import React, { useState, useEffect } from 'react';
import { BlockEditorProps } from './types';
import { EditorUI } from './components/EditorUI';
import { useDocumentProcessing, UseDocumentProcessingReturn } from './hooks/useDocumentProcessing';

export default function BlockEditor({ file, user }: BlockEditorProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const {
    content,
    loadingState,
    cacheStatus,
    metrics,
    error,
    retry,
  }: UseDocumentProcessingReturn = useDocumentProcessing({ file, isClient });

  const handleContentChange = (newContent: string) => {
    // TODO: Implement collaborative editing with Y.js
    console.log('Content changed:', newContent);
  };

  if (!isClient) {
    return <div>Loading...</div>;
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-red-800 dark:text-red-200 font-medium">Error Loading Document</h3>
            <p className="text-red-600 dark:text-red-300 text-sm mt-1">{error.message}</p>
            {error.retryable && (
              <p className="text-red-500 dark:text-red-400 text-xs mt-1">
                Retry attempt {error.retryCount + 1} of 3
              </p>
            )}
          </div>
          {error.retryable && (
            <button
              onClick={retry}
              className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm rounded transition"
            >
              Retry
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <EditorUI
      content={content}
      onContentChange={handleContentChange}
      cacheStatus={cacheStatus}
      loadingState={loadingState}
      metrics={metrics}
      error={error}
      onRetry={retry}
    />
  );
}