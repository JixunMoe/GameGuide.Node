/**
 * Created by Jixun on 15/08/2016.
 */
requirejs.config({
  baseUrl: '/lib',
  paths: {
    Loader: '/javascripts/Loader',
    jquery: 'jquery-3.1.0',
  },
  shim: {
    backbone: {
      deps: ['jquery', 'underscore']
    },

    bootstrap: {
      deps: ['jquery']
    }
  },

  hbars: {
    extension: '.hbs',
    path: '/templates/'
  }
});

require(['bootstrap']);