'use strict';
module.exports = function(sequelize, DataTypes) {
  var Chapter = sequelize.define('Chapter', {
    name: DataTypes.STRING,
    url: DataTypes.STRING,
    content: DataTypes.TEXT('long'),
    order: DataTypes.INTEGER,
    is_header: DataTypes.BOOLEAN
  }, {
    classMethods: {
      associate: function(models) {
        Chapter.belongsTo(models.Guide, {
          onDelete: "CASCADE",
          foreignKey: {
            allowNull: false
          }
        });
      }
    }
  });
  return Chapter;
};