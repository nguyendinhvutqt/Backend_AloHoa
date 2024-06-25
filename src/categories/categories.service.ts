import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Category } from '@prisma/client';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { CreateCategoryDto } from 'src/dtos/category/create.dto';
import { UpdateCategoryDto } from 'src/dtos/category/update.dto';
import { PaginationDto } from 'src/dtos/pagination/pagination.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class CategoriesService {
  constructor(
    private prismaService: PrismaService,
    private cloudinaryService: CloudinaryService,
  ) {}

  async findAll(): Promise<Category[] | null> {
    const categories = this.prismaService.category.findMany();
    return categories;
  }

  async findAllAndPagination(dto: PaginationDto): Promise<any> {
    const { page = 1, take = 5, searchValue = '' } = dto;

    const totalCategory = await this.prismaService.category.findMany({
      where: {
        name: {
          contains: searchValue.toLowerCase(),
        },
      },
    });

    const totalPage = Math.ceil(totalCategory.length / +take);

    const categories = await this.prismaService.category.findMany({
      where: {
        name: {
          contains: searchValue.toLowerCase(),
        },
      },
      take: +take,
      skip: (+page - 1) * +take,
    });

    return {
      totalPage: totalPage,
      totalCategory: totalCategory,
      currentPage: page,
      limit: take,
      categories: categories,
    };
  }

  async findById(categoryId: string): Promise<Category | null> {
    const category = await this.prismaService.category.findFirst({
      where: {
        id: categoryId,
      },
    });
    return category;
  }

  async findAllByName(name: string): Promise<Category[] | null> {
    const categories = await this.prismaService.category.findMany({
      where: {
        name: {
          contains: name.toLowerCase(), // Tùy chọn để không phân biệt chữ hoa chữ thường
        },
      },
    });
    return categories;
  }

  async findByName(name: string): Promise<Category | null> {
    const category = await this.prismaService.category.findFirst({
      where: {
        name: name,
      },
    });
    return category;
  }

  async create(dto: CreateCategoryDto): Promise<any> {
    // check name category exist
    const checkExistName = await this.findByName(dto.name);
    if (checkExistName) {
      throw new HttpException(
        'Tên danh mục đã tồn tại',
        HttpStatus.BAD_REQUEST,
      );
    }

    // create new category
    const newCategory = await this.prismaService.category.create({
      data: {
        name: dto.name,
      },
    });

    return newCategory;
  }

  async update(dto: UpdateCategoryDto): Promise<Category> {
    const findCategory = await this.findById(dto.id);
    if (!findCategory) {
      throw new HttpException('Danh mục không tồn tại', HttpStatus.BAD_REQUEST);
    }
    const updateCategory = await this.prismaService.category.update({
      where: {
        id: dto.id,
      },
      data: {
        name: dto.name,
      },
    });
    return updateCategory;
  }

  async remove(categoryId: string): Promise<null> {
    // find category
    const category = await this.findById(categoryId);
    if (!category) {
      throw new HttpException('Danh mục không tồn tại', HttpStatus.BAD_REQUEST);
    }

    // remove category on db
    await this.prismaService.category.delete({
      where: {
        id: categoryId,
      },
    });

    // remove image on cloudinary
    // await this.cloudinaryService.deleteImage(category.imagePublicId);

    return null;
  }
}
