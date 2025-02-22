import { CloudinaryService } from '@/providers/cloudinary';
import { Injectable } from '@nestjs/common';
import { PhotoUploadSignature } from './interfaces/photo-upload.interfaces';

@Injectable()
export class PhotoService {
  constructor(private cloudinaryService: CloudinaryService) {}

  getSignatures(): Promise<PhotoUploadSignature> {
    return this.cloudinaryService.getSignature();
  }
}
