import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {DbDataSource} from '../datasources';
import {FuelType, FuelTypeRelations} from '../models';

export class FuelTypeRepository extends DefaultCrudRepository<
  FuelType,
  typeof FuelType.prototype.id,
  FuelTypeRelations
> {
  constructor(
    @inject('datasources.db') dataSource: DbDataSource,
  ) {
    super(FuelType, dataSource);
  }
}
