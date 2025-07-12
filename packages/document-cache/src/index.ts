import {
  DocumentFile,
  CachedDocument,
  CacheProvider,
  ProcessorFunction,
} from './types';
import { db } from '@textsculpt/firebase';
import { storage } from '@textsculpt/firebase';
import { ref as dbRef, set as dbSet, get as dbGet } from 'firebase/database';
import { ref as storageRef, uploadString, getDownloadURL } from 'firebase/storage';

const MAX_DB_SIZE = 100 * 1024; // 100 KB

export type GetDocumentResult = {
  content: string;
  status: 'new' | 'cached-db' | 'cached-storage';
};

/**
 * Retrieves a document, using a cache to avoid reprocessing.
 * This is the core function of the document-cache service.
 *
 * @param file The source file to get.
 * @param provider The cache provider to use (e.g., Firebase).
 * @param process The function to run if the file is not in the cache.
 * @returns The processed content of the document.
 */
export async function getDocument(
  file: DocumentFile,
  provider: CacheProvider,
  process: ProcessorFunction
): Promise<string> {
  // 1. Check the cache
  const cachedDoc = await provider.get(file.id);

  // 2. Cache Hit: Check if the source file is the same version
  if (cachedDoc && cachedDoc.sourceLastModified === file.lastModified) {
    console.log('Cache hit: Loading from cache.');
    // Update last accessed time (fire and forget)
    provider.set(file.id, { ...cachedDoc, lastAccessed: Date.now() });
    return cachedDoc.processedContent;
  }

  // 3. Cache Miss: Process the file
  console.log('Cache miss or outdated: Processing file.');
  const processedContent = await process(file.data);

  // 4. Store the new version in the cache
  const newCachedDoc: CachedDocument = {
    processedContent,
    sourceLastModified: file.lastModified,
    lastAccessed: Date.now(),
  };
  await provider.set(file.id, newCachedDoc);

  return newCachedDoc.processedContent;
}

/**
 * Caches processed HTML: stores in Realtime Database if <100KB, otherwise uploads to Storage and stores the URL.
 * @param docId The document ID (should already be sanitized/encoded)
 * @param html The processed HTML string
 * @returns The storage location: { type: 'db', path } or { type: 'storage', url }
 */
export async function cacheProcessedDocument(docId: string, html: string): Promise<{ type: 'db', path: string } | { type: 'storage', url: string }> {
  const sizeInBytes = new TextEncoder().encode(html).length;
  console.log('[cacheProcessedDocument] docId:', docId, 'size:', sizeInBytes, 'bytes');

  if (sizeInBytes < MAX_DB_SIZE) {
    // Store in Realtime Database
    const path = `processedDocuments/${docId}`;
    console.log('[cacheProcessedDocument] Storing in Realtime Database at path:', path);
    try {
      await dbSet(dbRef(db, path), {
        html,
        lastProcessed: Date.now(),
      });
      console.log('[cacheProcessedDocument] Successfully stored in DB');
    } catch (err) {
      console.error('[cacheProcessedDocument] Error storing in DB:', err);
      throw err;
    }
    return { type: 'db', path };
  } else {
    // Store in Firebase Storage
    const storagePath = `processed/${docId}.html`;
    const sRef = storageRef(storage, storagePath);
    console.log('[cacheProcessedDocument] Uploading to Storage at path:', storagePath);
    try {
      await uploadString(sRef, html, 'raw');
      console.log('[cacheProcessedDocument] Upload complete, getting download URL...');
      const url = await getDownloadURL(sRef);
      console.log('[cacheProcessedDocument] Download URL:', url);
      // Overwrite the DB node with only htmlUrl and lastProcessed
      const path = `processedDocuments/${docId}`;
      await dbSet(dbRef(db, path), {
        htmlUrl: url,
        lastProcessed: Date.now(),
      });
      console.log('[cacheProcessedDocument] Reference stored in DB at path:', path);
      return { type: 'storage', url };
    } catch (err) {
      console.error('[cacheProcessedDocument] Error uploading to Storage or storing reference in DB:', err);
      throw err;
    }
  }
}

/**
 * Loads a processed document and returns its content and cache status.
 * @param docId The document ID (should already be sanitized/encoded)
 * @returns { content, status }
 */
export async function getDocumentWithStatus(docId: string): Promise<GetDocumentResult> {
  const path = `processedDocuments/${docId}`;
  const snapshot = await dbGet(dbRef(db, path));
  if (snapshot.exists()) {
    const data = snapshot.val() as any;
    if (data.html) {
      return { content: data.html, status: 'cached-db' };
    } else if (data.htmlUrl) {
      const response = await fetch(data.htmlUrl);
      const html = await response.text();
      return { content: html, status: 'cached-storage' };
    }
  }
  return { content: '', status: 'new' };
}

export * from './types';
export * from './firebase-provider'; 