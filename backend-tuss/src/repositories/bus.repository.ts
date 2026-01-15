import {inject, Getter} from '@loopback/core';
import {DefaultCrudRepository, repository, BelongsToAccessor} from '@loopback/repository';
import {DbDataSource} from '../datasources';
// IMPORTAÇÕES DIRETAS (Evita o erro de dependência circular)
import {Bus, BusRelations} from '../models/bus.model';
import {FuelType} from '../models/fuel-type.model';
import {BusStatus} from '../models/bus-status.model';
import {Transmission} from '../models/transmission.model';
import {FuelTypeRepository} from './fuel-type.repository';
import {BusStatusRepository} from './bus-status.repository';
import {TransmissionRepository} from './transmission.repository';

export class BusRepository extends DefaultCrudRepository<
  Bus,
  typeof Bus.prototype.id,
  BusRelations
> {

  public readonly fuelType: BelongsToAccessor<FuelType, typeof Bus.prototype.id>;
  public readonly status: BelongsToAccessor<BusStatus, typeof Bus.prototype.id>;
  public readonly transmission: BelongsToAccessor<Transmission, typeof Bus.prototype.id>;

  constructor(
    @inject('datasources.db') dataSource: DbDataSource,
    @repository.getter('FuelTypeRepository') protected fuelTypeRepositoryGetter: Getter<FuelTypeRepository>,
    @repository.getter('BusStatusRepository') protected busStatusRepositoryGetter: Getter<BusStatusRepository>,
    @repository.getter('TransmissionRepository') protected transmissionRepositoryGetter: Getter<TransmissionRepository>,
  ) {
    super(Bus, dataSource);
    
    // Configuração das Relações
    this.transmission = this.createBelongsToAccessorFor('transmission', transmissionRepositoryGetter,);
    this.registerInclusionResolver('transmission', this.transmission.inclusionResolver);

    this.status = this.createBelongsToAccessorFor('status', busStatusRepositoryGetter,);
    this.registerInclusionResolver('status', this.status.inclusionResolver);

    this.fuelType = this.createBelongsToAccessorFor('fuelType', fuelTypeRepositoryGetter,);
    this.registerInclusionResolver('fuelType', this.fuelType.inclusionResolver);
  }
}