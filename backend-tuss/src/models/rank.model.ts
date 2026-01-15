import {Entity, model, property} from '@loopback/repository';

@model({settings: {strict: true, mysql: {tableName: 'Ranks'}, postgresql: {tableName: 'Ranks'}}})
export class Rank extends Entity {
  @property({type: 'number', id: true, generated: true})
  id?: number;

  @property({type: 'string', required: true})
  name: string;

  constructor(data?: Partial<Rank>) { super(data); }
}

export interface RankRelations {
  // describe navigational properties here
}

export type RankWithRelations = Rank & RankRelations;