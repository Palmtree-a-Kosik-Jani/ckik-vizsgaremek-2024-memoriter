const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
const Versek = sequelize.define('Versek', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  Kolto: {
    type: DataTypes.STRING,
    defaultValue: 'Ismeretlen',
  },
  Cim: {
    type: DataTypes.STRING,
  },
  Ev: {
    type: DataTypes.STRING(11),
  },
  Szoveg: {
    type: DataTypes.TEXT,
  },
  Osztaly: {
    type: DataTypes.STRING(50),
  },
  Modosithato: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  }
}, {
  tableName: 'versek',
  timestamps: false,
});

return Versek;
}
