import { useState, useEffect, useCallback, useMemo } from 'react';
import { DocumentFile } from '@textsculpt/document-cache';
import { getDocumentWithStatus, cacheProcessedDocument } from '@textsculpt/document-cache';
import { encodeForFirebase } from '@textsculpt/document-cache/src/encoding';
import { processDocx } from '@textsculpt/processors';
import { 
  LoadingState, 
  CacheStatus, 
  PerformanceMetrics, 
  ProcessingError, 
  DocumentResult 
} from '../types';

interface UseDocumentProcessingProps {
  file: DocumentFile | null;
  isClient: boolean;
}

export interface UseDocumentProcessingReturn {
  content: string;
  loadingState: LoadingState;
  cacheStatus: CacheStatus;
  metrics: PerformanceMetrics;
  error: ProcessingError | null;
  retry: () => void;
}

// Retry configuration
const RETRY_CONFIG = {
  maxRetries: 3,
  baseDelay: 1000, // 1 second
  maxDelay: 10000, // 10 seconds
};

// Exponential backoff with jitter
const getRetryDelay = (retryCount: number): number => {
  const delay = Math.min(
    RETRY_CONFIG.baseDelay * Math.pow(2, retryCount),
    RETRY_CONFIG.maxDelay
  );
  // Add jitter (±20%)
  const jitter = delay * 0.2 * (Math.random() - 0.5);
  return delay + jitter;
};

export const useDocumentProcessing = ({ 
  file, 
  isClient 
}: UseDocumentProcessingProps): UseDocumentProcessingReturn => {
  const [content, setContent] = useState<string>('');
  const [loadingState, setLoadingState] = useState<LoadingState>('idle');
  const [cacheStatus, setCacheStatus] = useState<CacheStatus>('new');
  const [metrics, setMetrics] = useState<PerformanceMetrics>({});
  const [error, setError] = useState<ProcessingError | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  // Memoized file key for dependency tracking
  const fileKey = useMemo(() => {
    if (!file) return null;
    return `${file.id}-${file.lastModified}`;
  }, [file?.id, file?.lastModified]);

  // Reset state when file changes
  useEffect(() => {
    if (!file || !isClient) {
      setContent('');
      setLoadingState('idle');
      setCacheStatus('new');
      setMetrics({});
      setError(null);
      setRetryCount(0);
      return;
    }
  }, [fileKey, isClient]);

  // Main document processing logic
  const processDocument = useCallback(async (): Promise<void> => {
    if (!file || !isClient) return;

    const totalStart = performance.now();
    setLoadingState('loading-cached');
    setError(null);

    try {
      // Start cache retrieval and file processing in parallel
      const retrieveStart = performance.now();
      const cachePromise = getDocumentWithStatus(encodeForFirebase(file.id));
      
      // Start processing in parallel (optimistic)
      const processStart = performance.now();
      const processPromise = processDocx(file.data);

      // Wait for cache result first (faster path)
      const { content: cachedContent, status } = await cachePromise;
      const retrieveEnd = performance.now();

      if (status !== 'new') {
        // Cache hit - show content immediately
        setContent(cachedContent);
        setCacheStatus(status);
        setLoadingState('idle');
        setMetrics({
          retrieve: retrieveEnd - retrieveStart,
          total: performance.now() - totalStart,
        });
        console.log('[useDocumentProcessing] Cache hit, loaded immediately');
        return;
      }

      // Cache miss - continue with processing
      setLoadingState('processing-background');
      console.log('[useDocumentProcessing] Cache miss, processing in background');

      try {
        const processedContent = await processPromise;
        const processEnd = performance.now();

        // Update content immediately when processing completes
        setContent(processedContent);
        setCacheStatus('new');
        setLoadingState('caching');

        // Cache the result in background
        try {
          const cacheStart = performance.now();
          await cacheProcessedDocument(encodeForFirebase(file.id), processedContent);
          const cacheEnd = performance.now();

          setMetrics({
            process: processEnd - processStart,
            cache: cacheEnd - cacheStart,
            retrieve: retrieveEnd - retrieveStart,
            total: performance.now() - totalStart,
          });
          setLoadingState('idle');
          console.log('[useDocumentProcessing] Processing and caching completed');
        } catch (cacheErr) {
          console.error('[useDocumentProcessing] Caching failed:', cacheErr);
          // Don't fail the whole operation if caching fails
          setMetrics({
            process: processEnd - processStart,
            retrieve: retrieveEnd - retrieveStart,
            total: performance.now() - totalStart,
          });
          setLoadingState('idle');
        }
      } catch (processErr) {
        console.error('[useDocumentProcessing] Processing failed:', processErr);
        throw {
          type: 'processing' as const,
          message: 'Failed to process document',
          retryable: true,
          retryCount,
        };
      }
    } catch (err) {
      console.error('[useDocumentProcessing] Operation failed:', err);
      const processingError: ProcessingError = {
        type: 'processing',
        message: err instanceof Error ? err.message : 'Unknown error occurred',
        retryable: retryCount < RETRY_CONFIG.maxRetries,
        retryCount,
      };
      setError(processingError);
      setLoadingState('error');
    }
  }, [file, isClient, retryCount]);

  // Retry mechanism
  const retry = useCallback(async (): Promise<void> => {
    if (retryCount >= RETRY_CONFIG.maxRetries) {
      console.warn('[useDocumentProcessing] Max retries exceeded');
      return;
    }

    const newRetryCount = retryCount + 1;
    setRetryCount(newRetryCount);
    setError(null);

    // Exponential backoff
    const delay = getRetryDelay(newRetryCount);
    console.log(`[useDocumentProcessing] Retrying in ${delay}ms (attempt ${newRetryCount})`);
    
    setTimeout(() => {
      processDocument();
    }, delay);
  }, [retryCount, processDocument]);

  // Main effect to trigger processing
  useEffect(() => {
    if (!file || !isClient) return;

    processDocument();
  }, [fileKey, isClient, processDocument]);

  return {
    content,
    loadingState,
    cacheStatus,
    metrics,
    error,
    retry,
  };
}; 