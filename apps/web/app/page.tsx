'use client';

import { useState } from 'react';
import BlockEditor from '@textsculpt/editor';
import { EditorUser } from '@textsculpt/editor';
import { DocumentFile } from '@textsculpt/document-cache';

// Mock user for demonstration purposes.
// In a real app, this would come from an auth provider.
const mockUser: EditorUser = {
  id: 'user-123',
  name: 'Demo User',
};

export default function WebAppPage() {
  const [documentFile, setDocumentFile] = useState<DocumentFile | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setDocumentFile({
        id: `local-${file.name}-${file.lastModified}`,
        lastModified: file.lastModified,
        data: file,
      });
    }
  };

  return (
    <div className="container mx-auto p-8">
      <header className="mb-8">
        <h1 className="text-4xl font-bold">TextSculpt Demo</h1>
        <p className="text-gray-600">
          A demonstration of the all-in-one BlockEditor component.
        </p>
      </header>

      {!documentFile ? (
        <div className="p-6 border-2 border-dashed rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Upload a Document</h2>
          <p className="mb-4">
            Select a `.docx` file to see the editor in action. The editor will
            handle all the caching and processing internally.
          </p>
          <input type="file" accept=".docx" onChange={handleFileChange} />
        </div>
      ) : (
        <div>
          <BlockEditor file={documentFile} user={mockUser} />
        </div>
      )}
    </div>
  );
}