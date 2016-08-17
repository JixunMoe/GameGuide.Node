define("Router", ["require", "exports", 'backbone', "App"], function (require, exports, Backbone, app) {
    "use strict";
    class Router extends Backbone.Router {
        initialize(options) {
            super.initialize(options);
            this.on('route', this.render);
        }
        render() {
            console.info('Render components on page.');
            $('.render').each((i, render) => {
                let $render = $(render);
                let type = $render.attr('render');
                var comp = app[type];
                if (comp) {
                    console.info(`Render ${type}`);
                    comp.initComponent($render);
                    $render.removeClass('render');
                }
            });
        }
    }
    return Router;
});
define("GuideModel", ["require", "exports", 'backbone', 'marked'], function (require, exports, Backbone, marked) {
    "use strict";
    class Chapter extends Backbone.Model {
        get loaded() {
            return this.get('loaded');
        }
        set loaded(value) {
            this.set('loaded', value);
        }
        defaults() {
            return {
                id: 0,
                url: '',
                title: '',
                content: '正在加载...',
                loaded: false,
                el: null,
                active: false
            };
        }
        load() {
            if (this.loaded)
                return;
            $.getJSON(`/api/chapter/${this.get('id')}`, (data) => {
                this.loaded = true;
                this.content = marked(data.data);
            });
        }
        get el() {
            return this.get('el');
        }
        set active(active) {
            this.set('active', active);
            this.el.toggleClass('active', active);
        }
        get active() {
            return this.get('active');
        }
        get title() {
            return this.get('title');
        }
        get content() {
            return this.get('content');
        }
        set content(value) {
            this.set('content', value);
        }
    }
    exports.Chapter = Chapter;
    class Chapters extends Backbone.Collection {
    }
    exports.Chapters = Chapters;
    class GuideModel extends Backbone.Model {
        defaults() {
            return {
                chapter: null,
                chapters: new Chapters()
            };
        }
        get chapters() {
            return this.get('chapters');
        }
        get chapter() {
            return this.get('chapter');
        }
        set chapter(value) {
            this.set('chapter', value);
        }
        get activeChapter() {
            let chapter = this.chapters.findWhere({ active: true });
            if (!chapter) {
                chapter = this.chapters.at(0);
                chapter.active = true;
            }
            return chapter;
        }
        setActiveChapter(chapter) {
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
        setActiveFromUrl(url) {
            return this.setActiveChapter(this.chapters.findWhere({ url: url }));
        }
    }
    exports.GuideModel = GuideModel;
});
define("Guide", ["require", "exports", 'backbone', "GuideModel", "App"], function (require, exports, Backbone, GuideModel, app) {
    "use strict";
    class GuideView extends Backbone.View {
        initialize(options) {
            super.initialize(options);
            this.$title = $('.title', this.$el);
            this.$content = $('.content', this.$el);
            this.$chapters = $('.chapters', this.$el);
        }
        events() {
            return {
                "click .chapter": this.clickChapter
            };
        }
        clickChapter(e) {
            var $chapter = $(e.target);
            var chapter = this.model.setActiveFromUrl($chapter.data('url'));
            if (chapter) {
                e.preventDefault();
                app.router.navigate($chapter.attr('href'), { trigger: true });
                chapter.load();
            }
        }
        ;
        populate() {
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
            console.info(chapter);
            chapter.loaded = true;
            chapter.content = this.$content.html();
            this.listenTo(this.model.chapters, 'change', this.render.bind(this));
            console.info('Guide: Initial data populated.');
        }
        render() {
            var chapter = this.model.activeChapter;
            this.$title.text(chapter.title);
            this.$content.html(chapter.content);
            return this;
        }
    }
    class Guide {
        initComponent(el) {
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
        route(game, guide, chapter) {
            console.info(`Chapter -> ${chapter}`);
            this.view.model.setActiveFromUrl(chapter);
        }
    }
    return Guide;
});
define("App", ["require", "exports"], function (require, exports) {
    "use strict";
    class App {
        init() {
        }
        run() {
            Backbone.history.start({ pushState: true });
        }
    }
    return new App();
});
define("Loader", ["require", "exports", "App", "Router", "Guide"], function (require, exports, app, Router, Guide) {
    "use strict";
    app.router = new Router();
    app.guide = new Guide();
    app.router.render();
    app.guide.initialise();
    app.run();
    console.info('Loader: App is running.');
});
//# sourceMappingURL=Loader.js.map