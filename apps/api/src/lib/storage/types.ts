import type { UploadCategory } from '@portofolio/shared';

export interface StoredFileRead {
  body: Uint8Array;
  contentType: string;
  size: number;
}

export interface StorageAdapter {
  save(params: {
    category: UploadCategory;
    body: Uint8Array;
    ext: string;
    contentType: string;
  }): Promise<string>;
  read(key: string): Promise<StoredFileRead | null>;
  delete(key: string): Promise<void>;
  getPublicUrl(key: string): string;
}
