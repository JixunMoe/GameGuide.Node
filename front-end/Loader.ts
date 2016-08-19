/**
 * Created by Jixun on 17/08/2016.
 */

/// <reference path="../typings/index.d.ts" />
import app = require('./App');
import Router = require("./Router");
import Guide = require("./Guide");
import {GuideEditor} from "./GuideEditor";

app.router = new Router();
app.guide = new Guide();
app.guideEditor = new GuideEditor();
app.router.render();

app.guideEditor.initialise();
app.guide.initialise();
app.run();

console.info('Loader: App is running.');