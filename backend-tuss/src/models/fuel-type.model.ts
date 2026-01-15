import {Entity, model, property} from '@loopback/repository';

@model({settings: {strict: true, mysql: {tableName: 'FuelTypes'}, postgresql: {tableName: 'FuelTypes'}}})
export class FuelType extends Entity {
  @property({type: 'number', id: true, generated: true})
  id?: number;

  @property({type: 'string', required: true})
  name: string;

  constructor(data?: Partial<FuelType>) { super(data); }
}

export interface FuelTypeRelations {
  // describe navigational properties here
}

export type FuelTypeWithRelations = FuelType & FuelTypeRelations;