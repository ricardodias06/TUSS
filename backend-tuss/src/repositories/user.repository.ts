import {inject, Getter} from '@loopback/core';
import {DefaultCrudRepository, repository, BelongsToAccessor} from '@loopback/repository';
import {DbDataSource} from '../datasources';
import {User, UserRelations, Rank} from '../models';
import {RankRepository} from './rank.repository';

export class UserRepository extends DefaultCrudRepository<
  User,
  typeof User.prototype.id,
  UserRelations
> {

  public readonly rank: BelongsToAccessor<Rank, typeof User.prototype.id>;

  constructor(
    @inject('datasources.db') dataSource: DbDataSource, @repository.getter('RankRepository') protected rankRepositoryGetter: Getter<RankRepository>,
  ) {
    super(User, dataSource);
    this.rank = this.createBelongsToAccessorFor('rank', rankRepositoryGetter,);
    this.registerInclusionResolver('rank', this.rank.inclusionResolver);
  }

  // Lógica para gerar Staff ID automático (5xxx)
  async create(entity: Partial<User>): Promise<User> {
    if (!entity.staffId) {
      // Procura o utilizador com o maior staffId
      const lastUser = await this.findOne({
        order: ['staffId DESC'],
        where: { staffId: { like: '5%' } } // Garante que apanha o padrão 5xxx
      });

      if (!lastUser || !lastUser.staffId) {
        entity.staffId = '5001';
      } else {
        const nextId = parseInt(lastUser.staffId) + 1;
        entity.staffId = nextId.toString();
      }
    }
    return super.create(entity);
  }
}