const { DataTypes } = require('sequelize');

module.exports = (sequelize,Users) => {
const SzamonkeresekTanar = sequelize.define('SzamonkeresekTanar', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    Letrehozva: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    Szamonkeresneve: {
      type: DataTypes.STRING(10),
      allowNull: false,
    },
    Vers: {
      type: DataTypes.STRING(8000),
      allowNull: false,
    },
    Elindítva: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    Letrehozta: {
      type: DataTypes.STRING,
      allowNull: false,
      references: {
        model: Users,
        key: 'email',
      },
      onDelete: 'CASCADE',
    },
    Diakkod: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: true, 
    },
    Verscim: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    Kiszedettszavak: {
      type: DataTypes.STRING(500),
      allowNull: false,
    },
  }, {
    tableName: 'szamonkeresek_tanar',
    timestamps: false,
  });

  return SzamonkeresekTanar;
}