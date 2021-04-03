import Sequelize from 'sequelize';

export default class Master extends Sequelize.Model {
  static init(sequelize) {
    return super.init(
      {
        email: { type: Sequelize.STRING, allowNull: false, unique: true },
        username: { type: Sequelize.STRING, allowNull: false },
        password: { type: Sequelize.STRING, allowNull: false },
        createdAt: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.fn('NOW'),
        },
        updatedAt: { type: Sequelize.DATE, allowNull: true },
      },
      {
        sequelize,
        timestamps: true,
        underscored: false,
        modelName: 'Master',
        tableName: 'masters',
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
    db.Master.hasMany(db.Club);
  }
}
