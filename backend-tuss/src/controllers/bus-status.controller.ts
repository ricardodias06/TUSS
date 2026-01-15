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
import {BusStatus} from '../models';
import {BusStatusRepository} from '../repositories';

export class BusStatusController {
  constructor(
    @repository(BusStatusRepository)
    public busStatusRepository : BusStatusRepository,
  ) {}

  @post('/bus-statuses')
  @response(200, {
    description: 'BusStatus model instance',
    content: {'application/json': {schema: getModelSchemaRef(BusStatus)}},
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(BusStatus, {
            title: 'NewBusStatus',
            exclude: ['id'],
          }),
        },
      },
    })
    busStatus: Omit<BusStatus, 'id'>,
  ): Promise<BusStatus> {
    return this.busStatusRepository.create(busStatus);
  }

  @get('/bus-statuses/count')
  @response(200, {
    description: 'BusStatus model count',
    content: {'application/json': {schema: CountSchema}},
  })
  async count(
    @param.where(BusStatus) where?: Where<BusStatus>,
  ): Promise<Count> {
    return this.busStatusRepository.count(where);
  }

  @get('/bus-statuses')
  @response(200, {
    description: 'Array of BusStatus model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(BusStatus, {includeRelations: true}),
        },
      },
    },
  })
  async find(
    @param.filter(BusStatus) filter?: Filter<BusStatus>,
  ): Promise<BusStatus[]> {
    return this.busStatusRepository.find(filter);
  }

  @patch('/bus-statuses')
  @response(200, {
    description: 'BusStatus PATCH success count',
    content: {'application/json': {schema: CountSchema}},
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(BusStatus, {partial: true}),
        },
      },
    })
    busStatus: BusStatus,
    @param.where(BusStatus) where?: Where<BusStatus>,
  ): Promise<Count> {
    return this.busStatusRepository.updateAll(busStatus, where);
  }

  @get('/bus-statuses/{id}')
  @response(200, {
    description: 'BusStatus model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(BusStatus, {includeRelations: true}),
      },
    },
  })
  async findById(
    @param.path.number('id') id: number,
    @param.filter(BusStatus, {exclude: 'where'}) filter?: FilterExcludingWhere<BusStatus>
  ): Promise<BusStatus> {
    return this.busStatusRepository.findById(id, filter);
  }

  @patch('/bus-statuses/{id}')
  @response(204, {
    description: 'BusStatus PATCH success',
  })
  async updateById(
    @param.path.number('id') id: number,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(BusStatus, {partial: true}),
        },
      },
    })
    busStatus: BusStatus,
  ): Promise<void> {
    await this.busStatusRepository.updateById(id, busStatus);
  }

  @put('/bus-statuses/{id}')
  @response(204, {
    description: 'BusStatus PUT success',
  })
  async replaceById(
    @param.path.number('id') id: number,
    @requestBody() busStatus: BusStatus,
  ): Promise<void> {
    await this.busStatusRepository.replaceById(id, busStatus);
  }

  @del('/bus-statuses/{id}')
  @response(204, {
    description: 'BusStatus DELETE success',
  })
  async deleteById(@param.path.number('id') id: number): Promise<void> {
    await this.busStatusRepository.deleteById(id);
  }
}
