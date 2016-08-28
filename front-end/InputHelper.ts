/**
 * Created by Jixun on 18/08/2016.
 */

import Backbone = require('backbone');
import _ = require('underscore');
import $ = require('jquery');

export class InputHelper {
  private base: Backbone.View<Backbone.Model>;
  private keys: string[];

  constructor(base: Backbone.View<Backbone.Model>) {
    this.base = base;
    this.keys = [];

    // console.info(this.base.$el, base.$el);
    // console.info('Bind event on: ', this.base.$el);
    this.base.$el.on('change', '.data-input', this.changed.bind(this));
  }

  bind(key: string, el: string|JQuery): InputHelper {
    if (_.contains(this.keys, key))
      throw new Error('Duplicate key.');

    var $el = (el instanceof jQuery) ? $(el) : this.base.$(el as string);
    $el.addClass('data-input').data({
      key: key,
      helperInstance: this
    });

    let value = InputHelper.getValue($el);
    if (value != this.base.model.get(key)) {
      this.base.model.set(key, value);
    }

    /*
    this.base.model.on(`change:${key}`, (model: Backbone.Model, value: any) => {
      // TODO: SYNC ?
    });
    */

    this.keys.push(key);
    return this;
  }

  static getValue($el: JQuery): boolean|string {
    if ($el.is(':checkbox'))
      return $el.prop('checked');

    return $el.val();
  }

  static setValue($el: JQuery, value: boolean|string) {
    let key = $el.data('key');
    if ($el.is(':checkbox')) {
      $el.prop('checked', value)
    } else {
      $el.val(value as string);
    }
  }

  changed(e: JQueryEventObject) {
    let $el = $(e.currentTarget);
    let data = $el.data();

    if (data.helperInstance == this) {
      console.info(`Sync ${data.key}`);
      this.base.model.set(data.key, InputHelper.getValue($el));
      e.preventDefault();
      e.stopPropagation();
    }
  }

  sync() {
    $('.data-input', this.base.$el).each((i, input) => {
      let $input = $(input);
      let data = $input.data();

      if (data.helperInstance == this) {
        this.base.model.set(data.key, InputHelper.getValue($input));
      }
    });
  }

  syncToUi(key: string) {
    // console.info(`syncToUi: ${key}`);
    $('.data-input', this.base.$el).each((i, input) => {
      let $input = $(input);
      let data = $input.data();

      if (data.helperInstance == this && data.key == key) {
        InputHelper.setValue($input, this.base.model.get(data.key));
      }
    });
  }
}