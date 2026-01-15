import {
  repository,
} from '@loopback/repository';
import {
  param,
  get,
  getModelSchemaRef,
} from '@loopback/rest';
import {
  User,
  Rank,
} from '../models';
import {UserRepository} from '../repositories';

export class UserRankController {
  constructor(
    @repository(UserRepository)
    public userRepository: UserRepository,
  ) { }

  @get('/users/{id}/rank', {
    responses: {
      '200': {
        description: 'Rank belonging to User',
        content: {
          'application/json': {
            schema: getModelSchemaRef(Rank),
          },
        },
      },
    },
  })
  async getRank(
    @param.path.number('id') id: typeof User.prototype.id,
  ): Promise<Rank> {
    return this.userRepository.rank(id);
  }
}
