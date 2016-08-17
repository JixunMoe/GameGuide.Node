/**
 * Created by Jixun on 17/08/2016.
 */

/// <reference path="../typings/index.d.ts" />
import app = require('./App');
import Router = require("./Router");
import Guide = require("./Guide");

app.router = new Router();
app.guide = new Guide();
app.router.render();

app.guide.initialise();
app.run();

console.info('Loader: App is running.');