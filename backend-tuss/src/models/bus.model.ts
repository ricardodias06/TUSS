import {Entity, model, property, belongsTo} from '@loopback/repository';
import {FuelType} from './fuel-type.model';
import {BusStatus} from './bus-status.model';
import {Transmission} from './transmission.model';

@model({settings: {strict: true, mysql: {tableName: 'Buses'}, postgresql: {tableName: 'Buses'}}})
export class Bus extends Entity {
  @property({type: 'number', id: true, generated: true})
  id?: number;

  @property({type: 'string', required: true})
  busNumber: string;

  @property({type: 'string', required: true})
  licensePlate: string;

  @property({type: 'string', required: true})
  name: string;

  @belongsTo(() => FuelType)
  fuelTypeId: number;

  @belongsTo(() => BusStatus)
  statusId: number;

  @belongsTo(() => Transmission)
  transmissionId: number;

  constructor(data?: Partial<Bus>) { super(data); }
}

export interface BusRelations {
  // describe navigational properties here
}

export type BusWithRelations = Bus & BusRelations;