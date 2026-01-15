import {Entity, model, property} from '@loopback/repository';

@model({settings: {strict: true, mysql: {tableName: 'BusStatuses'}, postgresql: {tableName: 'BusStatuses'}}})
export class BusStatus extends Entity {
  @property({type: 'number', id: true, generated: true})
  id?: number;

  @property({type: 'string', required: true})
  name: string;

  constructor(data?: Partial<BusStatus>) { super(data); }
}

export interface BusStatusRelations {
  // describe navigational properties here
}

export type BusStatusWithRelations = BusStatus & BusStatusRelations;