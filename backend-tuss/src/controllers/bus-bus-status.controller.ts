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
  BusStatus,
} from '../models';
import {BusRepository} from '../repositories';

export class BusBusStatusController {
  constructor(
    @repository(BusRepository)
    public busRepository: BusRepository,
  ) { }

  @get('/buses/{id}/bus-status', {
    responses: {
      '200': {
        description: 'BusStatus belonging to Bus',
        content: {
          'application/json': {
            schema: {type: 'array', items: getModelSchemaRef(BusStatus)},
          },
        },
      },
    },
  })
  async getBusStatus(
    @param.path.number('id') id: typeof Bus.prototype.id,
  ): Promise<BusStatus> {
    // AQUI ESTAVA O ERRO: Mudámos de .busStatus(id) para .status(id)
    return this.busRepository.status(id);
  }
}