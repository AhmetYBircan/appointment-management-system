import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { User } from '../calendar/entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    const user = this.userRepository.create({ ...createUserDto, password: hashedPassword, status: createUserDto.status || 'ACTIVE' });
    return this.userRepository.save(user);
  }

  async findAll(): Promise<User[]> {
    return this.userRepository.find();
  }

  async findOne(id: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.userRepository.preload({ id, ...updateUserDto });
    if (!user) throw new NotFoundException('User not found');
    return this.userRepository.save(user);
  }

  async remove(id: string): Promise<void> {
    const result = await this.userRepository.delete(id);
    if (result.affected === 0) throw new NotFoundException('User not found');
  }

  async login(keyword: string, password: string): Promise<{success: boolean, token: string }> {
    const user = await this.userRepository.findOne({ where: [ { mail: keyword }, {name: keyword} ] });
    if (!user) throw new NotFoundException('Kullanıcı Bulunamadı');
    
    // PASSIVE kullanıcıların giriş yapmasını engelle
    if (user.status === 'PASSIVE') {
      throw new NotFoundException('Kullanıcı Bulunamadı');
    }
    
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new NotFoundException('Kullanıcı adı veya şifre hatalı');

    const payload = { sub: user.id, name: user.name, type: user.type };
    const token = this.jwtService.sign(payload);
    return { success: true, token: token };
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<{ success: boolean; message: string }> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('Kullanıcı bulunamadı');

    // Mevcut şifreyi kontrol et
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      throw new BadRequestException('Mevcut şifre hatalı');
    }

    // Yeni şifreyi hash'le
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    
    // Şifreyi güncelle
    user.password = hashedNewPassword;
    await this.userRepository.save(user);

    return { success: true, message: 'Şifre başarıyla güncellendi' };
  }

  async updateProfile(userId: string, profileData: { name: string; mail?: string; phoneNumber?: string }): Promise<{ success: boolean; message: string }> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('Kullanıcı bulunamadı');

    // Profil bilgilerini güncelle
    user.name = profileData.name;
    if (profileData.mail !== undefined) user.mail = profileData.mail;
    if (profileData.phoneNumber !== undefined) user.phoneNumber = profileData.phoneNumber;

    await this.userRepository.save(user);

    return { success: true, message: 'Profil bilgileri başarıyla güncellendi' };
  }
} 