/**
 * Created by Jixun on 18/08/2016.
 */

import Backbone = require('backbone');
import marked = require("./FixMarkdown");

export class GuideViewBase extends Backbone.View<GuideModel> {}
export class ChapterViewBase extends Backbone.View<Chapter>{}

export interface IChapterBase {
  chapter_id: number;
  remove?: boolean;
}

export interface IChapterHeader extends IChapterBase {
  is_header: boolean;
  name: string;
  order: number;
}

export interface IChapter extends IChapterBase {
  is_header: boolean;
  name: string;
  order: number;

  guide_id: number;
  url: string;
  content: string;

  preview?: string;
  view?: ChapterViewBase;
}

export class Chapter extends Backbone.Model {
  private _dataChanged: boolean = false;
  private static _detectChange: string[] = 'url,name,order,remove,content'.split(',');

  initialize(attributes?:any, options?:any):void {
    super.initialize(attributes, options);

    this.on('change:content', this.updatePreview);
    Chapter._detectChange.forEach(key => {
      this.on(`change:${key}`, this.dataChanged);
    });
    this.updatePreview();
  }

  dataChanged() {
    this._dataChanged = true;

    // Turn off all listeners.
    Chapter._detectChange.forEach(key => {
      this.off(`change:${key}`, this.dataChanged);
    });
  }

  updatePreview () {
    if (!this.is_header) {
      this.preview = marked(this.content);
    }
  }

  defaults():Backbone.ObjectHash {
    return {
      view: null,
      chapter_id: 0,
      guide_id: null,
      url: null,
      name: null,
      order: null,
      remove: false,
      content: '',
      is_header: false
    };
  }

  get chapter_id(): number { return this.get('chapter_id'); }
  set chapter_id(value: number) { this.set('chapter_id', value); }

  get guide_id(): number { return this.get('guide_id'); }
  set guide_id(value: number) { this.set('guide_id', value); }

  get url(): string { return this.get('url'); }
  set url(value: string) { this.set('url', value); }

  get name(): string { return this.get('name'); }
  set name(value: string) { this.set('name', value); }

  get content(): string { return this.get('content'); }
  set content(value: string) { this.set('content', value); }

  get order(): number { return this.get('order'); }
  set order(value: number) { this.set('order', value); }

  get view(): ChapterViewBase { return this.get('view'); }
  set view(value: ChapterViewBase) { this.set('view', value); }

  get preview(): string { return this.get('preview'); }
  set preview(value: string) { this.set('preview', value); }

  get remove(): boolean { return this.get('remove'); }
  set remove(value: boolean) { this.set('remove', value); }

  get is_header(): boolean { return this.get('is_header'); }
  set is_header(value: boolean) { this.set('is_header', value); }

  toJSON(options?:any):IChapterHeader|IChapter|IChapterBase {
    // unchanged.
    if (!this._dataChanged) {
      return null;
    }

    if (this.remove) {
      // chapter does not even exist yet.
      if (0 === this.chapter_id)
        return null;

      return { chapter_id: this.chapter_id, remove: true };
    }

    if (this.is_header) {
      return {
        chapter_id: this.chapter_id,
        is_header: true,
        name: this.name,
        order: this.order
      };
    }

    let result = super.toJSON(options);
    delete result.preview;
    delete result.view;
    delete result.guide_id;
    return result;
  }
}

export class Chapters extends Backbone.Collection<Chapter> {
  toJSON(options?: any): any {
    let result = super.toJSON(options);
    return result.filter((chapter:IChapterBase) => chapter);
  }
}

export class GuideModel extends Backbone.Model {
  defaults():Backbone.ObjectHash {
    return {
      name: '',
      url: '',
      short_desc: '',
      chapters: new Chapters()
    };
  }

  get chapters(): Chapters {
    return this.get('chapters');
  }

  set chapters(value: Chapters) {
    this.set('chapters', value);
  }

  get name(): string {
    return this.get('name');
  }

  get url(): string {
    return this.get('url');
  }

  toJSON(options?:any):any {
    let result = super.toJSON(options);
    result.chapters = this.chapters.toJSON();
    return result;
  }
}
