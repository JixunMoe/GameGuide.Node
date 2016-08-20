'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {
    /*
      Add altering commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.createTable('users', { id: Sequelize.INTEGER });
    */
    return queryInterface.addIndex(
      'Users',
      ['name', 'email'],
      {
        indexName: 'unique_user',
        indicesType: 'UNIQUE'
      }
    ).then(() => queryInterface.addIndex(
      'Games',
      ['name', 'url'],
      {
        indexName: 'unique_game',
        indicesType: 'UNIQUE'
      })
    ).then(() => queryInterface.addIndex(
      'Guides',
      ['name', 'url'],
      {
        indexName: 'unique_guide',
        indicesType: 'UNIQUE'
      })
    );
  },

  down: function (queryInterface, Sequelize) {
    /*
      Add reverting commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.dropTable('users');
    */
    return queryInterface.removeIndex('Users', ['name', 'email'])
      .then(() => queryInterface.removeIndex('Games', ['name', 'url']))
      .then(() => queryInterface.removeIndex('Guides', ['name', 'url']));
  }
};
