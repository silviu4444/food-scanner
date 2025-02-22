import { JwtGuard } from '@/authentication/guards/jwt-auth.guard';
import { RequestWithJwtUser } from '@/authentication/interfaces/auth.interfaces';
import { PropertyTypeDto } from '@/common/interfaces/property.interfaces';
import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  ParseUUIDPipe,
  Post,
  Put,
  Query,
  Req,
  UseGuards
} from '@nestjs/common';
import { CreateUpdatePropertyClassValidator } from './dto/create-update-property.dto';
import { DrawToSearchDtoClassValidator } from './dto/draw-to-search.dto';
import { CreateUpdatePropertyService } from './services/create-update-property.service';
import { PropertySearchingService } from './services/property-searching.service';

@Controller('properties')
export class PropertyController {
  constructor(
    private readonly createUpdatePropertyService: CreateUpdatePropertyService,
    private readonly propertySearchingService: PropertySearchingService
  ) {}

  @UseGuards(JwtGuard)
  @Post('add')
  async createProperty(
    @Req() req: RequestWithJwtUser,
    @Body() dto: CreateUpdatePropertyClassValidator
  ) {
    return this.createUpdatePropertyService.addProperty({
      user_id: req.user.id,
      data: dto.data
    });
  }

  @UseGuards(JwtGuard)
  @Put('update')
  async updateProperty(
    @Req() req: RequestWithJwtUser,
    @Body() dto: CreateUpdatePropertyClassValidator
  ) {
    return this.createUpdatePropertyService.updateProperty({
      user_id: req.user.id,
      data: dto.data
    });
  }

  @Get(':id')
  async getPropertyById(
    @Param('id', new ParseUUIDPipe()) propertyId: string
  ): Promise<PropertyTypeDto> {
    return this.propertySearchingService.getPropertyByIdDtoMapped(propertyId);
  }

  @Post('draw-to-search')
  @HttpCode(HttpStatus.OK)
  async drawToSearch(@Body() dto: DrawToSearchDtoClassValidator) {
    return this.propertySearchingService.drawToSearch(dto.data);
  }

  @Post('draw-to-search/previews')
  @HttpCode(HttpStatus.OK)
  async previewPropertiesByCoordinates(
    @Query('page', new ParseIntPipe()) page: number,
    @Body() dto: DrawToSearchDtoClassValidator
  ) {
    return this.propertySearchingService.previewPropertiesByCoordinates(
      page,
      dto.data
    );
  }
}
