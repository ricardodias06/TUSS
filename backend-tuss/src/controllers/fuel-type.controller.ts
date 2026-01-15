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
import {FuelType} from '../models';
import {FuelTypeRepository} from '../repositories';

export class FuelTypeController {
  constructor(
    @repository(FuelTypeRepository)
    public fuelTypeRepository : FuelTypeRepository,
  ) {}

  @post('/fuel-types')
  @response(200, {
    description: 'FuelType model instance',
    content: {'application/json': {schema: getModelSchemaRef(FuelType)}},
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(FuelType, {
            title: 'NewFuelType',
            exclude: ['id'],
          }),
        },
      },
    })
    fuelType: Omit<FuelType, 'id'>,
  ): Promise<FuelType> {
    return this.fuelTypeRepository.create(fuelType);
  }

  @get('/fuel-types/count')
  @response(200, {
    description: 'FuelType model count',
    content: {'application/json': {schema: CountSchema}},
  })
  async count(
    @param.where(FuelType) where?: Where<FuelType>,
  ): Promise<Count> {
    return this.fuelTypeRepository.count(where);
  }

  @get('/fuel-types')
  @response(200, {
    description: 'Array of FuelType model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(FuelType, {includeRelations: true}),
        },
      },
    },
  })
  async find(
    @param.filter(FuelType) filter?: Filter<FuelType>,
  ): Promise<FuelType[]> {
    return this.fuelTypeRepository.find(filter);
  }

  @patch('/fuel-types')
  @response(200, {
    description: 'FuelType PATCH success count',
    content: {'application/json': {schema: CountSchema}},
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(FuelType, {partial: true}),
        },
      },
    })
    fuelType: FuelType,
    @param.where(FuelType) where?: Where<FuelType>,
  ): Promise<Count> {
    return this.fuelTypeRepository.updateAll(fuelType, where);
  }

  @get('/fuel-types/{id}')
  @response(200, {
    description: 'FuelType model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(FuelType, {includeRelations: true}),
      },
    },
  })
  async findById(
    @param.path.number('id') id: number,
    @param.filter(FuelType, {exclude: 'where'}) filter?: FilterExcludingWhere<FuelType>
  ): Promise<FuelType> {
    return this.fuelTypeRepository.findById(id, filter);
  }

  @patch('/fuel-types/{id}')
  @response(204, {
    description: 'FuelType PATCH success',
  })
  async updateById(
    @param.path.number('id') id: number,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(FuelType, {partial: true}),
        },
      },
    })
    fuelType: FuelType,
  ): Promise<void> {
    await this.fuelTypeRepository.updateById(id, fuelType);
  }

  @put('/fuel-types/{id}')
  @response(204, {
    description: 'FuelType PUT success',
  })
  async replaceById(
    @param.path.number('id') id: number,
    @requestBody() fuelType: FuelType,
  ): Promise<void> {
    await this.fuelTypeRepository.replaceById(id, fuelType);
  }

  @del('/fuel-types/{id}')
  @response(204, {
    description: 'FuelType DELETE success',
  })
  async deleteById(@param.path.number('id') id: number): Promise<void> {
    await this.fuelTypeRepository.deleteById(id);
  }
}
