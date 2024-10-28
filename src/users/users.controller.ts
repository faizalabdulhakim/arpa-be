import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { AuthGuard } from 'src/auth/auth.guard';
import { AddCartDto } from './dto/add-cart.dto';

@UseGuards(AuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  findAll(
    @Query('offset') offset: number,
    @Query('limit') limit: number,
    @Query('keyword') keyword: string,
  ) {
    return this.usersService.findAll(offset, limit, keyword);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }

  @Post('cart/:id')
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

  @Patch(':id/promote')
  promoteUser(@Param('id') id: string) {
    return this.usersService.promoteUser(id);
  }
}
