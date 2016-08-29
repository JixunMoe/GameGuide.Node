# Another Game Guide site powered by Node.JS

Not yet complete.

## Setup
Install dependencies using `npm install`.

Setup database in `config/config.json`.

## Build `front-end`

1. Install `typings` & `tsc` cli：`# npm install -g typings tsc`
2. Install typings using `typing install`.
3. Compile using `tsc --project front-end`.


# 使用 Node.JS 建立的游戏攻略网站

试了好多个框架，结果发现还是最习惯 Express 的用法。

然后发现 phpStorm 对 Node.JS 的支持挺好的 (大概)。

然后展示信息使用 markdown，后端/前端转换为 html 展示。

要求能在没有启用 JavaScript 的情况下能正常浏览攻略。

## 安装
安装依赖：`npm install`

配置位于 `config/config.json` 的数据库链接信息。

## 编译前端代码 `front-end`

1. 安装 `typings` & `tsc` 程序：`# npm install -g typings tsc`
2. 安装需要的类型包： `typing install`.
3. 编译： `tsc --project front-end`.


## 待做项目
- [x] 前台数据展示
- [x] 用户登陆、注册
- [x] 数据的添加/删除/编辑
- [x] 评论系统 (集成多说)
- [x] CSRF 防护
- [ ] 搜索功能
- [ ] 管理员权限可以修改/删除所有游戏数据。
- [ ] 找回密码、数据展示
- [ ] 数据管理后台
- [ ] 优化&合并前端数据资源
- [ ] 多语言前台展示 (需要吗?)
- [ ] 其他目前未想到的内容