import Sequelize from 'sequelize';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
require('dotenv').config();

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
    return await bcrypt.compare(password, this.password); // true / false
  }

  serialize() {
    const data = this.toJSON();
    // 응답할 데이터에서 password 필드 제거
    delete data.password;
    return data;
  }

  generateToken() {
    // 토큰 생성하여 리턴
    return jwt.sign(
      // 첫 번째 파라미터에는 토큰 안에 집어넣고 싶은 데이터
      {
        _id: this.id,
        email: this.email,
        username: this.username,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: '1d',
      },
    );
  }
}
