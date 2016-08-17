/**
 * Created by Jixun on 17/08/2016.
 */

/// <reference path="../typings/index.d.ts" />
import Backbone = require('backbone');
import app = require('./App');

class Router extends Backbone.Router {
  initialize(options?:Backbone.RouterOptions):void {
    super.initialize(options);

    this.on('route', this.render);
  }

  render(){
    console.info('Render components on page.');
    // Look for .render, and render if we can.
    $('.render').each((i, render) => {
      let $render = $(render);
      let type: string = $render.attr('render');
      var comp = (app as any)[type] as IAppComponent;

      if (comp) {
        console.info(`Render ${type}`);
        comp.initComponent($render);
        $render.removeClass('render');
      }
    });
  }
}

export = Router