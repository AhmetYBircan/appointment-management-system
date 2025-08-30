import { DataSource } from 'typeorm';
import { Appointment } from './calendar/entities/appointment.entity';
import { Patient } from './calendar/entities/patient.entity';
import { Category } from './calendar/entities/category.entity';
import { User } from './calendar/entities/user.entity';

const isCompiled = __dirname.includes('dist');
const AppDataSource = new DataSource({
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'postgres',
  password: 'postgres',
  database: 'calendar',
  entities: isCompiled
    ? [__dirname + '/calendar/entities/*.js', __dirname + '/calendar/entities/*.js']
    : [Appointment, Patient, Category,User],
  migrations: isCompiled
    ? [__dirname + '/migrations/*.js']
    : ['src/migrations/*.ts'],
  synchronize: false,
});

export default AppDataSource; 