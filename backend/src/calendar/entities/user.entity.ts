import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { userType } from '../../users/user.enum';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  password: string

  @Column({ nullable: true })
  phoneNumber: string;

  @Column({ nullable: true })
  mail: string;

  @Column({
    type: 'enum',
    enum: userType,
  })
  type: userType;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ default: false })
  deleted: boolean;

  @Column({ default: 'ACTIVE' })
  status: string;
} 