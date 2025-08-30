import { Controller, Get, Post, Body, Patch, Param, Delete, Query, ParseUUIDPipe } from '@nestjs/common';
import { CalendarService } from './calendar.service';
import { Appointment } from './entities/appointment.entity';
import { Netgsm, SmsStatus, BalanceType } from '@netgsm/sms';
import { Public } from 'src/users/public.decorator';

@Controller('calendar')
export class CalendarController {
  constructor(private readonly calendarService: CalendarService) {}

  @Post()
  create(@Body() createAppointmentDto: Partial<Appointment>) {
    return this.calendarService.create(createAppointmentDto);
  }

  @Post('sms')
  @Public()
  sendSms() {
    const netgsm = new Netgsm({
      username: '5075273905',
      password: '26D9DB9',
      //appname: 'YOUR_APP_NAME' // Optional
    });
    // Send SMS
    async function sendSms() {
      try {
        console.log("SMS FUNC START")

        const response = await netgsm.sendRestSms({
          msgheader: 'Mesaj Headerı', // SMS header
          encoding: 'TR', // Turkish character support
          //startdate: '010620241530',       // Optional (format: ddMMyyyyHHmm)
          //stopdate: '010620241630',        // Optional (format: ddMMyyyyHHmm)
          messages: [
            { msg: 'Deneme mesajı', no: '5075273905' },
            //{ msg: 'Message content', no: '5YYYYYYYYY' }
          ]
        });
        
        console.log('SMS sent:', response);
        return response.jobid;
      } catch (error) {
        console.error('Error SMS:', error);
      }
    }
    console.log("SMS FUNC BEGINING")
    // Call the function
    sendSms();

  }

  @Get()
  findAll() {
    return this.calendarService.findAll();
  }

  @Get('range')
  findByDateRange(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.calendarService.findByDateRange(new Date(startDate), new Date(endDate));
  }

  @Get('filter')
  async filterAppointments(
    @Query('patientId') patientId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('categoryName') categoryName?: string,
  ) {
    return this.calendarService.filterAppointments(patientId, startDate, endDate, categoryName);
  }

  @Get('category-counts')
  async getCategoryCounts(@Query('date') date: string) {
    return this.calendarService.getCategoryCountsByDay(date);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.calendarService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateAppointmentDto: Partial<Appointment>,
  ) {
    return this.calendarService.update(id, updateAppointmentDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.calendarService.remove(id);
  }
} 