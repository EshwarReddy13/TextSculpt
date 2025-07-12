'use client';

import React, { useState } from 'react';

interface EditorUIProps {
  content: string;
  onContentChange: (newContent: string) => void;
  cacheStatus: 'new' | 'cached-db' | 'cached-storage';
  timings?: {
    process?: number;
    cache?: number;
    retrieve?: number;
  };
}

export function EditorUI({ content, onContentChange, cacheStatus, timings }: EditorUIProps) {
  const [showRawHtml, setShowRawHtml] = useState(false);

  const handleContentChange = (e: React.FormEvent<HTMLDivElement>) => {
    onContentChange(e.currentTarget.innerHTML);
  };

  const statusLabel =
    cacheStatus === 'new'
      ? 'Processed for the first time (not cached)'
      : cacheStatus === 'cached-db'
      ? 'Loaded from cache (Realtime Database)'
      : 'Loaded from cache (Firebase Storage)';

  return (
    <div className="relative">
      {/* Cache status display */}
      <div className="mb-2 text-xs text-blue-700 dark:text-blue-300 font-medium">
        Cache status: {statusLabel}
      </div>
      {/* Timing info */}
      {timings && (
        <div className="mb-2 text-xs text-gray-600 dark:text-gray-400">
          {timings.process !== undefined && (
            <span>Process: {timings.process.toFixed(1)} ms&nbsp;&nbsp;</span>
          )}
          {timings.cache !== undefined && (
            <span>Cache: {timings.cache.toFixed(1)} ms&nbsp;&nbsp;</span>
          )}
          {timings.retrieve !== undefined && (
            <span>Retrieve: {timings.retrieve.toFixed(1)} ms</span>
          )}
        </div>
      )}
      {/* Toggle for raw HTML view */}
      <div className="mb-4 flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Document Editor
        </h3>
        <button
          onClick={() => setShowRawHtml(!showRawHtml)}
          className="px-3 py-1 text-sm bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-100 rounded transition"
        >
          {showRawHtml ? 'View Document' : 'View Raw HTML'}
        </button>
      </div>

      {showRawHtml ? (
        // Raw HTML view for debugging
        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded border border-gray-200 dark:border-gray-700">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Raw HTML:</h4>
          <pre className="text-xs text-gray-600 dark:text-gray-400 whitespace-pre-wrap overflow-auto max-h-96">
            {content}
          </pre>
        </div>
      ) : (
        // Editable document view
        <div
          contentEditable
          suppressHydrationWarning
          className="min-h-[400px] p-6 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent prose prose-gray dark:prose-invert max-w-none"
          onInput={handleContentChange}
          dangerouslySetInnerHTML={{ __html: content }}
          style={{
            fontFamily: 'system-ui, -apple-system, sans-serif',
            lineHeight: '1.6',
          }}
        />
      )}

      {/* Document info */}
      <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
        <p>Content length: {content.length} characters</p>
        <p>HTML tags: {content.match(/<[^>]+>/g)?.length || 0}</p>
      </div>
    </div>
  );
} 