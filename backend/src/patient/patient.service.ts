import { BadRequestException, Injectable, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { Patient } from '../calendar/entities/patient.entity';
import { CreatePatientDto } from './dto/create-patient.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';
import { REQUEST } from '@nestjs/core';

interface RequestWithUser extends Request {
  user?: {
    userId: string;
    name: string;
    type: string;
  };
}

@Injectable()
export class PatientService {
  constructor(
    @InjectRepository(Patient)
    private patientRepository: Repository<Patient>,
    @Inject(REQUEST) private request: RequestWithUser,
  ) {}

  create(createPatientDto: CreatePatientDto) {
    try{
      const userId = this.request.user?.userId;
      const newPatient = this.patientRepository.create({
        ...createPatientDto,
        createdBy: userId
      });
      return this.patientRepository.save(newPatient);
    } catch (error) {
      console.log("ERRORR ==>>",error);
      throw new BadRequestException('Patient creation failed');
    }
  }

  findAll(name?: string) {
    if (name) {
      return this.patientRepository.find({
        where: { name: ILike(`%${name}%`), deleted: false },
      });
    }
    return this.patientRepository.find({ where: { deleted: false } });
  }

  findOne(id: string) {
    return this.patientRepository.findOne({ where: { id, deleted: false } });
  }

  async update(id: string, updatePatientDto: UpdatePatientDto) {
    const patient = await this.findOne(id);
    if (!patient) return null;
    const userId = this.request.user?.userId;
    Object.assign(patient, { ...updatePatientDto, updatedBy: userId });
    return this.patientRepository.save(patient);
  }

  async remove(id: string) {
    const patient = await this.findOne(id);
    if (!patient) return null;
    patient.deleted = true;
    return this.patientRepository.save(patient);
  }
} 