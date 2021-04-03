import Sequelize from 'sequelize';
import Master from './master';
import User from './user';
import Club from './club';
import PaymentLog from './paymentLog';
import config from '../config/config.js';

const env = process.env.NODE_ENV || 'development';
const configEnv = config[env];
export const sequelize = new Sequelize(
  configEnv.database,
  configEnv.user,
  configEnv.password,
  configEnv,
);
const db = {};

db.sequelize = sequelize;
db.Master = Master;
db.User = User;
db.Club = Club;
db.PaymentLog = PaymentLog;

Master.init(sequelize);
User.init(sequelize);
Club.init(sequelize);
PaymentLog.init(sequelize);

Master.associate(db);
User.associate(db);
Club.associate(db);
PaymentLog.associate(db);

export default db;
