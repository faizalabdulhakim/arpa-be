import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  async create(createCategoryDto: CreateCategoryDto) {
    const category = await this.prisma.category.create({
      data: {
        ...createCategoryDto,
      },
    });

    if (!category) {
      throw new BadRequestException('Error creating category');
    }

    return category;
  }

  async findAll() {
    return await this.prisma.category.findMany();
  }

  async findOne(id: string) {
    return await this.prisma.category.findFirst({
      where: {
        id: id,
      },
    });
  }

  async update(id: string, updateCategoryDto: UpdateCategoryDto) {
    const category = await this.prisma.category.update({
      where: {
        id: id,
      },
      data: {
        ...updateCategoryDto,
      },
    });

    if (!category) {
      throw new BadRequestException('Error updating category');
    }

    return category;
  }

  async remove(id: string) {
    const category = await this.prisma.category.delete({
      where: {
        id: id,
      },
    });

    if (!category) {
      throw new BadRequestException('Error deleting category');
    }
  }
}
