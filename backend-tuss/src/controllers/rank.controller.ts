import {
  Count,
  CountSchema,
  Filter,
  FilterExcludingWhere,
  repository,
  Where,
} from '@loopback/repository';
import {
  post,
  param,
  get,
  getModelSchemaRef,
  patch,
  put,
  del,
  requestBody,
  response,
} from '@loopback/rest';
import {Rank} from '../models';
import {RankRepository} from '../repositories';

export class RankController {
  constructor(
    @repository(RankRepository)
    public rankRepository : RankRepository,
  ) {}

  @post('/ranks')
  @response(200, {
    description: 'Rank model instance',
    content: {'application/json': {schema: getModelSchemaRef(Rank)}},
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Rank, {
            title: 'NewRank',
            exclude: ['id'],
          }),
        },
      },
    })
    rank: Omit<Rank, 'id'>,
  ): Promise<Rank> {
    return this.rankRepository.create(rank);
  }

  @get('/ranks')
  @response(200, {
    description: 'Array of Rank model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(Rank, {includeRelations: true}),
        },
      },
    },
  })
  async find(
    @param.filter(Rank) filter?: Filter<Rank>,
  ): Promise<Rank[]> {
    return this.rankRepository.find(filter);
  }

  @del('/ranks/{id}')
  @response(204, {
    description: 'Rank DELETE success',
  })
  async deleteById(@param.path.number('id') id: number): Promise<void> {
    await this.rankRepository.deleteById(id);
  }
}