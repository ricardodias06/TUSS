import {
  repository,
} from '@loopback/repository';
import {
  param,
  get,
  getModelSchemaRef,
} from '@loopback/rest';
import {
  Bus,
  FuelType,
} from '../models';
import {BusRepository} from '../repositories';

export class BusFuelTypeController {
  constructor(
    @repository(BusRepository)
    public busRepository: BusRepository,
  ) { }

  @get('/buses/{id}/fuel-type', {
    responses: {
      '200': {
        description: 'FuelType belonging to Bus',
        content: {
          'application/json': {
            schema: getModelSchemaRef(FuelType),
          },
        },
      },
    },
  })
  async getFuelType(
    @param.path.number('id') id: typeof Bus.prototype.id,
  ): Promise<FuelType> {
    return this.busRepository.fuelType(id);
  }
}
