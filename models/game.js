'use strict';
module.exports = function(sequelize, DataTypes) {
  var Game = sequelize.define('Game', {
    name: DataTypes.STRING,
    url: DataTypes.STRING,
    release_id: DataTypes.STRING,
    release_date: DataTypes.DATE,
    cover_url: DataTypes.STRING,
    description: DataTypes.STRING
  }, {
    indexes: [
      {
        unique: true,
        fields: ['url', 'name']
      }
    ],
    classMethods: {
      associate: function(models) {
        Game.hasMany(models.Guide);

        Game.belongsTo(models.User, {
          onDelete: "CASCADE",
          foreignKey: {
            allowNull: false
          }
        });
      }
    }
  });
  return Game;
};