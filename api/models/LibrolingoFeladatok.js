const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
const LibrolingoFeladatok = sequelize.define('LibrolingoFeladatok', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  kerdes: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  rossz: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  jo: {
    type: DataTypes.TEXT,
    allowNull: false,
  }
}, {
  tableName: 'librolingofeladatok',
  timestamps: false,
});
return LibrolingoFeladatok;
}