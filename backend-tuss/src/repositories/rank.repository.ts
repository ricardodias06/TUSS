import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {DbDataSource} from '../datasources';
import {Rank, RankRelations} from '../models';

export class RankRepository extends DefaultCrudRepository<
  Rank,
  typeof Rank.prototype.id,
  RankRelations
> {
  constructor(
    @inject('datasources.db') dataSource: DbDataSource,
  ) {
    super(Rank, dataSource);
  }
}
