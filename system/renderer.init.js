/*
 * 功能: 页面渲染器初始化类, 用于初始化全局页面渲染器(多个)
 * @User wangb
 * @Date 2015-06-17 23:21:00
 * @Version 1.0.0
 */
var path = require('path');

var Renderer = require('../renderer/renderer');
var systemConfigure = require('./configure').systemConfigure;

var logger = systemConfigure.logger;

logger.info('开始--初始化基本页面渲染器...');
var baseRenderer = new Renderer();
baseRenderer.configure({
    cache : true,   //默认是否缓存视图
    engine : '.html',  //视图文件后缀
    encoding : 'utf-8',
    rootPath : path.join(__dirname, '../views'), //视图文件根路径
    templatePath : path.join(__dirname, '../views/template'),  //模板文件根路径
    viewsPath : path.join(__dirname, '../views/web'),  //视图文件默认所在根路径
    main : 'main', //注: 主体模板,必需提供
    header : 'header',
    footer : 'footer',
    content : 'content',
    template : []//其他常规模板文件名,省略后缀
});
baseRenderer.init();
logger.info('结束--初始化基本页面渲染器...');

module.exports = {
    base : baseRenderer  //基本页面渲染器
};