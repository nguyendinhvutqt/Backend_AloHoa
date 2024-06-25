import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from 'src/dtos/category/create.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/roles.guard';
import { Roles } from 'src/auth/roles.decorator';
import { Role } from 'src/enums/role.enum';
import { PaginationDto } from 'src/dtos/pagination/pagination.dto';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  async findAll() {
    const res = await this.categoriesService.findAll();
    return { status: HttpStatus.OK, message: null, data: res };
  }

  @Get('pagination')
  async findAffAndPagination(@Query() dto: PaginationDto) {
    const res = await this.categoriesService.findAllAndPagination(dto);
    return { status: HttpStatus.OK, message: null, data: res };
  }

  @Post('findByName')
  async findByName(@Body() dto: { name: string }) {
    const res = await this.categoriesService.findAllByName(dto.name);
    return { status: HttpStatus.OK, message: null, data: res };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin)
  @Post()
  async create(@Body() dto: CreateCategoryDto) {
    const res = await this.categoriesService.create(dto);
    return {
      status: HttpStatus.CREATED,
      message: 'Tạo mới danh mục thành công',
      data: res,
    };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin)
  @Patch('/update/:id')
  async update(@Body() dto: { name: string }, @Param('id') id: string) {
    const res = await this.categoriesService.update({ id: id, name: dto.name });
    return {
      status: HttpStatus.OK,
      message: 'Cập nhật danh mục thành công',
      data: res,
    };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin)
  @Delete(':id')
  async remove(@Param('id') id: any) {
    const res = await this.categoriesService.remove(id);
    return {
      status: HttpStatus.OK,
      message: 'Xoá danh mục thành công',
      data: res,
    };
  }
}
