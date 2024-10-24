import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';
import { AddCartDto } from './dto/add-cart.dto';

export type User = any;

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return await this.prisma.user.findMany();
  }

  async findOneByEmail(email: string) {
    return await this.prisma.user.findUnique({
      where: {
        email: email,
      },
    });
  }

  async findOne(id: string) {
    return await this.prisma.user.findFirst({
      where: {
        id: id,
      },
    });
  }

  async signUp(createUserDto: CreateUserDto) {
    if (createUserDto.password !== createUserDto.passwordConfirmation) {
      throw new BadRequestException(
        'Password and password confirmation do not match',
      );
    }

    const saltOrRounds = 10;
    const password = createUserDto.password;
    const hashedPassword = await bcrypt.hash(password, saltOrRounds);

    const userExist = await this.findOneByEmail(createUserDto.email);
    if (userExist) {
      throw new BadRequestException('User already exists');
    }

    const { passwordConfirmation, ...userData } = createUserDto;

    const user = await this.prisma.user.create({
      data: {
        ...userData,
        password: hashedPassword,
      },
    });

    if (!user) {
      throw new BadRequestException('Error creating user');
    }

    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    if (updateUserDto.password) {
      const saltOrRounds = 10;
      const hashedPassword = await bcrypt.hash(
        updateUserDto.password,
        saltOrRounds,
      );
      updateUserDto.password = hashedPassword;
    }

    const { passwordConfirmation, ...updateData } = updateUserDto;

    const user = await this.prisma.user.update({
      where: { id: id },
      data: updateData,
    });

    if (!user) {
      throw new BadRequestException('Error updating user');
    }

    return user;
  }

  async remove(id: string) {
    return await this.prisma.user.delete({
      where: { id: id },
    });
  }

  async findUserCart(user_id: string) {
    return await this.prisma.user.findFirst({
      where: {
        id: user_id,
      },
      include: {
        shoppingCarts: true,
      },
    });
  }

  async addProductToCart(user_id: string, addCartDto: AddCartDto) {
    // Check if user exists
    const user = await this.prisma.user.findFirst({
      where: {
        id: user_id,
      },
      include: {
        shoppingCarts: true,
      },
    });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    // Check if product exists
    const product = await this.prisma.product.findFirst({
      where: {
        id: addCartDto.product_id,
      },
    });

    if (!product) {
      throw new BadRequestException('Product not found');
    }

    await this.prisma.shoppingCart.upsert({
      where: {
        user_id_product_id: {
          user_id: user_id,
          product_id: addCartDto.product_id,
        },
      },
      create: {
        quantity: addCartDto.quantity,
        user: {
          connect: {
            id: user_id,
          },
        },
        product: {
          connect: {
            id: addCartDto.product_id,
          },
        },
      },
      update: {
        quantity: addCartDto.quantity,
      },
    });

    return await this.prisma.user.findFirst({
      where: {
        id: user_id,
      },
      include: {
        shoppingCarts: true,
      },
    });
  }

  async removeProductFromCart(user_id: string, product_id: string) {
    return await this.prisma.shoppingCart.delete({
      where: {
        user_id_product_id: {
          user_id: user_id,
          product_id: product_id,
        },
      },
    });
  }
}
