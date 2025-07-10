"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import { auth } from "../firebase/config";
import BlockEditor from '@textsculpt/editor';
import { EditorUser } from '@textsculpt/editor';
import { DocumentFile } from '@textsculpt/document-cache';

const mockUser: EditorUser = {
  id: 'user-123',
  name: 'Demo User',
};

export default function WebAppPage() {
  const [documentFile, setDocumentFile] = useState<DocumentFile | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
      if (!firebaseUser) {
        router.replace("/login");
      }
    });
    return () => unsubscribe();
  }, [router]);

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

  const handleLogout = async () => {
    await signOut(auth);
    router.replace("/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
        <span className="text-gray-700 dark:text-gray-200">Loading...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <header className="flex flex-col md:flex-row items-center justify-between p-6 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800">
        <div>
          <h1 className="text-3xl font-bold">TextSculpt Demo</h1>
          <p className="text-gray-600 dark:text-gray-300">A demonstration of the all-in-one BlockEditor component.</p>
        </div>
        {user && (
          <div className="flex items-center gap-4 mt-4 md:mt-0">
            <span className="font-medium">{user.displayName || user.email}</span>
            <button
              onClick={handleLogout}
              className="bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-100 px-4 py-2 rounded transition"
            >
              Logout
            </button>
          </div>
        )}
      </header>
      <main className="container mx-auto p-8">
        {!documentFile ? (
          <div className="p-6 border-2 border-dashed rounded-lg bg-white dark:bg-gray-800">
            <h2 className="text-xl font-semibold mb-4">Upload a Document</h2>
            <p className="mb-4 text-gray-700 dark:text-gray-300">
              Select a `.docx` file to see the editor in action. The editor will
              handle all the caching and processing internally.
            </p>
            <input type="file" accept=".docx" onChange={handleFileChange} className="file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
          </div>
        ) : (
          <div>
            <BlockEditor file={documentFile} user={mockUser} />
          </div>
        )}
      </main>
    </div>
  );
}