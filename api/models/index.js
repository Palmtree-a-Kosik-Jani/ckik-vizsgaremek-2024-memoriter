const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
  process.env.DB_DATABASE, // Database name
  process.env.DB_USER,     // Database username
  process.env.DB_PASS,     // Database password
  {
    host: process.env.DB_HOST,    // Database host
    dialect: 'mysql',             // Dialect (MySQL in this case)
    logging: true,               // Disable logging (optional, especially for production)
    benchmark: true,    
    pool: {                       // Connection pool settings
      max: 50,                    // Max number of connections in the pool
      min: 0,                     // Min number of connections in the pool
      acquire: 60000,             // Max time (in ms) to wait for a connection
    }
  }
);


const Users = require('./Users')(sequelize);
const UserVerifyToken = require('./UserVerifyToken')(sequelize,Users);
const Librolingo = require('./Librolingo')(sequelize,Users);
const SzamonkeresekTanar = require('./SzamonkeresekTanar')(sequelize,Users);
const SzamonkeresekDiak = require('./SzamonkeresekDiak')(sequelize,SzamonkeresekTanar);
const Jelentesek = require('./Jelentesek')(sequelize);
const LibrolingoFeladatok = require('./LibrolingoFeladatok')(sequelize);
const Versek = require('./Versek')(sequelize);

sequelize.sync()
  .then(() => {
    console.log('Modellek szinkronizálva a táblákkal.');
  })
  .catch(error => {
    console.error('Hiba a szinkronizálás során:', error);
  });

UserVerifyToken.belongsTo(Users, { foreignKey: 'email', targetKey: 'email' });
Librolingo.belongsTo(Users, { foreignKey: 'email', targetKey: 'email' });
SzamonkeresekDiak.belongsTo(SzamonkeresekTanar, { foreignKey: 'szamonkereskod', targetKey: 'Diakkod' });
SzamonkeresekTanar.belongsTo(Users, { foreignKey: 'Letrehozta', targetKey: 'email' });

SzamonkeresekTanar.hasMany(SzamonkeresekDiak, { foreignKey: 'szamonkereskod', sourceKey: 'Diakkod' });
Users.hasMany(UserVerifyToken, { foreignKey: 'email', sourceKey: 'email' }); 
Users.hasMany(Librolingo, { foreignKey: 'email', sourceKey: 'email' });
Users.hasMany(SzamonkeresekTanar, { foreignKey: 'Letrehozta', sourceKey: 'email' });

module.exports = { sequelize, Users, UserVerifyToken, Librolingo, SzamonkeresekTanar, SzamonkeresekDiak, Jelentesek, LibrolingoFeladatok, Versek };