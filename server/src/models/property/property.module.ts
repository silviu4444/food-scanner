import { PrismaService } from '@/prisma.service';
import { CloudinaryModule } from '@/providers/cloudinary';
import { Module } from '@nestjs/common';
import { PropertyController } from './property.controller';
import { CreateUpdatePropertyService } from './services/create-update-property.service';
import { PropertyLocationService } from './services/property-location.service';
import { PropertySearchingService } from './services/property-searching.service';

@Module({
  imports: [CloudinaryModule],
  controllers: [PropertyController],
  providers: [
    PropertyLocationService,
    CreateUpdatePropertyService,
    PropertySearchingService,
    PrismaService
  ]
})
export class PropertyModule {}
