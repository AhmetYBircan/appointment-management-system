import { Injectable, NotFoundException, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from './entities/category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CalendarService } from '../calendar/calendar.service';

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
    @Inject(forwardRef(() => CalendarService))
    private calendarService: CalendarService,
  ) {}

  create(dto: CreateCategoryDto) {
    return this.categoryRepository.save(dto);
  }

  findAll() {
    return this.categoryRepository.find({ where: { deleted: false } });
  }

  findOne(id: string) {
    return this.categoryRepository.findOne({ where: { id, deleted: false } });
  }

  async update(id: string, dto: UpdateCategoryDto) {
    const category = await this.findOne(id);
    if (!category) throw new NotFoundException('Kategori bulunamadı');
    // Sadece gelen alanları güncelle
    Object.assign(category, dto);
    const updated = await this.categoryRepository.save(category);
    if (dto.name) {
      await this.calendarService.updateCategoryNameInAppointments(id, dto.name);
    }
    return updated;
  }

  async remove(id: string) {
    await this.categoryRepository.update(id, { deleted: true });
    return { deleted: true };
  }
} 