import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Product } from '@prisma/client';
import { CategoriesService } from 'src/categories/categories.service';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { PaginationDto } from 'src/dtos/pagination/pagination.dto';
import { CreateProductDto } from 'src/dtos/product/create.dto';
import { SearchProductByPrice } from 'src/dtos/product/searchPrice.dto';
import { UpdateProductDto } from 'src/dtos/product/update.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ProductsService {
  constructor(
    private readonly prismaService: PrismaService,
    private cloudinaryService: CloudinaryService,
    private readonly categoriesService: CategoriesService,
  ) {}

  async create(
    dto: CreateProductDto,
    file: Express.Multer.File,
  ): Promise<Product> {
    // check name product exist
    const checkProductExist = await this.findByName(dto.name);
    if (checkProductExist) {
      throw new HttpException(
        'Tên sản phẩm đã tồn tại',
        HttpStatus.BAD_REQUEST,
      );
    }

    // check price > 0
    if (+dto.price <= 0) {
      throw new HttpException(
        'Giá sản phẩm phải lớn hơn 0',
        HttpStatus.BAD_REQUEST,
      );
    }

    // check categoryId exist
    const checkCategoryExist = await this.categoriesService.findById(
      dto.categoryId,
    );

    if (!checkCategoryExist) {
      throw new HttpException('Danh mục không tồn tại', HttpStatus.BAD_REQUEST);
    }

    // create products on cloudinary
    await this.cloudinaryService.createFolder('products');

    // upload hình ảnh lên cloudinary
    const uploadFile = await this.cloudinaryService.uploadFile(
      'products',
      file,
    );

    // create new product
    const newProduct = await this.prismaService.product.create({
      data: {
        name: dto.name,
        description: dto.description,
        quantity: 10,
        price: +dto.price,
        imageUrl: uploadFile.url,
        imagePublicId: uploadFile.public_id,
        categoryId: dto.categoryId,
      },
    });

    return newProduct;
  }

  async findAllAndPagination(dto: PaginationDto): Promise<any> {
    const { page = 1, take = 5, searchValue = '' } = dto;

    const totalProduct = await this.prismaService.product.findMany({
      where: {
        name: {
          contains: searchValue.toLowerCase(),
        },
      },
    });

    const totalPage = Math.ceil(totalProduct.length / +take);

    const products = await this.prismaService.product.findMany({
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
      totalProduct: totalProduct,
      currentPage: page,
      limit: take,
      products: products,
    };
  }

  async search(name: string): Promise<Product[] | null> {
    const products = await this.prismaService.product.findMany({
      where: {
        name: {
          contains: name.toLowerCase(), // Tùy chọn để không phân biệt chữ hoa chữ thường
        },
      },
    });
    return products;
  }

  async findByPrice(dto: SearchProductByPrice): Promise<Product[]> {
    const products = await this.prismaService.product.findMany({
      where: {
        price: {
          gte: dto.minPrice,
          lte: dto.maxPrice,
        },
      },
    });
    return products;
  }

  async findByName(name: string): Promise<Product | null> {
    const product = await this.prismaService.product.findFirst({
      where: {
        name: name,
      },
    });
    return product;
  }

  async findByCategoryId(categoryId: string): Promise<Product[] | null> {
    const products = await this.prismaService.product.findMany({
      where: {
        categoryId: categoryId,
      },
    });
    return products;
  }

  async findAll(): Promise<Product[] | null> {
    const products = await this.prismaService.product.findMany();
    return products;
  }

  async findById(id: string): Promise<Product | null> {
    const product = await this.prismaService.product.findFirst({
      where: {
        id: id,
      },
    });
    return product;
  }

  async update(productId: string, dto: UpdateProductDto) {
    // find product
    const product = await this.findById(productId);
    if (!product) {
      throw new HttpException('Sản phẩm không tồn tại', HttpStatus.BAD_REQUEST);
    }

    //update product
    const updateProduct = await this.prismaService.product.update({
      where: {
        id: productId,
      },
      data: {
        name: dto.name,
        description: dto.description,
        price: +dto.price,
        categoryId: dto.categoryId,
      },
    });

    return updateProduct;
  }

  async remove(productId: string): Promise<null> {
    // find product
    const product = await this.findById(productId);
    if (!product) {
      throw new HttpException('Danh mục không tồn tại', HttpStatus.BAD_REQUEST);
    }

    // remove product on db
    await this.prismaService.product.delete({
      where: {
        id: productId,
      },
    });

    // remove image on cloudinary
    await this.cloudinaryService.deleteImage(product.imagePublicId);

    return null;
  }
}
