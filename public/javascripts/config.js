/**
 * Created by Jixun on 15/08/2016.
 */
requirejs.config({
  baseUrl: '/lib',
  paths: {
    Loader: '/javascripts/Loader',
    jquery: 'jquery-3.1.0',
    duoshuo: duoshuoQuery.short_name
      ? 'https://static.duoshuo.com/embed'
      : '/javascripts/DummyDuoshuo'
  },
  shim: {
    backbone: {
      deps: ['jquery', 'underscore']
    },

    bootstrap: {
      deps: ['jquery']
    },

    duoshuo: {
      exports: 'DUOSHUO',
      init: function () {
        return this.DUOSHUO;
      }
    }
  },

  hbars: {
    extension: '.hbs',
    path: '/templates/'
  }
});

require(['bootstrap']);