const { DataTypes } = require('sequelize');

module.exports = (sequelize,Users) => {
const UserVerifyToken = sequelize.define('UserVerifyToken', {
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true, 
    references: {
      model: Users, 
      key: 'email', 
    },
    onDelete: 'CASCADE', 
  },
  token: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    allowNull: false,
  },
}, {
  tableName: 'user_verify_token',
  timestamps: false,
});

UserVerifyToken.addHook('afterCreate', (token) => {
  setTimeout(() => {
    token.destroy();
  }, 30 * 60 * 1000);
});

return UserVerifyToken;
}