import {service} from '@loopback/core';
import {get, param} from '@loopback/rest';
import {GoogleSheetsService} from '../services/google-sheets.service';

export class ScheduleController {
  constructor(
    @service(GoogleSheetsService) public googleSheetsService: GoogleSheetsService,
  ) {}

  @get('/api/dispatch')
  async getDispatch() {
    return this.googleSheetsService.getDispatchData();
  }

  @get('/api/fleet')
  async getFleet() {
    return this.googleSheetsService.getFleetData();
  }

  @get('/api/lines/{id}')
  async getLine(@param.path.string('id') id: string) {
    return this.googleSheetsService.getTimetable(id);
  }
}
