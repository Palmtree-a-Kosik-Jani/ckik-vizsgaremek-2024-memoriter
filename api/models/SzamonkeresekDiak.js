const { DataTypes } = require('sequelize');

module.exports = (sequelize,SzamonkeresekTanar) => {
const SzamonkeresekDiak = sequelize.define('SzamonkeresekDiak', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    szamonkereskod: {
      type: DataTypes.STRING,
      allowNull: false,
      references: {
        model: SzamonkeresekTanar,
        key: 'Diakkod',
      },
      onDelete: 'CASCADE',
    },
    Tanulo: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    Bekuldottvers: {
      type: DataTypes.STRING(6000),
      allowNull: true,
    },
    Eredmény: {
      type: DataTypes.STRING(15),
      allowNull: true,
    },
    Bekuldesido: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  }, {
    tableName: 'szamonkeresek_diak',
    timestamps: false,
  });
  return SzamonkeresekDiak;
}