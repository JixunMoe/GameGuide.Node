/**
 * Created by Jixun on 15/08/2016.
 */
requirejs.config({
  baseUrl: '/lib',
  paths: {
    app: '/javascripts',
    jquery: 'jquery-3.1.0'
  },
  shim: {
    backbone: {
      deps: ['jquery', 'underscore']
    },

    bootstrap: {
      deps: ['jquery']
    }
  }
});

require(['bootstrap']);