import type { ApiEnv } from '../../env.js';
import { LocalDiskStorageAdapter } from './local.js';
import { S3StorageAdapter } from './s3.js';
import type { StorageAdapter } from './types.js';

export type { StorageAdapter, StoredFileRead } from './types.js';
export { LocalDiskStorageAdapter } from './local.js';
export { S3StorageAdapter } from './s3.js';

export function createStorageAdapter(env: ApiEnv): StorageAdapter {
  if (env.STORAGE_DRIVER === 's3') {
    if (!env.S3_BUCKET || !env.S3_ACCESS_KEY_ID || !env.S3_SECRET_ACCESS_KEY || !env.S3_PUBLIC_BASE_URL) {
      throw new Error(
        'STORAGE_DRIVER=s3 requires S3_BUCKET, S3_ACCESS_KEY_ID, S3_SECRET_ACCESS_KEY, and S3_PUBLIC_BASE_URL'
      );
    }
    return new S3StorageAdapter({
      endpoint: env.S3_ENDPOINT,
      region: env.S3_REGION,
      bucket: env.S3_BUCKET,
      accessKeyId: env.S3_ACCESS_KEY_ID,
      secretAccessKey: env.S3_SECRET_ACCESS_KEY,
      publicBaseUrl: env.S3_PUBLIC_BASE_URL
    });
  }

  return new LocalDiskStorageAdapter(env.LOCAL_UPLOAD_DIR);
}
