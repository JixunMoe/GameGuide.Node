/**
 * Created by Jixun on 17/08/2016.
 */

import Handlebars = require('handlebars');
import Backbone = require('backbone');
import marked = require('FixMarkdown');

interface IChapterResponse {
  success: boolean,
  data: string,
  updated: string,
}

export class Chapter extends Backbone.Model {
  get loaded(): boolean {
    return this.get('loaded');
  }

  set loaded(value: boolean) {
    this.set('loaded', value);
  }

  defaults(): Backbone.ObjectHash {
    return {
      id: 0,
      url: '',
      title: '',
      content: '正在加载...',
      loaded: false,
      el: null,
      active: false,
      updated: '-'
    }
  }

  load() {
    if (this.loaded) return ;

    let id = this.get('id');

    $.getJSON(`/api/chapter/${ id }`, (data: IChapterResponse) => {
      if (data.success) {
        this.loaded = true;
        this.content = marked(data.data);
        this.updated = data.updated;
      } else {
        alert(`抓取章节数据出错

ID: ${ id }
标题: ${ this.title }`);
      }
    });
  }

  get el(): JQuery {
    return this.get('el');
  }

  set active(active: boolean) {
    this.set('active', active);
    this.el.toggleClass('active', active);
  }

  get active(): boolean {
    return this.get('active');
  }


  get title(): string {
    return this.get('title');
  }

  get content(): string {
    return this.get('content');
  }

  set content(value: string) {
    this.set('content', value)
  }

  get updated(): string { return this.get('updated'); }
  set updated(value: string) { this.set('updated', value); }
}

export class Chapters extends Backbone.Collection<Chapter> {
}

export class GuideModel extends Backbone.Model {
  defaults():Backbone.ObjectHash {
    return {
      chapter: null,
      chapters: new Chapters()
    };
  }

  get chapters(): Chapters{
    return this.get('chapters') as Chapters;
  }

  get chapter(): Chapter {
    return this.get('chapter');
  }

  set chapter(value: Chapter) {
    this.set('chapter', value);
  }

  /**
   * Get active chapter.
   * @returns {Chapter}
   */
  get activeChapter(): Chapter {
    let chapter = this.chapters.findWhere({active: true});

    // No active activeChapter, set one up.
    if (!chapter) {
      chapter = this.chapters.at(0);
      chapter.active = true;
    }

    return chapter;
  }

  /**
   * Set chapter as active.
   */
  setActiveChapter(chapter: Chapter): Chapter {
    if (chapter) {
      var currentChapter = this.activeChapter;

      if (chapter != currentChapter) {
        currentChapter.active = false;
        chapter.active = true;
        this.chapter = chapter;
      }
    }

    return chapter;
  }

  /**
   * Set a chapter as active by url.
   */
  setActiveFromUrl(url: string): Chapter {
    return this.setActiveChapter(this.chapters.findWhere({url: url}));
  }
}
