/**
 * Created by Jixun on 17/08/2016.
 */

/// <reference path="AppInterface.ts" />
import Backbone = require('backbone');
import GuideModel = require('./GuideModel');
import app = require('./App');
import EventsHash = Backbone.EventsHash;

interface ChaptersData {
  url: string,
  title: string,
  chapter_id: number
}

class GuideView extends Backbone.View<GuideModel.GuideModel> {
  private $title: JQuery;
  private $content: JQuery;
  private $chapters: JQuery;

  initialize(options?:Backbone.ViewOptions<GuideModel.GuideModel>):void {
    super.initialize(options);

    this.$title = $('.title', this.$el);
    this.$content = $('.content', this.$el);
    this.$chapters = $('.chapters', this.$el);
  }

  events(): EventsHash {
    return {
      "click .chapter": this.clickChapter
    };
  }

  clickChapter(e: JQueryEventObject){
    var $chapter = $(e.target);
    var chapter = this.model.setActiveFromUrl($chapter.data('url'));
    if (chapter) {
      e.preventDefault();

      app.router.navigate($chapter.attr('href'), {trigger: true});
      chapter.load();
    }
  };

  populate() {
    // Get chapter list.
    var chapters = this.model.chapters;
    this.$chapters.children('.chapter').each((i, chapter) => {
      let $chapter = $(chapter);
      chapters.add(new GuideModel.Chapter({
        id: parseInt($chapter.data('id')),
        url: $chapter.data('url'),
        title: $chapter.text().trim(),
        active: $chapter.hasClass('active'),
        el: $chapter,
        loaded: false
      }));
    });


    var chapter = this.model.activeChapter;
    console.info(chapter)

    // Load data from page.
    chapter.loaded = true;
    chapter.content = this.$content.html();

    this.listenTo(this.model.chapters, 'change', this.render.bind(this));

    console.info('Guide: Initial data populated.');
  }

  render():Backbone.View<GuideModel.GuideModel> {
    var chapter = this.model.activeChapter;
    this.$title.text(chapter.title);
    this.$content.html(chapter.content);
    return this;
  }


}

class Guide implements IAppComponent {
  public view:GuideView;

  initComponent(el: string):void {
    console.info('initComponent: Guide');
    this.view = new GuideView({
      el: el,
      model: new GuideModel.GuideModel()
    });
    this.view.populate();
  }

  initialise() {
    app.router.route(':game/:guide/:chapter', 'guide', this.route.bind(this));
  }

  route (game: string, guide: string, chapter: string) {
    console.info(`Chapter -> ${chapter}`);
    this.view.model.setActiveFromUrl(chapter);
  }
}

export = Guide;