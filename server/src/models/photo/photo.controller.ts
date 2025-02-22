import { Controller, Get } from '@nestjs/common';
import { PhotoUploadSignature } from './interfaces/photo-upload.interfaces';
import { PhotoService } from './photo.service';

@Controller('photos')
export class PhotoController {
  constructor(private readonly photoService: PhotoService) {}

  @Get('signature')
  async getUploadSignature(): Promise<PhotoUploadSignature> {
    return this.photoService.getSignatures();
  }
}
