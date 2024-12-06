const { DataTypes } = require('sequelize');

module.exports = (sequelize,Users) => {
const Librolingo = sequelize.define('Librolingo', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    references: {
      model: Users, 
      key: 'email',
    },
    onDelete: 'CASCADE',
  },
  feladatkod: {
    type: DataTypes.STRING(30),
    allowNull: false,
  },
  megoldas: {
    type: DataTypes.STRING(150),
    allowNull: false,
  },
  feladat: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  bekuldott: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  Date: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    allowNull: false,
  },
  Megoldva: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  Helyes: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
}, {
  tableName: 'librolingo',
  timestamps: false,
});
return Librolingo;
}
