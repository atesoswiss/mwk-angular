import npmPackage = require('../package.json');

const DEFAULT = {
  name: npmPackage.name,
  version: npmPackage.version
}

//DEV
const DEV = {
  ...DEFAULT,
  typeorm: {
    type: 'sqlite',
    database: 'dev.sql'
  }
}


//INT
const INT = {
  ...DEFAULT,
  typeorm: {
    type: 'mysql',
    host: 'localhost',
    port: 3306,
    username: 'root',
    password: 'root',
    database: 'test',
    entities: [],
    synchronize: true
  }
}


//PROD
const PROD = {
  ...DEFAULT,
  typeorm: {
    type: 'mysql',
    host: 'localhost',
    port: 3306,
    username: 'root',
    password: 'root',
    database: 'test',
    entities: [],
    synchronize: true
  }
}

export default () => (DEV);
