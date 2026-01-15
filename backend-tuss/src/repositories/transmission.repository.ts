import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {DbDataSource} from '../datasources';
import {Transmission, TransmissionRelations} from '../models';

export class TransmissionRepository extends DefaultCrudRepository<
  Transmission,
  typeof Transmission.prototype.id,
  TransmissionRelations
> {
  constructor(
    @inject('datasources.db') dataSource: DbDataSource,
  ) {
    super(Transmission, dataSource);
  }
}
