'use client';

import React from 'react';

interface EditorUIProps {
  content: string;
  onContentChange: (newContent: string) => void;
}

export function EditorUI({ content, onContentChange }: EditorUIProps) {
  return (
    <div className="relative">
      <div
        contentEditable
        suppressHydrationWarning
        className="min-h-[200px] p-4 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        onInput={(e) => onContentChange(e.currentTarget.innerHTML)}
        dangerouslySetInnerHTML={{ __html: content }}
      />
    </div>
  );
} 