import Sequelize from 'sequelize';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

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
          defaultValue: Sequelize.NOW,
        },
        updatedAt: { type: Sequelize.DATE, allowNull: true },
      },
      {
        sequelize,
        timestamps: false,
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

  static findByEmail(email) {
    return this.findOne({ where: { email: email } });
  }

  async checkPassword(password) {
    return await bcrypt.compare(password, this.password);
  }

  serialize() {
    const data = this.toJSON();
    delete data.password;
    return data;
  }
   generateToken() {
    return jwt.sign(
      {
        _id: this.id,
        email: this.email,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: '1d',
      },
    );
  }
}
