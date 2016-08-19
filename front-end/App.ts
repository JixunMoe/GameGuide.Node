/**
 * Created by Jixun on 17/08/2016.
 */

import Router = require("./Router");
import Guide = require("./Guide");
import _ = require('underscore');
import {GuideEditor} from "./GuideEditor";
import Backbone = require('backbone');
import Model = Backbone.Model;

class App {
  public router:Router;
  public guide:Guide;
  public guideEditor: GuideEditor;
  public activeView: Backbone.View<Model>;

  init(){

  }

  run() {
    Backbone.history.start({pushState: true});
  }
}

export = new App();