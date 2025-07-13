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

// Retry configuration for Firebase operations
const RETRY_CONFIG = {
  maxRetries: 3,
  baseDelay: 500,
  maxDelay: 5000,
};

export type GetDocumentResult = {
  content: string;
  status: 'new' | 'cached-db' | 'cached-storage';
};

// Exponential backoff with jitter for retries
const getRetryDelay = (retryCount: number): number => {
  const delay = Math.min(
    RETRY_CONFIG.baseDelay * Math.pow(2, retryCount),
    RETRY_CONFIG.maxDelay
  );
  const jitter = delay * 0.2 * (Math.random() - 0.5);
  return delay + jitter;
};

// Retry wrapper for Firebase operations
const withRetry = async <T>(
  operation: () => Promise<T>,
  operationName: string,
  maxRetries: number = RETRY_CONFIG.maxRetries
): Promise<T> => {
  let lastError: Error;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;
      console.warn(`[${operationName}] Attempt ${attempt + 1} failed:`, error);
      
      if (attempt === maxRetries) {
        console.error(`[${operationName}] All ${maxRetries + 1} attempts failed`);
        throw lastError;
      }
      
      const delay = getRetryDelay(attempt);
      console.log(`[${operationName}] Retrying in ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError!;
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
    // Store in Realtime Database with retry
    const path = `processedDocuments/${docId}`;
    console.log('[cacheProcessedDocument] Storing in Realtime Database at path:', path);
    
    return await withRetry(async () => {
      await dbSet(dbRef(db, path), {
        html,
        lastProcessed: Date.now(),
      });
      console.log('[cacheProcessedDocument] Successfully stored in DB');
      return { type: 'db' as const, path };
    }, 'cacheProcessedDocument-DB');
  } else {
    // Store in Firebase Storage with retry
    const storagePath = `processed/${docId}.html`;
    const sRef = storageRef(storage, storagePath);
    console.log('[cacheProcessedDocument] Uploading to Storage at path:', storagePath);
    
    return await withRetry(async () => {
      await uploadString(sRef, html, 'raw');
      console.log('[cacheProcessedDocument] Upload complete, getting download URL...');
      const url = await getDownloadURL(sRef);
      console.log('[cacheProcessedDocument] Download URL:', url);
      
      // Store reference in DB
      const path = `processedDocuments/${docId}`;
      await dbSet(dbRef(db, path), {
        htmlUrl: url,
        lastProcessed: Date.now(),
      });
      console.log('[cacheProcessedDocument] Reference stored in DB at path:', path);
      return { type: 'storage' as const, url };
    }, 'cacheProcessedDocument-Storage');
  }
}

/**
 * Loads a processed document and returns its content and cache status.
 * @param docId The document ID (should already be sanitized/encoded)
 * @returns { content, status }
 */
export async function getDocumentWithStatus(docId: string): Promise<GetDocumentResult> {
  const path = `processedDocuments/${docId}`;
  
  return await withRetry(async () => {
    const snapshot = await dbGet(dbRef(db, path));
    if (snapshot.exists()) {
      const data = snapshot.val() as any;
      if (data.html) {
        return { content: data.html, status: 'cached-db' as const };
      } else if (data.htmlUrl) {
        const response = await fetch(data.htmlUrl);
        if (!response.ok) {
          throw new Error(`Failed to fetch from storage: ${response.status} ${response.statusText}`);
        }
        const html = await response.text();
        return { content: html, status: 'cached-storage' as const };
      }
    }
    return { content: '', status: 'new' as const };
  }, 'getDocumentWithStatus');
}

export type { 
  DocumentFile, 
  CachedDocument, 
  CacheProvider, 
  ProcessorFunction 
};

export * from './types';
export * from './firebase-provider'; 