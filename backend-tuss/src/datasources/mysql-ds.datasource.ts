import {inject, lifeCycleObserver, LifeCycleObserver} from '@loopback/core';
import {juggler} from '@loopback/repository';

const config = {
  name: 'mysqlDS',
  connector: 'mysql',
  url: '',
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: 'root',
  database: 'tuss_db'
};

@lifeCycleObserver('datasource')
export class MysqlDsDataSource extends juggler.DataSource
  implements LifeCycleObserver {
  static dataSourceName = 'mysqlDS';
  static readonly defaultConfig = config;

  constructor(
    @inject('datasources.config.mysqlDS', {optional: true})
    dsConfig: object = config,
  ) {
    super(dsConfig);
  }
}
