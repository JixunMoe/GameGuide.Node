/**
 * Created by Jixun on 18/08/2016.
 */

///<amd-dependency path="hbars!edit-chapter" />
import {InputHelper} from "./InputHelper";
import Backbone = require('backbone');
import Handlebars = require('handlebars');
import app = require('./App');
import {Chapter, GuideViewBase, GuideModel, IChapter, Chapters, ChapterViewBase} from "./GuideEditorModel";
var tplEditChapter:HandlebarsTemplateDelegate = require('hbars!edit-chapter');

export class GuideEditorView extends GuideViewBase {
  private inputHelper: InputHelper;
  private $chapters: JQuery;


  initialize(options?:Backbone.ViewOptions<GuideModel>):void {
    super.initialize(options);

    this.inputHelper = new InputHelper(this);
    this.$chapters = this.$('.chapters');
  }

  events():Backbone.EventsHash {
    return {
      'click button.submit': this.submit,
      'click button.add-chapter': this.addChapterClick
    }
  }

  addChapterClick(e:JQueryEventObject) {
    let chapters: IChapter[] = this.model.chapters.toJSON();
    let maxOrder = chapters.reduce((max, chapter) => Math.max(max, chapter.order), 0);

    this.addChapter({
      id: 0,
      guide_id: 0,
      url: '新的章节',
      name: '新的章节',
      content: '',
      order: maxOrder + 1
    });
  }

  addChapter(chapter: IChapter) {
    let model = new Chapter(chapter);
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
    }).fail(r => {
      $btnSubmit.prop('disabled', false);
      alert('储存攻略发生错误，请稍后重试。');
    });
  }

  populate() {
    this.inputHelper
      .bind('name', '#guide-name')
      .bind('short_desc', '#guide-desc')
      .bind('url', '#guide-url');

    // TODO: Generate chapters
    let chapters: IChapter[] = this.$el.data('chapters');
    this.$el.removeAttr('data-chapters');
    chapters.forEach(this.addChapter, this);
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
