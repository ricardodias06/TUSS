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
  Transmission,
} from '../models';
import {BusRepository} from '../repositories';

export class BusTransmissionController {
  constructor(
    @repository(BusRepository)
    public busRepository: BusRepository,
  ) { }

  @get('/buses/{id}/transmission', {
    responses: {
      '200': {
        description: 'Transmission belonging to Bus',
        content: {
          'application/json': {
            schema: getModelSchemaRef(Transmission),
          },
        },
      },
    },
  })
  async getTransmission(
    @param.path.number('id') id: typeof Bus.prototype.id,
  ): Promise<Transmission> {
    return this.busRepository.transmission(id);
  }
}
