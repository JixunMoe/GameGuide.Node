# Another Game Guide site powered by Node.JS

Not yet complete.

## Setup
Install dependencies using `npm install`.

Import database in `miguration` (`base`, followed by updates).

Copy `db.sample.js` to `db.js` and modify its settings.

# 使用 Node.JS 建立的游戏攻略网站

试了好多个框架，结果发现还是最习惯 Express 的用法。

然后发现 phpStorm 对 Node.JS 的支持挺好的 (大概)。

然后展示信息使用 markdown，后端/前端转换为 html 展示。

要求能在没有启用 JavaScript 的情况下能正常浏览攻略。

## 安装
安装依赖：`npm install`

导入 `miguration` 目录下的文件，首先导入 `base` 然后按照日期依次导入更新。

拷贝 `db.sample.js` 到 `db.js` 并修改设定。

## 待做项目
- [x] 前台数据展示
- [ ] 用户登陆、注册、找回密码、数据展示
- [ ] 数据管理后台
- [ ] 评论系统 (可能集成多说)
- [ ] CSRF 防护
- [ ] 优化&合并前端数据资源
- [ ] 多语言前台展示 (需要吗?)
- [ ] 其他目前未想到的内容