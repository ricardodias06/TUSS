import {injectable, BindingScope} from '@loopback/core';
import axios from 'axios';
import {parse} from 'csv-parse/sync';

@injectable({scope: BindingScope.TRANSIENT})
export class GoogleSheetsService {
  
  private sheets = {
    dispatch: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vS3G4-n-DmvEdu6BaGpIPtmM624uiJe3x5GDCHfOq6UOi9YoJW96boaVby3AhTEAs9Mkuwvh9mzxqEV/pub?gid=474504732&single=true&output=csv',
    
    fleet: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vS3G4-n-DmvEdu6BaGpIPtmM624uiJe3x5GDCHfOq6UOi9YoJW96boaVby3AhTEAs9Mkuwvh9mzxqEV/pub?gid=1114161852&single=true&output=csv',
    
    staff: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vS3G4-n-DmvEdu6BaGpIPtmM624uiJe3x5GDCHfOq6UOi9YoJW96boaVby3AhTEAs9Mkuwvh9mzxqEV/pub?gid=385831182&single=true&output=csv',

    lines: {
      '5': 'https://docs.google.com/spreadsheets/d/e/2PACX-1vS3G4-n-DmvEdu6BaGpIPtmM624uiJe3x5GDCHfOq6UOi9YoJW96boaVby3AhTEAs9Mkuwvh9mzxqEV/pub?gid=2124657616&single=true&output=csv',
      '6': 'https://docs.google.com/spreadsheets/d/e/2PACX-1vS3G4-n-DmvEdu6BaGpIPtmM624uiJe3x5GDCHfOq6UOi9YoJW96boaVby3AhTEAs9Mkuwvh9mzxqEV/pub?gid=87714852&single=true&output=csv',
      '7': 'https://docs.google.com/spreadsheets/d/e/2PACX-1vS3G4-n-DmvEdu6BaGpIPtmM624uiJe3x5GDCHfOq6UOi9YoJW96boaVby3AhTEAs9Mkuwvh9mzxqEV/pub?gid=1526805532&single=true&output=csv',
      '13': 'https://docs.google.com/spreadsheets/d/e/2PACX-1vS3G4-n-DmvEdu6BaGpIPtmM624uiJe3x5GDCHfOq6UOi9YoJW96boaVby3AhTEAs9Mkuwvh9mzxqEV/pub?gid=1835643476&single=true&output=csv',
      '14': 'https://docs.google.com/spreadsheets/d/e/2PACX-1vS3G4-n-DmvEdu6BaGpIPtmM624uiJe3x5GDCHfOq6UOi9YoJW96boaVby3AhTEAs9Mkuwvh9mzxqEV/pub?gid=764413866&single=true&output=csv',
      '18': 'https://docs.google.com/spreadsheets/d/e/2PACX-1vS3G4-n-DmvEdu6BaGpIPtmM624uiJe3x5GDCHfOq6UOi9YoJW96boaVby3AhTEAs9Mkuwvh9mzxqEV/pub?gid=1148813807&single=true&output=csv',
    }
  };

  constructor() {}

  private async fetchCsv(url: string) {
    try {
      const response = await axios.get(url);
      return parse(response.data, {
        columns: true,
        skip_empty_lines: true,
        relax_column_count: true,
        trim: true
      });
    } catch (error) {
      console.error("Erro CSV:", error);
      return [];
    }
  }

  async getDispatchData() { return this.fetchCsv(this.sheets.dispatch); }
  async getFleetData() { return this.fetchCsv(this.sheets.fleet); }
  
  async getStaffData() { return this.fetchCsv(this.sheets.staff); }

  async getTimetable(lineNumber: string) {
    // @ts-ignore
    const url = this.sheets.lines[lineNumber];
    if (!url) return {error: "Linha não encontrada."};
    return this.fetchCsv(url);
  }
}
