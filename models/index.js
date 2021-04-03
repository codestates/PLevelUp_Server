const Sequelize= require('sequelize');
const Master= require('./master');
const User= require('./user');
const Club= require('./club');
const PaymentLog= require('./paymentLog');

const env = process.env.NODE_ENV || 'development';
const config = require('../config/config.js')[env];
const db = {};
const sequelize = new Sequelize(config.database, config.user, config.password, config);

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

module.exports = db;
