import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  async create(createProductDto: CreateProductDto) {
    const { categories, ...data } = createProductDto;

    // if categories not exist in category
    const existingCategories = await this.prisma.category.findMany({
      where: {
        id: {
          in: categories,
        },
      },
    });

    if (existingCategories.length !== categories.length) {
      throw new BadRequestException('Category not found');
    }

    const product = await this.prisma.product.create({
      data: {
        ...data,
        categories: {
          create: categories.map((category) => ({
            category: {
              connect: {
                id: category,
              },
            },
          })),
        },
      },
    });

    return product;
  }

  async findAll(offset: number = 0, limit: number = 10, keyword: string = '') {
    const totalRecordCount = await this.prisma.product.count({
      where: {
        OR: [
          { name: { contains: keyword, mode: 'insensitive' } },
          { description: { contains: keyword, mode: 'insensitive' } },
        ],
      },
    });

    const products = await this.prisma.product.findMany({
      skip: offset,
      take: limit,
      where: {
        OR: [
          { name: { contains: keyword, mode: 'insensitive' } },
          { description: { contains: keyword, mode: 'insensitive' } },
        ],
      },
    });

    const pageNumber = Math.ceil((offset + 1) / limit);
    const pageSize = limit;

    return {
      page_number: pageNumber,
      page_size: pageSize,
      total_record_count: totalRecordCount,
      products: products,
    };
  }

  async findOne(id: string) {
    return await this.prisma.product.findFirst({
      where: {
        id: id,
      },
      include: {
        categories: true,
      },
    });
  }

  async update(id: string, updateProductDto: UpdateProductDto) {
    const { categories, ...data } = updateProductDto;

    if (categories === undefined || categories.length === 0) {
      return await this.prisma.product.update({
        where: {
          id: id,
        },
        data: {
          ...data,
        },
      });
    }

    const existingCategories = await this.prisma.category.findMany({
      where: {
        id: {
          in: categories,
        },
      },
    });

    if (existingCategories.length !== categories.length) {
      throw new BadRequestException('Category not found');
    }

    const product = await this.prisma.product.update({
      where: {
        id: id,
      },
      data: {
        ...data,
        categories: {
          set: categories.map((category) => ({
            product_id_category_id: {
              category_id: category,
              product_id: id,
            },
          })),
        },
      },
    });

    return product;
  }

  async remove(id: string) {
    return await this.prisma.product.delete({
      where: {
        id: id,
      },
    });
  }
}
