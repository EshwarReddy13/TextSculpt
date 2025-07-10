import { DocumentFile } from '@textsculpt/document-cache';

export interface EditorUser {
  id: string;
  name: string;
  avatarUrl?: string;
}

export interface BlockEditorProps {
  user: EditorUser;
  file: DocumentFile;
} 