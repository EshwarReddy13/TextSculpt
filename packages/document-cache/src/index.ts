import {
  DocumentFile,
  CachedDocument,
  CacheProvider,
  ProcessorFunction,
} from './types';

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

export * from './types';
export * from './firebase-provider'; 