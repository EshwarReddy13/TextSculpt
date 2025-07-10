'use client';

import React, { useState, useEffect } from 'react';
import { BlockEditorProps } from './types';
import { getDocument, firebaseProvider } from '@textsculpt/document-cache';
import { processDocx } from '@textsculpt/processors';
import { EditorUI } from './components/EditorUI';

export default function BlockEditor({ file, user }: BlockEditorProps) {
  const [content, setContent] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!file) return;

    setIsLoading(true);
    setError(null);

    // This is where the magic happens. We call our generic cache service,
    // providing it with the Firebase implementation and the specific
    // processor for the file type.
    getDocument(file, firebaseProvider, processDocx)
      .then(processedContent => {
        setContent(processedContent);
      })
      .catch(err => {
        console.error('Failed to load document:', err);
        setError('Could not load the document.');
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [file]);

  if (isLoading) {
    return <div>Loading document...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <EditorUI
      content={content}
      onContentChange={newContent => setContent(newContent)}
    />
  );
}