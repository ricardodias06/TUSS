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
import {Transmission} from '../models';
import {TransmissionRepository} from '../repositories';

export class TransmissionController {
  constructor(
    @repository(TransmissionRepository)
    public transmissionRepository : TransmissionRepository,
  ) {}

  @post('/transmissions')
  @response(200, {
    description: 'Transmission model instance',
    content: {'application/json': {schema: getModelSchemaRef(Transmission)}},
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Transmission, {
            title: 'NewTransmission',
            exclude: ['id'],
          }),
        },
      },
    })
    transmission: Omit<Transmission, 'id'>,
  ): Promise<Transmission> {
    return this.transmissionRepository.create(transmission);
  }

  @get('/transmissions/count')
  @response(200, {
    description: 'Transmission model count',
    content: {'application/json': {schema: CountSchema}},
  })
  async count(
    @param.where(Transmission) where?: Where<Transmission>,
  ): Promise<Count> {
    return this.transmissionRepository.count(where);
  }

  @get('/transmissions')
  @response(200, {
    description: 'Array of Transmission model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(Transmission, {includeRelations: true}),
        },
      },
    },
  })
  async find(
    @param.filter(Transmission) filter?: Filter<Transmission>,
  ): Promise<Transmission[]> {
    return this.transmissionRepository.find(filter);
  }

  @patch('/transmissions')
  @response(200, {
    description: 'Transmission PATCH success count',
    content: {'application/json': {schema: CountSchema}},
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Transmission, {partial: true}),
        },
      },
    })
    transmission: Transmission,
    @param.where(Transmission) where?: Where<Transmission>,
  ): Promise<Count> {
    return this.transmissionRepository.updateAll(transmission, where);
  }

  @get('/transmissions/{id}')
  @response(200, {
    description: 'Transmission model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(Transmission, {includeRelations: true}),
      },
    },
  })
  async findById(
    @param.path.number('id') id: number,
    @param.filter(Transmission, {exclude: 'where'}) filter?: FilterExcludingWhere<Transmission>
  ): Promise<Transmission> {
    return this.transmissionRepository.findById(id, filter);
  }

  @patch('/transmissions/{id}')
  @response(204, {
    description: 'Transmission PATCH success',
  })
  async updateById(
    @param.path.number('id') id: number,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Transmission, {partial: true}),
        },
      },
    })
    transmission: Transmission,
  ): Promise<void> {
    await this.transmissionRepository.updateById(id, transmission);
  }

  @put('/transmissions/{id}')
  @response(204, {
    description: 'Transmission PUT success',
  })
  async replaceById(
    @param.path.number('id') id: number,
    @requestBody() transmission: Transmission,
  ): Promise<void> {
    await this.transmissionRepository.replaceById(id, transmission);
  }

  @del('/transmissions/{id}')
  @response(204, {
    description: 'Transmission DELETE success',
  })
  async deleteById(@param.path.number('id') id: number): Promise<void> {
    await this.transmissionRepository.deleteById(id);
  }
}
