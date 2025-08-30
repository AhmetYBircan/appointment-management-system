import { BadRequestException, Injectable, NotFoundException, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, FindOptionsWhere } from 'typeorm';
import { Appointment } from './entities/appointment.entity';
import { Category } from './entities/category.entity';
import { startOfDay, endOfDay } from 'date-fns';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';

interface RequestWithUser extends Request {
  user?: {
    userId: string;
    name: string;
    type: string;
  };
}

@Injectable()
export class CalendarService {
  constructor(
    @InjectRepository(Appointment)
    private appointmentRepository: Repository<Appointment>,
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
    @Inject(REQUEST) private request: RequestWithUser,
  ) {}

  async create(createAppointmentDto: Partial<Appointment>): Promise<Appointment> {
    let start = new Date(createAppointmentDto.startTime);
    let end = new Date(createAppointmentDto.endTime);
    let timeChecks = await this.apponitmentTimeCheck(start, end, createAppointmentDto.categoryId);
    if (!timeChecks.status) {
      throw new BadRequestException(timeChecks.message);
    }
 let sameCategorySameTimeCheck = await this.appointmentRepository.find({
      where: {
        startTime: Between(start, end),
        endTime: Between(start, end),
        categoryId: createAppointmentDto.categoryId,
        deleted: false,
      }
    })
    if (sameCategorySameTimeCheck.length > 0) {
      throw new BadRequestException('Bu kategori için bu saatte zaten randevu var');
    }
    let categoryName = createAppointmentDto.categoryName;
    if (createAppointmentDto.categoryId) {
      const category = await this.categoryRepository.findOne({ where: { id: createAppointmentDto.categoryId } });
      if (category) {
        categoryName = category.name;
      }
    }
    const userId = this.request.user?.userId;
    const appointment = this.appointmentRepository.create({ 
      ...createAppointmentDto, 
      categoryName,
      createdBy: userId 
    });
    return await this.appointmentRepository.save(appointment);
  }

  async findAll(): Promise<Appointment[]> {
    return await this.appointmentRepository.find();
  }

  async findByDateRange(startDate: Date, endDate: Date): Promise<Appointment[]> {
    return await this.appointmentRepository.find({
      where: {
        startTime: Between(startDate, endDate),
      },
    });
  }

  async findOne(id: string): Promise<Appointment> {
    const appointment = await this.appointmentRepository.findOne({ where: { id } });
    if (!appointment) {
      throw new NotFoundException(`Appointment with ID ${id} not found`);
    }
    return appointment;
  }

  async update(id: string, updateAppointmentDto: Partial<Appointment>): Promise<Appointment> {
    const appointment = await this.findOne(id);
    const start = new Date(updateAppointmentDto.startTime ?? appointment.startTime);
    const end = new Date(updateAppointmentDto.endTime ?? appointment.endTime);
    if (end <= start) {
      throw new BadRequestException('End time must be greater than start time');
    }
    if (end.getTime() - start.getTime() > 60 * 60 * 1000) {
      throw new BadRequestException('Randevu süresi en fazla 1 saat olabilir');
    }
    if (end < new Date() || start < new Date()) {
      throw new BadRequestException('Randevu saati geçmiş bir tarih olamaz');
    }
    let categoryName = updateAppointmentDto.categoryName ?? appointment.categoryName;
    if (updateAppointmentDto.categoryId) {
      const category = await this.categoryRepository.findOne({ where: { id: updateAppointmentDto.categoryId } });
      if (category) {
        categoryName = category.name;
      }
    }
    const userId = this.request.user?.userId;
    Object.assign(appointment, updateAppointmentDto, { categoryName, updatedBy: userId });
    return await this.appointmentRepository.save(appointment);
  }

  async remove(id: string): Promise<void> {
    const result = await this.appointmentRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Appointment with ID ${id} not found`);
    }
  }

  async filterAppointments(patientId?: string, startDate?: string, endDate?: string, categoryName?: string): Promise<Appointment[]> {
   try {
    const where: FindOptionsWhere<Appointment> = {};

    if (patientId) {
      where.patientId = patientId;
    }
    if (startDate && endDate) {
      where.startTime = Between(new Date(startDate), new Date(endDate));
    } else if (!patientId && !startDate && !endDate) {

      const now = new Date();
      where.startTime = Between(startOfDay(now), endOfDay(now));
    }
    if (categoryName) {
      where.categoryName = categoryName;
    }

    return this.appointmentRepository.find({ where });
   } catch (error) {
    throw new BadRequestException("Randevu bulunamadı");
   }
  }

  async getCategoryCountsByDay(date: string) {
    const start = startOfDay(new Date(date));
    const end = endOfDay(new Date(date));
    const categories = await this.categoryRepository.find({ where: { deleted: false } });
    const appointments = await this.appointmentRepository.find({
      where: {
        startTime: Between(start, end),
        deleted: false,
      },
    });
    let response = categories.map(cat => {
      const count = appointments.filter(a => a.categoryId === cat.id).length;
      return {
        id: cat.id,
        name: cat.name,
        type: cat.type,
        count,
      };
    });
    return response
  }

  async updateCategoryNameInAppointments(categoryId: string, newCategoryName: string): Promise<void> {
    await this.appointmentRepository
      .createQueryBuilder()
      .update(Appointment)
      .set({ categoryName: newCategoryName })
      .where('categoryId = :categoryId', { categoryId })
      .execute();
  }

  async apponitmentTimeCheck(startTime: Date, endTime: Date, categoryId: string): Promise<{status:boolean, message:string }> {

    let status: boolean = true;
    let message: string = '';


    if (endTime < new Date() || startTime < new Date()) {
      status = false;
      message = 'Randevu saati geçmiş bir tarih olamaz';
    } 
    if (endTime <= startTime) {
      status = false;
      message = 'Bitiş saati başlangıç saatinden küçük olamaz';
    }
    if (endTime.getTime() - startTime.getTime() > 60 * 60 * 1000) {
      status = false;
      message = 'Randevu süresi en fazla 1 saat olabilir'
    }

    return {status: status, message: message};
} 

}