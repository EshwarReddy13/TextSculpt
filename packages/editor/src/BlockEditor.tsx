'use client';

import React, { useState, useEffect } from 'react';
import { BlockEditorProps } from './types';
import { getDocumentWithStatus, cacheProcessedDocument } from '@textsculpt/document-cache';
import { encodeForFirebase } from '@textsculpt/document-cache/src/encoding';
import { processDocx } from '@textsculpt/processors';
import { EditorUI } from './components/EditorUI';

export default function BlockEditor({ file, user }: BlockEditorProps) {
  const [content, setContent] = useState<string>('');
  const [status, setStatus] = useState<'new' | 'cached-db' | 'cached-storage'>('new');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);
  const [timings, setTimings] = useState<{ process?: number; cache?: number; retrieve?: number }>({});

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!file || !isClient) return;

    setIsLoading(true);
    setError(null);
    setTimings({});

    const retrieveStart = performance.now();
    // Try to load from cache first
    getDocumentWithStatus(encodeForFirebase(file.id))
      .then(async ({ content: cachedContent, status }) => {
        const retrieveEnd = performance.now();
        if (status === 'new') {
          // Not cached, process the file
          const processStart = performance.now();
          processDocx(file.data)
            .then(async processedContent => {
              const processEnd = performance.now();
              setContent(processedContent);
              setStatus('new');
              setIsLoading(false);
              setTimings({
                process: processEnd - processStart,
                cache: undefined,
                retrieve: retrieveEnd - retrieveStart,
              });
              // Cache the processed document
              try {
                const cacheStart = performance.now();
                await cacheProcessedDocument(encodeForFirebase(file.id), processedContent);
                const cacheEnd = performance.now();
                setTimings(t => ({ ...t, cache: cacheEnd - cacheStart }));
                console.log('[BlockEditor] Cached processed document');
              } catch (cacheErr) {
                console.error('[BlockEditor] Error caching processed document:', cacheErr);
              }
            })
            .catch(err => {
              console.error('Failed to process document:', err);
              setError('Could not process the document.');
              setIsLoading(false);
            });
        } else {
          setContent(cachedContent);
          setStatus(status);
          setIsLoading(false);
          setTimings({
            process: undefined,
            cache: undefined,
            retrieve: retrieveEnd - retrieveStart,
          });
        }
      })
      .catch(err => {
        console.error('Failed to load document:', err);
        setError('Could not load the document.');
        setIsLoading(false);
      });
  }, [file, isClient]);

  if (!isClient || isLoading) {
    return <div>Loading document...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <EditorUI
      content={content}
      onContentChange={newContent => setContent(newContent)}
      cacheStatus={status}
      timings={timings}
    />
  );
}