/**
 * Created by Jixun on 17/08/2016.
 */

import Router = require("./Router");
import Guide = require("./Guide");

class App {
  public router:Router;
  public guide:Guide;

  init(){

  }

  run() {
    Backbone.history.start({pushState: true});
  }
}

export = new App();