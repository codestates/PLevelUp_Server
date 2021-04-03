import Sequelize from 'sequelize';

export default class User extends Sequelize.Model {
  static init(sequelize) {
    return super.init(
      {
        email: { type: Sequelize.STRING, allowNull: false, unique: true },
        username: { type: Sequelize.STRING, allowNull: false },
        password: { type: Sequelize.STRING, allowNull: false },
        createdAt: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.NOW,
        },
        updatedAt: { type: Sequelize.DATE, allowNull: true },
      },
      {
        sequelize,
        timestamps: false,
        paranoid: false,
        underscored: false,
        modelName: 'User',
        tableName: 'users',
        charset: 'utf8',
        collate: 'utf8_general_ci',
        dialectOptions: {
          dateStrings: true,
          typeCast: true,
        },
      },
    );
  }

  static associate(db) {
    db.User.hasMany(db.PaymentLog);
    db.User.belongsToMany(db.Club, {
      through: 'Apply',
      foreignKey: 'UserId',
    });
  }
}
