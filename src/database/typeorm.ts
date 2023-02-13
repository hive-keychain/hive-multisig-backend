/* istanbul ignore file */
import Logger from 'hive-keychain-commons/lib/logger/logger';
import { DataSource } from 'typeorm';

let dataSource: DataSource;

const getDatabase = () => {
  return dataSource;
};

const initDatabaseConnection = async (source: DataSource) => {
  try {
    Logger.technical('Initializing database connection...');
    dataSource = await source.initialize();
    Logger.technical('Initialized database connection...');
  } catch (e) {
    Logger.error('Error while connecting to database', e);
    throw new Error('Error while connecting to database');
  }
};

const closeConnection = async () => {
  dataSource.destroy();
};

export const DatabaseModule = {
  initDatabaseConnection,
  getDatabase,
  closeConnection,
};
