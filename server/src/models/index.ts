import { Module } from '@nestjs/common';
import { PhotoModule } from './photo/photo.module';
import { PropertyModule } from './property/property.module';
import { UserModule } from './user/user.module';

@Module({
  imports: [PropertyModule, UserModule, PhotoModule],
  exports: [PropertyModule, UserModule, PhotoModule]
})
export class ModelsModule {}
