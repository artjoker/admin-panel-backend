import dataSource from './app-data-source';

export class Database {
  connect = async () => {
    try {
      await dataSource.initialize();
      if (dataSource.isInitialized) {
        console.log('🔋 Connected to the database');
      }
    } catch (error) {
      console.error(error);
    }
  };

  disconnect = async () => {
    try {
      await dataSource.destroy();
      if (!dataSource.isInitialized) {
        console.log('🪫 Database disconnected');
      }
    } catch (error) {
      console.error(error);
    }
  };

  synchronize = async () => {
    try {
      await dataSource.synchronize();
      console.log('✅ Database synchronized');
    } catch (error) {
      console.error(error);
    }
  };

  clear = async () => {
    try {
      await dataSource.synchronize(true);
      console.log('❌ Database cleared');
    } catch (error) {
      console.error(error);
    }
  };

  drop = async () => {
    try {
      await dataSource.dropDatabase();
      console.log('❌ Database deleted');
    } catch (error) {
      console.error(error);
    }
  };
}
