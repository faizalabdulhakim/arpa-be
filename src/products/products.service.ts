import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  async create(createProductDto: CreateProductDto, file: Express.Multer.File) {
    const { categories, ...data } = createProductDto;
    const categoryIds = Array.isArray(categories) ? categories : [categories];

    // if categories not exist in category
    const existingCategories = await this.prisma.category.findMany({
      where: {
        id: {
          in: categoryIds,
        },
      },
    });

    const imagePath = file.filename;

    if (existingCategories.length !== categoryIds.length) {
      throw new BadRequestException('Category not found');
    }

    try {
      const product = await this.prisma.product.create({
        data: {
          ...data,
          image: imagePath,
          categories: {
            create: categoryIds.map((categoryId) => ({
              category: {
                connect: {
                  id: categoryId,
                },
              },
            })),
          },
        },
      });
      return product;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
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
      skip: +offset || 0,
      take: +limit || 10,
      where: {
        OR: [
          { name: { contains: keyword, mode: 'insensitive' } },
          { description: { contains: keyword, mode: 'insensitive' } },
        ],
      },
      orderBy: {
        createdAt: 'asc',
      },
      include: {
        categories: {
          select: {
            category: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    const pageNumber = Math.ceil((+offset + 1) / +limit);
    const pageSize = +limit;

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

  async update(
    id: string,
    updateProductDto: UpdateProductDto,
    file: Express.Multer.File,
  ) {
    const { categories, image, ...data } = updateProductDto;
    const categoryIds = Array.isArray(categories) ? categories : [categories];

    // Check if categories exist in the database
    const existingCategories = await this.prisma.category.findMany({
      where: {
        id: { in: categoryIds },
      },
    });

    if (existingCategories.length !== categoryIds.length) {
      throw new BadRequestException('One or more categories not found');
    }

    const imagePath = file ? file.filename : image;

    // Fetch existing categories of the product
    const existingProductCategories =
      await this.prisma.productsOnCategories.findMany({
        where: { product_id: id },
      });

    const existingProductCategoryIds = existingProductCategories.map(
      (productCategory) => productCategory.category_id,
    );

    // Find categories to delete (currently in the product but not in the update)
    const categoriesToDelete = existingProductCategoryIds.filter(
      (categoryId) => !categoryIds.includes(categoryId),
    );

    // Find categories to add (in the update but not currently in the product)
    const categoriesToAdd = categoryIds.filter(
      (categoryId) => !existingProductCategoryIds.includes(categoryId),
    );

    try {
      if (categoriesToAdd.length === 0 && categoriesToDelete.length === 0) {
        // No category update needed
        console.log('No categories update');
        return await this.prisma.product.update({
          where: { id },
          data: {
            ...data,
            image: imagePath,
          },
        });
      } else {
        // Update categories by adding and/or removing associations
        return await this.prisma.product.update({
          where: { id },
          data: {
            ...data,
            image: imagePath,
            categories: {
              deleteMany: categoriesToDelete.map((categoryId) => ({
                category_id: categoryId,
              })),
              create: categoriesToAdd.map((categoryId) => ({
                category: {
                  connect: { id: categoryId },
                },
              })),
            },
          },
        });
      }
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async remove(id: string) {
    return await this.prisma.product.delete({
      where: {
        id: id,
      },
    });
  }
}
