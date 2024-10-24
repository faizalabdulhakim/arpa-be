import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService) {}

  async create(createOrderDto: CreateOrderDto) {
    const { products, user_id, ...data } = createOrderDto;

    // if products not exist in product
    const existingProducts = await this.prisma.product.findMany({
      where: {
        id: {
          in: products.map((product) => product.product_id),
        },
      },
    });

    if (existingProducts.length !== products.length) {
      throw new BadRequestException('Product not found');
    }

    // if product quantity is not enough throw error
    for (const product of products) {
      const existingProduct = existingProducts.find(
        (existingProduct) => existingProduct.id === product.product_id,
      );

      if (existingProduct.stock < product.quantity) {
        throw new BadRequestException(
          `Product ${existingProduct.name} stock is not enough`,
        );
      }
    }

    // sum total price
    const total_price = products.reduce(
      (acc, product) =>
        acc +
        existingProducts.find(
          (existingProduct) => existingProduct.id === product.product_id,
        ).price *
          product.quantity,
      0,
    );

    const order = await this.prisma.order.create({
      data: {
        ...data,
        total_price,
        user: {
          connect: {
            id: user_id,
          },
        },
        products: {
          create: products.map((product) => ({
            product: {
              connect: {
                id: product.product_id,
              },
            },
            quantity: product.quantity,
          })),
        },
      },
    });

    return order;
  }

  async findAll() {
    return `This action returns all orders`;
  }

  async findOne(id: string) {
    return `This action returns a #${id} order`;
  }

  async update(id: string, updateOrderDto: UpdateOrderDto) {
    return `This action updates a #${id} order`;
  }

  async remove(id: string) {
    return `This action removes a #${id} order`;
  }

  async checkout(user_id: string) {
    // Fetch user's shopping cart items
    const cartItems = await this.prisma.shoppingCart.findMany({
      where: { user_id: user_id },
      include: { product: true },
    });

    if (cartItems.length === 0) {
      throw new Error('Shopping cart is empty');
    }

    // Calculate total price
    const totalPrice = cartItems.reduce(
      (total, item) => total + item.quantity * item.product.price,
      0,
    );

    // Create the order
    const order = await this.prisma.order.create({
      data: {
        user: { connect: { id: user_id } },
        total_price: totalPrice,
        products: {
          create: cartItems.map((item) => ({
            product: { connect: { id: item.product_id } },
            quantity: item.quantity,
          })),
        },
      },
    });

    // Update product stock
    await Promise.all(
      cartItems.map((item) =>
        this.prisma.product.update({
          where: { id: item.product_id },
          data: { stock: { decrement: item.quantity } },
        }),
      ),
    );

    // Clear the shopping cart
    await this.prisma.shoppingCart.deleteMany({
      where: { user_id: user_id },
    });

    return order;
  }
}