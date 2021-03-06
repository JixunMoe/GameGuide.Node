/**
 * Created by Jixun on 18/08/2016.
 */

///<amd-dependency path="hbars!edit-chapter" />
import {InputHelper} from "./InputHelper";
import Backbone = require('backbone');
import Handlebars = require('handlebars');
import app = require('./App');
import {
  Chapter, GuideViewBase, GuideModel, IChapter, ChapterViewBase,
  IChapterBase, IChapterHeader, IRemoteChapter
} from "./GuideEditorModel";
import { Storage } from "./Storage";
var tplEditChapter:HandlebarsTemplateDelegate = require('hbars!edit-chapter');

export class GuideEditorView extends GuideViewBase {
  private inputHelper: InputHelper;
  private $chapters: JQuery;
  private _storage: Storage;

  initialize(options?:Backbone.ViewOptions<GuideModel>):void {
    super.initialize(options);

    this.inputHelper = new InputHelper(this);
    this.$chapters = this.$('.chapters');
  }

  events():Backbone.EventsHash {
    return {
      'click button.submit': this.submit,
      'click button.add-chapter': this.addChapterClick,
      'click button.add-header': this.addHeaderClick
    }
  }

  get maxOrder(): number {
    return this.model.chapters.reduce((max, chapter) => Math.max(max, chapter.order), 1);
  }

  addChapterClick(e:JQueryEventObject) {
    let chapter: IChapter = {
      is_header: false,
      chapter_id: 0,
      guide_id: 0,
      url: '新的章节',
      name: '新的章节',
      content: '',
      order: this.maxOrder + 1
    };
    this.addChapter(chapter, true);
  }

  addHeaderClick(e:JQueryEventObject) {
    let chapter: IChapterHeader = {
      is_header: true,
      chapter_id: 0,
      name: '新的标题',
      order: this.maxOrder + 1
    };
    this.addChapter(chapter, true);
  }

  addChapter(chapter: IChapterBase, is_new: boolean) {
    let model = new Chapter(chapter);
    if (is_new) model.dataChanged();
    let el = $(tplEditChapter(chapter)).appendTo(this.$chapters);
    var view = new ChapterEditorView({
      model: model,
      el: el
    });
    view.populate();
    model.view = view;

    this.model.chapters.add(model);
  }

  submit(e: JQueryEventObject) {
    e.preventDefault();
    let $btnSubmit = this.$('button.submit').prop('disabled', true);

    let guide_id = this.$el.data('guide-id');

    let data = this.model.toJSON();
    data._csrf = this.$el.data('csrf');
    data.gameId = this.$el.data('game-id');
    $.ajax({
      type: 'POST',
      url: `/api/update/guide/${guide_id}`,
      data: JSON.stringify(data),
      contentType: 'application/json',
      dataType: 'json'
    }).done(result => {
      if (result.location) {
        location.pathname = result.location;
      }
    }).fail(err => {
      $btnSubmit.prop('disabled', false);
      alert(`储存攻略发生错误，请稍后重试。

如果问题依旧，请检查攻略名称与 url 是否已经被占用。`);
    });
  }

  populate() {
    this.inputHelper
      .bind('name', '#guide-name')
      .bind('short_desc', '#guide-desc')
      .bind('url', '#guide-url');

    let gid = this.$el.data('guide-id');
    this._storage = new Storage(`guide_${ gid }`);

    let chapters: IChapter[] = this.$el.data('chapters');
    this.$el.removeAttr('data-chapters');
    let remoteChapters: number[] = [];
    chapters.forEach(chapter => {
      if (!chapter.is_header && chapter.chapter_id) {
        var chap_data: IChapter = this._storage.get(chapter.chapter_id);
        if (!chap_data || chap_data.updated != chapter.updated) {
          remoteChapters.push(chapter.chapter_id);
        } else if (chap_data) {
          chapter.content = chap_data.content;
        }
      }
      this.addChapter(chapter, false);
    }, this);

    if (remoteChapters.length > 0) {
      let chapterIds = remoteChapters.join(',');
      $.getJSON(`/api/chapters/${ gid }/${ chapterIds }`)
        .done(data => {
          if (data.success) {
            let chapters: IRemoteChapter[] = data.data;

            chapters.forEach(chapter => {
              let chap = this.model.chapters.byId(chapter.id);

              let oldChangeDetection = chap.disableChangeDetection;
              chap.disableChangeDetection = true;
              chap.content = chapter.content;
              chap.disableChangeDetection = oldChangeDetection;

              let view = (chap.view as ChapterEditorView);
              view.syncChapter();

              var chap_data: IChapter = this._storage.get(chapter.id) || {};
              chap_data.updated = chapter.updated;
              chap_data.content = chapter.content;
              this._storage.set(chapter.id, chap_data);
            });
          } else {
            alert(data.data);
          }
        })
        .fail(err => {
          alert('网络或服务器错误，请稍后刷新重试。');
        });
    }
  }
}

export class ChapterEditorView extends ChapterViewBase{
  private inputHelper: InputHelper;
  private $preview: JQuery;

  initialize(options?:Backbone.ViewOptions<Chapter>):void {
    super.initialize(options);

    this.inputHelper = new InputHelper(this);
    this.$preview = this.$('.preview');
    this.render();

    this.model.on('change:preview', this.render, this);
  }

  render():Backbone.View<Chapter> {
    this.$preview.html(this.model.preview);
    return this;
  }

  populate() {
    this.inputHelper
      .bind('url', '.url')
      .bind('name', '.name')
      .bind('content', '.content')
      .bind('remove', '.delete')
      .bind('order', '.order');
  }

  syncChapter() {
    this.inputHelper.syncToUi('content');
  }
}

export class GuideEditor implements IAppComponent {
  public view: GuideEditorView;

  initComponent(el:string|JQuery):void {
    console.info('initComponent: GuideEditor');
    this.view = new GuideEditorView({
      el: el,
      model: new GuideModel()
    });
    this.view.populate();
  }

  initialise() {
    app.router.route('new/guide/:game', 'addGuide', this.route);
    // app.router.route(':game/:guide/edit', 'editGuide', this.route);
  }

  route(){
    // TODO: add route proc.
  }
}
