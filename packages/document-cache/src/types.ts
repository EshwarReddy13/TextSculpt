export interface DocumentFile {
  id: string;
  lastModified: number;
  data: File;
}

export interface CachedDocument {
  sourceLastModified: number;
  lastAccessed: number;
  processedContent: string;
}

export interface CacheProvider {
  get(id: string): Promise<CachedDocument | null>;
  set(id:string, doc: CachedDocument): Promise<void>;
}

export type ProcessorFunction = (file: File) => Promise<string>; 