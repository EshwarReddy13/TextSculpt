'use client';

import React from 'react';
import { UserPresence } from './UserPresence';
import { EditorToolbar } from './EditorToolbar';
import { EditorUser } from '../types';

interface EditorHeaderProps {
  users: EditorUser[];
  onInvite: () => void;
  documentName: string;
}

export const EditorHeader = ({ users, onInvite, documentName }: EditorHeaderProps) => {
  return (
    <div className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-20">
      <div className="px-4 py-2 flex items-center justify-between border-b border-gray-200 dark:border-gray-700">
        <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100 truncate">
          {documentName}
        </h1>
        <UserPresence users={users} onInvite={onInvite} />
      </div>
      <EditorToolbar />
    </div>
  );
}; 