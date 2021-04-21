import Sequelize from 'sequelize';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
dotenv.config();

export default class User extends Sequelize.Model {
  static init(sequelize) {
    return super.init(
      {
        email: { type: Sequelize.STRING(40), allowNull: false, unique: true },
        username: { type: Sequelize.STRING(30), allowNull: false },
        password: { type: Sequelize.STRING, allowNull: false },
        type: {
          type: Sequelize.STRING(10),
          allowNull: false,
          defaultValue: 'local',
        },
        snsId: {
          type: Sequelize.STRING(30),
          allowNull: true,
        },
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
      as: 'ApplyUser',
    });
    db.User.belongsToMany(db.Club, {
      through: 'Bookmark',
      as: 'Bookmarked',
    });
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
        id: this.id,
        email: this.email,
        username: this.username,
        type: this.type,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: '1d',
      },
    );
  }
}
