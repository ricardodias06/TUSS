import {Entity, model, property, belongsTo} from '@loopback/repository';
import {Rank} from './rank.model';

@model({settings: {strict: true, mysql: {tableName: 'Users'}, postgresql: {tableName: 'Users'}}})
export class User extends Entity {
  @property({type: 'number', id: true, generated: true})
  id?: number;

  @property({type: 'string'}) displayName?: string;
  @property({type: 'string', required: true}) robloxUsername: string;
  @property({type: 'string'}) robloxId?: string;
  @property({type: 'string'}) staffId?: string;
  @property({type: 'string', required: true}) password: string;
  @property({type: 'date'}) admissionDate?: string;

  @belongsTo(() => Rank)
  rankId: number;

  constructor(data?: Partial<User>) { super(data); }
}

export interface UserRelations {
  // describe navigational properties here
}

export type UserWithRelations = User & UserRelations;