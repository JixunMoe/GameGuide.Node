/**
 * Created by Jixun on 15/08/2016.
 */

// 前台动态获取数据
require(['jquery', 'underscore', 'Backbone', 'marked'], function ($, _, Backbone, marked) {
  $(function () {
    var el = $('#guide');
    var _dataChapter = el.data('chapter');

    var Chapter = Backbone.Model.extend({
      defaults: {
        id: 0,
        url: '',
        title: '',
        content: '',
        loaded: false,
        el: null
      },

      load: function () {
        $.getJSON('/api/chapter/' + this.get('id'), data => {
          this.set('loaded', true);
          this.set('content', marked(data.data));
        });
      }
    });

    var Chapters = Backbone.Collection.extend({
      model: Chapter
    });
    var dataChapters = new Chapters();

    var GuideView = Backbone.View.extend({
      initialize: function () {
        this.listenTo(this.model, 'change', this.render);
      },

      /**
       * 更新视图。
       * @param url
       */
      setChapter: function (url) {
        _dataChapter = url;
        this.render();
      },

      render: function () {
        chapters.removeClass('active');
        var chapter = dataChapters.findWhere({url: _dataChapter});
        chapter.get('el').addClass('active');
        console.info(chapter);
        if (!chapter.get('loaded')) {
          chapter.load();
        }
        cTitle.text(chapter.get('title'));
        cContent.html(chapter.get('content'));
      }
    });

    var view = new GuideView({
      el: guide,
      model: dataChapters
    });

    // 构建章节列表
    var chapters = $('ul.chapters>.chapter', el);
    var chapter = $('#chapter', el);
    var cTitle = $('.title', el);
    var cContent = $('.content', el);

    chapters.each(function (i, c) {
      var $c = $(c);

      var content = '正在加载...';

      var url = $c.data('url');
      if (url == _dataChapter) {
        content = cContent.html();
      }

      dataChapters.add(new Chapter({
        el: $c,
        id: parseInt($c.data('id')),
        url: url,
        title: $c.text(),
        content: content,
        loaded: url == _dataChapter
      }));
    });

    var GuideRouter = Backbone.Router.extend({
      routes: {
        ':game/:guide/:chapter': 'chapter'
      },

      chapter: function (game, guide, chapter) {
        view.setChapter(chapter);
      }
    });

    var router = new GuideRouter();

    el.on('click', '.chapter', function (e) {
      e.preventDefault();
      router.navigate(this.getAttribute('href'), {trigger: true});
    });

    Backbone.history.start({pushState: true});
  });
});
