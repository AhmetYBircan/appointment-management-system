import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Category } from './entities/category.entity';
import { CategoryService } from './category.service';
import { CategoryController } from './category.controller';
import { CalendarModule } from '../calendar/calendar.module';

@Module({
  imports: [TypeOrmModule.forFeature([Category]), forwardRef(() => CalendarModule)],
  providers: [CategoryService],
  controllers: [CategoryController],
})
export class CategoryModule {} 