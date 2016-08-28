/**
 * Created by Jixun on 17/08/2016.
 */
define("Router", ["require", "exports", 'backbone', "App"], function (require, exports, Backbone, app) {
    "use strict";
    class Router extends Backbone.Router {
        constructor(...args) {
            super(...args);
            this.needFetchFromServer = false;
        }
        initialize(options) {
            super.initialize(options);
            this.on('route', this.render);
        }
        render() {
            // Look for .render, and render if we can.
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
/**
 * Created by Jixun on 17/08/2016.
 */
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
        /**
         * Get active chapter.
         * @returns {Chapter}
         */
        get activeChapter() {
            let chapter = this.chapters.findWhere({ active: true });
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
        /**
         * Set a chapter as active by url.
         */
        setActiveFromUrl(url) {
            return this.setActiveChapter(this.chapters.findWhere({ url: url }));
        }
    }
    exports.GuideModel = GuideModel;
});
/**
 * Created by Jixun on 17/08/2016.
 */
define("Guide", ["require", "exports", 'backbone', "App", "GuideModel", "duoshuo"], function (require, exports, Backbone, app, GuideModel_1) {
    "use strict";
    var Duoshuo = require('duoshuo');
    class GuideView extends Backbone.View {
        constructor(...args) {
            super(...args);
            this.lastChapterId = -1;
        }
        initialize(options) {
            super.initialize(options);
            this.$title = this.$('.title');
            this.$content = this.$('.content');
            this.$chapters = this.$('.chapters');
            this.$commentContainer = this.$('.comments-container');
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
            // Get chapter list.
            var chapters = this.model.chapters;
            this.$chapters.children('.chapter').each((i, chapter) => {
                let $chapter = $(chapter);
                chapters.add(new GuideModel_1.Chapter({
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
            this.listenTo(this.model.chapters, 'change', this.render.bind(this));
            this.render();
            console.info('Guide: Initial data populated.');
        }
        render() {
            let guide = this.$el.data('guide');
            var chapter = this.model.activeChapter;
            this.$title.text(chapter.title);
            this.$content.html(chapter.content);
            let sep = "\x20- ";
            document.title = `${chapter.title}${sep}${guide}${sep}梦姬攻略网`;
            if (!Duoshuo.dummy) {
                let id = chapter.get('id');
                if (id != this.lastChapterId) {
                    // 加载多说评论框
                    this.lastChapterId = id;
                    console.info(`load duoshuo for chapter ${id}`);
                    if (this.$comment)
                        this.$comment.remove();
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
                        .fadeOut(100)
                        .delay(100)
                        .fadeIn(100);
                }
            }
            return this;
        }
    }
    class Guide {
        initComponent(el) {
            console.info('initComponent: Guide');
            this.view = new GuideView({
                el: el,
                model: new GuideModel_1.GuideModel()
            });
            this.view.populate();
            app.activeView = this.view;
        }
        initialise() {
            app.router.route('guide/:guide/:chapter', 'guide', this.route.bind(this));
        }
        route(guide, chapter) {
            if (this.view) {
                if (chapter != 'edit') {
                    console.info(`Chapter -> ${chapter}`);
                    this.view.model.setActiveFromUrl(chapter);
                }
            }
        }
    }
    return Guide;
});
/**
 * Created by Jixun on 18/08/2016.
 */
define("InputHelper", ["require", "exports", 'underscore', 'jquery'], function (require, exports, _, $) {
    "use strict";
    class InputHelper {
        constructor(base) {
            this.base = base;
            this.keys = [];
            // console.info(this.base.$el, base.$el);
            console.info('Bind event on: ', this.base.$el);
            this.base.$el.on('change', '.data-input', this.changed.bind(this));
        }
        bind(key, el) {
            if (_.contains(this.keys, key))
                throw new Error('Duplicate key.');
            var $el = (el instanceof jQuery) ? $(el) : this.base.$(el);
            $el.addClass('data-input').data({
                key: key,
                helperInstance: this
            });
            let value = InputHelper.getValue($el);
            if (value != this.base.model.get(key)) {
                this.base.model.set(key, value);
            }
            this.keys.push(key);
            return this;
        }
        static getValue($el) {
            if ($el.is(':checkbox'))
                return $el.prop('checked');
            return $el.val();
        }
        static setValue($el, value) {
            let key = $el.data('key');
            if ($el.is(':checkbox')) {
                $el.prop('checked', value);
            }
            else {
                $el.val(value);
            }
        }
        changed(e) {
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
    }
    exports.InputHelper = InputHelper;
});
/**
 * Created by Jixun on 21/08/2016.
 */
define("FixMarkdown", ["require", "exports", 'marked'], function (require, exports, marked) {
    "use strict";
    function fixMarkdown(markdown) {
        let result = marked(markdown);
        result = result.replace(/<table/g, '<table class="table table-hover table-striped table-inline table-bordered"');
        result = result.replace(/<a (href="(https?|\/\/))/g, '<a rel="external nofollow noreferrer" target="_blank" $1');
        return result;
    }
    return fixMarkdown;
});
/**
 * Created by Jixun on 18/08/2016.
 */
define("GuideEditorModel", ["require", "exports", 'backbone', "FixMarkdown"], function (require, exports, Backbone, marked) {
    "use strict";
    class GuideViewBase extends Backbone.View {
    }
    exports.GuideViewBase = GuideViewBase;
    class ChapterViewBase extends Backbone.View {
    }
    exports.ChapterViewBase = ChapterViewBase;
    class Chapter extends Backbone.Model {
        initialize(attributes, options) {
            super.initialize(attributes, options);
            this.on('change:content', this.updatePreview);
            this.updatePreview();
        }
        updatePreview() {
            if (!this.is_header) {
                this.preview = marked(this.content);
            }
        }
        defaults() {
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
        get chapter_id() { return this.get('chapter_id'); }
        set chapter_id(value) { this.set('chapter_id', value); }
        get guide_id() { return this.get('guide_id'); }
        set guide_id(value) { this.set('guide_id', value); }
        get url() { return this.get('url'); }
        set url(value) { this.set('url', value); }
        get name() { return this.get('name'); }
        set name(value) { this.set('name', value); }
        get content() { return this.get('content'); }
        set content(value) { this.set('content', value); }
        get order() { return this.get('order'); }
        set order(value) { this.set('order', value); }
        get view() { return this.get('view'); }
        set view(value) { this.set('view', value); }
        get preview() { return this.get('preview'); }
        set preview(value) { this.set('preview', value); }
        get remove() { return this.get('remove'); }
        set remove(value) { this.set('remove', value); }
        get is_header() { return this.get('is_header'); }
        set is_header(value) { this.set('is_header', value); }
        toJSON(options) {
            if (this.remove) {
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
    exports.Chapter = Chapter;
    class Chapters extends Backbone.Collection {
    }
    exports.Chapters = Chapters;
    class GuideModel extends Backbone.Model {
        defaults() {
            return {
                name: '',
                url: '',
                short_desc: '',
                chapters: new Chapters()
            };
        }
        get chapters() {
            return this.get('chapters');
        }
        set chapters(value) {
            this.set('chapters', value);
        }
        get name() {
            return this.get('name');
        }
        get url() {
            return this.get('url');
        }
        toJSON(options) {
            let result = super.toJSON(options);
            result.chapters = this.chapters.toJSON();
            return result;
        }
    }
    exports.GuideModel = GuideModel;
});
/**
 * Created by Jixun on 18/08/2016.
 */
define("GuideEditor", ["require", "exports", "InputHelper", "App", "GuideEditorModel", "hbars!edit-chapter"], function (require, exports, InputHelper_1, app, GuideEditorModel_1) {
    "use strict";
    var tplEditChapter = require('hbars!edit-chapter');
    class GuideEditorView extends GuideEditorModel_1.GuideViewBase {
        initialize(options) {
            super.initialize(options);
            this.inputHelper = new InputHelper_1.InputHelper(this);
            this.$chapters = this.$('.chapters');
        }
        events() {
            return {
                'click button.submit': this.submit,
                'click button.add-chapter': this.addChapterClick,
                'click button.add-header': this.addHeaderClick
            };
        }
        get maxOrder() {
            let chapters = this.model.chapters.toJSON();
            return chapters.reduce((max, chapter) => Math.max(max, chapter.order), 0);
        }
        addChapterClick(e) {
            let chapter = {
                is_header: false,
                chapter_id: 0,
                guide_id: 0,
                url: '新的章节',
                name: '新的章节',
                content: '',
                order: this.maxOrder + 1
            };
            this.addChapter(chapter);
        }
        addHeaderClick(e) {
            let chapter = {
                is_header: true,
                chapter_id: 0,
                name: '新的标题',
                order: this.maxOrder + 1
            };
            this.addChapter(chapter);
        }
        addChapter(chapter) {
            let model = new GuideEditorModel_1.Chapter(chapter);
            let el = $(tplEditChapter(chapter)).appendTo(this.$chapters);
            var view = new ChapterEditorView({
                model: model,
                el: el
            });
            view.populate();
            model.view = view;
            this.model.chapters.add(model);
        }
        submit(e) {
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
            let chapters = this.$el.data('chapters');
            this.$el.removeAttr('data-chapters');
            chapters.forEach(this.addChapter, this);
        }
    }
    exports.GuideEditorView = GuideEditorView;
    class ChapterEditorView extends GuideEditorModel_1.ChapterViewBase {
        initialize(options) {
            super.initialize(options);
            this.inputHelper = new InputHelper_1.InputHelper(this);
            this.$preview = this.$('.preview');
            this.render();
            this.model.on('change:preview', this.render, this);
        }
        render() {
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
    exports.ChapterEditorView = ChapterEditorView;
    class GuideEditor {
        initComponent(el) {
            console.info('initComponent: GuideEditor');
            this.view = new GuideEditorView({
                el: el,
                model: new GuideEditorModel_1.GuideModel()
            });
            this.view.populate();
        }
        initialise() {
            app.router.route('new/guide/:game', 'addGuide', this.route);
            // app.router.route(':game/:guide/edit', 'editGuide', this.route);
        }
        route() {
            // TODO: add route proc.
        }
    }
    exports.GuideEditor = GuideEditor;
});
/**
 * Created by Jixun on 17/08/2016.
 */
define("App", ["require", "exports", 'backbone'], function (require, exports, Backbone) {
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
/**
 * Created by Jixun on 17/08/2016.
 */
define("Loader", ["require", "exports", "App", "Router", "Guide", "GuideEditor"], function (require, exports, app, Router, Guide, GuideEditor_1) {
    "use strict";
    app.router = new Router();
    app.guide = new Guide();
    app.guideEditor = new GuideEditor_1.GuideEditor();
    app.router.render();
    app.guideEditor.initialise();
    app.guide.initialise();
    app.run();
    $(document.body).addClass('js');
    console.info('Loader: App is running.');
});
