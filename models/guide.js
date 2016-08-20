'use strict';
module.exports = function(sequelize, DataTypes) {
  var Guide = sequelize.define('Guide', {
    name: DataTypes.STRING,
    url: DataTypes.STRING,
    short_desc: DataTypes.STRING,
  }, {
    indexes: [
      {
        unique: true,
        fields: ['url', 'name']
      }
    ],
    classMethods: {
      associate: function(models) {
        Guide.hasMany(models.Chapter);

        Guide.belongsTo(models.User, {
          onDelete: "CASCADE",
          foreignKey: {
            allowNull: false
          }
        });

        Guide.belongsTo(models.Game, {
          onDelete: "CASCADE",
          foreignKey: {
            allowNull: false
          }
        });
      }
    }
  });
  return Guide;
};