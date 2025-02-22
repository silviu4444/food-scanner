import { CloudinaryModule } from '@/providers/cloudinary';
import { Module } from '@nestjs/common';
import { PhotoController } from './photo.controller';
import { PhotoService } from './photo.service';

@Module({
  imports: [CloudinaryModule],
  controllers: [PhotoController],
  providers: [PhotoService]
})
export class PhotoModule {}
