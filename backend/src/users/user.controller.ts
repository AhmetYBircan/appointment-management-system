import { Controller, Get, Post, Body, Patch, Param, Delete, Request } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserService } from './user.service';
import { Public } from './public.decorator';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('register')
  @Public()
  register(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @Post('login')
  @Public()
  login(@Body() body: { keyword: string; password: string }) {
    return this.userService.login(body.keyword, body.password);
  }

  @Post('newUser')
  newUser(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @Patch('change-password')
  changePassword(@Request() req, @Body() body: { currentPassword: string; newPassword: string }) {
    return this.userService.changePassword(req.user.id, body.currentPassword, body.newPassword);
  }

  @Patch('profile')
  updateProfile(@Request() req, @Body() body: { name: string; mail?: string; phoneNumber?: string }) {
    return this.userService.updateProfile(req.user.id, body);
  }

  @Get('profile')
  getProfile(@Request() req) {
    return this.userService.findOne(req.user.userId);
  }

  @Get()
  findAll() {
    return this.userService.findAll();
  }

  @Get('id/:id')
  findOne(@Param('id') id: string) {
    return this.userService.findOne(id);
  }

  @Patch('id/:id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(id, updateUserDto);
  }

  @Delete('id/:id')
  remove(@Param('id') id: string) {
    return this.userService.remove(id);
  }

  @Post('logout')
  logout() {
    return { success: true, message: 'Başarıyla çıkış yapıldı' };
  }
} 