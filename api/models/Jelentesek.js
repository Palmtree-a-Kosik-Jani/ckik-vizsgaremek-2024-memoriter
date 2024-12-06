const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
const Jelentesek = sequelize.define('Jelentesek', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  felado: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  szoveg: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  javitva: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  }
}, {
  tableName: 'jelentesek',
  timestamps: false,
});
return Jelentesek;
}
