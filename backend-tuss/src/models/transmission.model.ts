import {Entity, model, property} from '@loopback/repository';

@model({settings: {strict: true, mysql: {tableName: 'Transmissions'}, postgresql: {tableName: 'Transmissions'}}})
export class Transmission extends Entity {
  @property({type: 'number', id: true, generated: true})
  id?: number;

  @property({type: 'string', required: true})
  name: string;

  constructor(data?: Partial<Transmission>) { super(data); }
}

export interface TransmissionRelations {
  // describe navigational properties here
}

export type TransmissionWithRelations = Transmission & TransmissionRelations;