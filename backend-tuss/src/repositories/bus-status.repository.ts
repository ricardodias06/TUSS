import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {DbDataSource} from '../datasources';
import {BusStatus, BusStatusRelations} from '../models';

export class BusStatusRepository extends DefaultCrudRepository<
  BusStatus,
  typeof BusStatus.prototype.id,
  BusStatusRelations
> {
  constructor(
    @inject('datasources.db') dataSource: DbDataSource,
  ) {
    super(BusStatus, dataSource);
  }
}
