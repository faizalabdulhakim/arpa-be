import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { AuthGuard } from 'src/auth/auth.guard';
import { AddCartDto } from './dto/add-cart.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @UseGuards(AuthGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @UseGuards(AuthGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  @UseGuards(AuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }

  @Post(':id/cart')
  addProductToCart(@Param('id') id: string, @Body() addCartDto: AddCartDto) {
    return this.usersService.addProductToCart(id, addCartDto);
  }

  @Delete(':id/cart/:productId')
  removeProductFromCart(
    @Param('id') id: string,
    @Param('productId') productId: string,
  ) {
    return this.usersService.removeProductFromCart(id, productId);
  }

  @Get(':id/cart')
  getCart(@Param('id') id: string) {
    return this.usersService.findUserCart(id);
  }
}
