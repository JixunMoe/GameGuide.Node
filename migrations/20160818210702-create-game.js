'use strict';
module.exports = {
  up: function(queryInterface, Sequelize) {
    return queryInterface.createTable('Games', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      name: {
        type: Sequelize.STRING(40)
      },
      url: {
        type: Sequelize.STRING(40)
      },
      release_id: {
        type: Sequelize.STRING(20)
      },
      cover_url: {
        type: Sequelize.STRING(255)
      },
      description: {
        type: Sequelize.TEXT
      },
      release_date: {
        allowNull: true,
        type: Sequelize.DATE,
        defaultValue: null
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    }, {
      indexes: [
        {
          unique: true,
          fields: ['url']
        }
      ]
    });
  },
  down: function(queryInterface, Sequelize) {
    return queryInterface.dropTable('Games');
  }
};