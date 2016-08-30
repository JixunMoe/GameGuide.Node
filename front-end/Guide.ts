/**
 * Created by Jixun on 17/08/2016.
 */

///<amd-dependency path="duoshuo" />
/// <reference path="AppInterface.ts" />
import Backbone = require('backbone');
import app = require('./App');
import EventsHash = Backbone.EventsHash;
import {GuideModel, Chapter} from "./GuideModel";
var Duoshuo: any = require('duoshuo');

interface ChaptersData {
  url: string,
  title: string,
  chapter_id: number
}

class GuideView extends Backbone.View<GuideModel> {
  private $title: JQuery;
  private $content: JQuery;
  private $chapters: JQuery;
  private $updated: JQuery;

  private lastChapterId: number = -1;
  private $commentContainer: JQuery;
  private $comment: JQuery;

  initialize(options?:Backbone.ViewOptions<GuideModel>):void {
    super.initialize(options);

    this.$title = this.$('.title');
    this.$content = this.$('.content');
    this.$updated = this.$('.updated-at');

    this.$chapters = this.$('.chapters');
    this.$commentContainer = this.$('.comments-container');
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
      chapters.add(new Chapter({
        id: parseInt($chapter.data('id')),
        url: $chapter.data('url'),
        title: $chapter.text().trim(),
        active: $chapter.hasClass('active'),
        el: $chapter,
        loaded: false
      }));
    });


    var chapter = this.model.activeChapter;

    // Load data from page.
    chapter.loaded = true;
    chapter.content = this.$content.html();
    chapter.updated = this.$updated.text();

    this.listenTo(this.model.chapters, 'change', this.render.bind(this));
    this.render();

    console.info('Guide: Initial data populated.');
  }

  render():Backbone.View<GuideModel> {
    let guide = this.$el.data('guide');
    var chapter = this.model.activeChapter;
    this.$title.text(chapter.title);
    this.$content.html(chapter.content);
    this.$updated.text(chapter.updated);
    let sep = "\x20- ";

    document.title = `${chapter.title}${sep}${guide}${sep}梦姬攻略网`;

    if (!Duoshuo.dummy) {
      let id = chapter.get('id');
      if (id != this.lastChapterId) {
        // 加载多说评论框
        this.lastChapterId = id;
        console.info(`load duoshuo for chapter ${id}`);

        if (this.$comment) this.$comment.remove();
        this.$comment = $('<div>')
          .data({
            'thread-key': chapter.id,
            'url': location.protocol + '//' + location.host + '/c/' + chapter.id,
            'author-key': this.$el.data('author'),
            'title': `${chapter.title}${sep}${guide}`,
          });
        Duoshuo.EmbedThread(this.$comment);
        this.$commentContainer
          .append(this.$comment)
          // 据说多说能在 300ms 加载完毕评论列表
          .fadeOut(100)
          .delay(100)
          .fadeIn(100);
      }
    }
    return this;
  }


}

class Guide implements IAppComponent {
  public view:GuideView;

  initComponent(el: string):void {
    console.info('initComponent: Guide');
    this.view = new GuideView({
      el: el,
      model: new GuideModel()
    });

    this.view.populate();
    app.activeView = this.view;
  }

  initialise() {
    app.router.route('guide/:guide/:chapter', 'guide', this.route.bind(this));
  }

  route (guide: string, chapter: string) {
    if (this.view) {
      if (chapter != 'edit') {
        console.info(`Chapter -> ${chapter}`);
        this.view.model.setActiveFromUrl(chapter);
      }
    }
  }
}

export = Guide;