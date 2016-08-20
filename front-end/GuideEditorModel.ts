/**
 * Created by Jixun on 18/08/2016.
 */

import Backbone = require('backbone');
import marked = require('marked');

export class GuideViewBase extends Backbone.View<GuideModel> {}
export class ChapterViewBase extends Backbone.View<Chapter>{}

export interface IChapter {
  chapter_id: number;
  guide_id: number;
  url: string;
  name: string;
  content: string;
  order: number;

  remove?: boolean;
  preview?: string;
  view?: ChapterViewBase;
}

export class Chapter extends Backbone.Model {
  initialize(attributes?:any, options?:any):void {
    super.initialize(attributes, options);

    this.on('change:content', this.updatePreview);
    this.updatePreview();
  }

  updatePreview () {
    this.preview = marked(this.content);
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
      content: ''
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

  toJSON(options?:any):any {
    if (this.remove) {
      return { chapter_id: this.id, remove: true };
    }

    let result = super.toJSON(options);
    delete result.preview;
    delete result.view;
    delete result.guide_id;
    return result;
  }
}

export class Chapters extends Backbone.Collection<Chapter> {

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
