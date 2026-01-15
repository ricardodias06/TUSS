import {Entity, model, property} from '@loopback/repository';

@model({settings: {strict: true}}) // Mudamos para TRUE para o MySQL não reclamar
export class User extends Entity {
  @property({
    type: 'string',
    id: true,
    generated: true,
  })
  id?: string;

  @property({
    type: 'string',
    required: true,
  })
  email: string;

  @property({
    type: 'string',
    required: true,
  })
  password: string;

  @property({
    type: 'string',
    // Não pomos 'required: true' aqui para evitar problemas em updates parciais
  })
  robloxUsername?: string;

  @property({
    type: 'string',
    default: 'passenger',
  })
  role?: string;

  @property({
    type: 'string',
    default: 'active',
  })
  status?: string;

  constructor(data?: Partial<User>) {
    super(data);
  }
}

export interface UserRelations {}

export type UserWithRelations = User & UserRelations;
