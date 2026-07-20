import { SupabaseClient } from '@supabase/supabase-js';
import { BaseError } from '../utils/errors';

export class StorageProvider {
  constructor(private supabase: SupabaseClient, private bucketName: string) {}

  async createPresignedUrl(filePath: string, expiresIn = 60) {
    const { data, error } = await this.supabase
      .storage
      .from(this.bucketName)
      .createSignedUrl(filePath, expiresIn);

    if (error) {
      throw new BaseError('Failed to generate presigned URL', 500, 'STORAGE_ERROR', error.message);
    }
    return data.signedUrl;
  }

  async removeFile(filePath: string) {
    const { error } = await this.supabase
      .storage
      .from(this.bucketName)
      .remove([filePath]);

    if (error) {
      throw new BaseError('Failed to delete file', 500, 'STORAGE_ERROR', error.message);
    }
  }
}
