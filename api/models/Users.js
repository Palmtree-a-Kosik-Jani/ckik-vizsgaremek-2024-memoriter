const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
const Users = sequelize.define('Users', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  Date: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  email: { 
    type: DataTypes.STRING,
    allowNull: true,
    unique: true,
  },
  userpassword: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  permission_level: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  xp: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  picture: {
    type: DataTypes.BLOB('long'),
    allowNull: true,
  },
  hitelesitve: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
}, {
  tableName: 'users',
  timestamps: false,
});

return Users;
}