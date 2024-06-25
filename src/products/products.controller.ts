import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  UploadedFile,
  HttpStatus,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { CreateProductDto } from 'src/dtos/product/create.dto';
import { SearchProductByPrice } from 'src/dtos/product/searchPrice.dto';
import { UpdateProductDto } from 'src/dtos/product/update.dto';
import { PaginationDto } from 'src/dtos/pagination/pagination.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/roles.guard';
import { Roles } from 'src/auth/roles.decorator';
import { Role } from 'src/enums/role.enum';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin)
  @UseInterceptors(FileInterceptor('file'))
  @Post('create')
  async create(
    @Body() dto: CreateProductDto,
    @UploadedFile()
    file: Express.Multer.File,
  ) {
    const res = await this.productsService.create(dto, file);
    return {
      status: HttpStatus.CREATED,
      message: 'Tạo mới sản phẩm thành công',
      data: res,
    };
  }

  @Get('search/:name')
  async search(@Param('name') name: string) {
    const res = await this.productsService.search(name);
    return { status: HttpStatus.OK, message: null, data: res };
  }

  @Get('pagination')
  async findAllAndPagination(@Query() dto: PaginationDto) {
    const res = await this.productsService.findAllAndPagination(dto);
    return { status: HttpStatus.OK, message: null, data: res };
  }

  @Get('findAll')
  async findAll() {
    const res = await this.productsService.findAll();
    return { status: HttpStatus.OK, message: null, data: res };
  }

  @Get('findByCategoryId/:categoryId')
  async findByCategoryId(@Param('categoryId') categoryId: string) {
    const res = await this.productsService.findByCategoryId(categoryId);
    return { status: HttpStatus.OK, message: null, data: res };
  }

  @Get('findById/:id')
  async findById(@Param('id') id: string) {
    const res = await this.productsService.findById(id);
    return { status: HttpStatus.OK, message: null, data: res };
  }

  @Post('searchByPrice')
  async findByPrice(@Body() dto: SearchProductByPrice) {
    const res = await this.productsService.findByPrice(dto);
    return { status: HttpStatus.OK, message: null, data: res };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin)
  @Patch('update/:id')
  async update(@Param('id') id: string, @Body() dto: UpdateProductDto) {
    const res = await this.productsService.update(id, dto);
    return {
      status: HttpStatus.OK,
      message: 'Cập nhật sản phẩm thành công',
      data: res,
    };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin)
  @Delete('delete/:id')
  async remove(@Param('id') id: string) {
    const res = await this.productsService.remove(id);
    return {
      status: HttpStatus.OK,
      message: 'Xoá sản phẩm thành công',
      data: res,
    };
  }
}
