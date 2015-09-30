/*
 * 功能: 页面渲染器相关
 * @User wangb
 * @Date 2015-06-17 21:44:00
 * @Version 1.0.0
 */
var ejs = require('ejs');
var path = require('path');
var util = require('util');

var Map = require('../lib/collection/entry.map');
var rendererUtil = require('./renderer.util');
var systemConfigure = require('../system/configure').systemConfigure;

var logger = systemConfigure.logger;

//常量定义,视图类型
var ViewType = {
    VIEW : 0,
    TEMPLATE : 1,
    BASE_TEMPLATE : 2
};

var defaultConfiguration = {
	cache : true,   //默认是否缓存视图
	engine : '.html',  //视图文件后缀
	templateEngine : '.html', //模板文件后缀, 默认与视图文件相同
	encoding : 'utf-8',
	rootPath : path.join(__dirname, '../views'), //视图文件根路径
	templatePath : path.join(__dirname, '../views/template'),  //模板文件根路径
	viewsPath : path.join(__dirname, '../views/web'),  //视图文件默认所在根路径
	main : 'main', //注: 主体模板,必需提供
    header : 'header',
    footer : 'footer',
    content : 'content',
	template : []//其他常规模板文件名,省略后缀
};

function Renderer(){
    this._template = new Map();  //缓存模板(渲染-解析前)
    this._views = new Map();   //缓存视图(渲染-解析前)
    this._main = null;
    this._header = null;
    this._footer = null;
    this._content = null;
}
Renderer.prototype = defaultConfiguration;  //***实现原型继承***

/** 默认模板编译参数 */
Renderer.prototype._templateCompileOptions = {};
/** 默认视图编译参数 */
Renderer.prototype._viewsCompileOptions = {};

/**
 * 配置渲染器, 需在init()方法之前调用
 * @param configuration object
 * @param reset boolean 是否重置渲染器(将调用init()方法)
 */
Renderer.prototype.configure = function(configuration, reset){
    logger.info('配置渲染器初始化参数...');
	reset = reset || false;
	if (configuration && typeof(configuration) == 'object') {
        if (configuration['cache'] != null) {
            this.cache = configuration['cache'] || false;
        }
        if (configuration['engine'] != null) {
            this.engine = configuration['engine'];
        }
        if (configuration['templateEngine'] != null) {
            this.templateEngine = configuration['templateEngine'];
        }
        if (configuration['encoding'] != null) {
            this.encoding = configuration['encoding'];
        }
        if (configuration['rootPath'] != null) {
            this.rootPath = configuration['rootPath'];
        }
        if (configuration['templatePath'] != null) {
            this.templatePath = configuration['templatePath'];
        }
        if (configuration['viewsPath'] != null) {
            this.viewsPath = configuration['viewsPath'];
        }
        if (configuration['main'] != null) {
            this.main = configuration['main'];
        }
        if (configuration['header'] != null) {
            this.header = configuration['header'];
        }
        if (configuration['footer'] != null) {
            this.footer = configuration['footer'];
        }
        if (configuration['content'] != null) {
            this.content = configuration['content'];
        }
        if (configuration['template'] != null && typeof(configuration['template']) == 'object'
                && configuration['template'] instanceof Array) {
            this.template = configuration['template'];
        }
	}
	if (reset) {
		this.init();
	}
};

/**
 * 初始化视图渲染器
 */
Renderer.prototype.init = function(){
    logger.info('开始--初始化模板/视图渲染器,预编译模板...');
    this._template = new Map();
    this._views = new Map();
    this._main = null;
    this._header = null;
    this._footer = null;
    this._content = null;

    if (!this.main) {
        throw new Error('Main tempalte not found!');
    }
    try {
        //编译main主模板,如果失败, 则报错
        this.getMainFuncSync();

        //编译header, footer, content预定义模板
        if (this.header) {
            this.getHeaderFuncSync();
        }
        if (this.footer) {
            this.getFooterFuncSync();
        }
        if (this.content) {
            this.getContentFuncSync()
        }

        //编译其他模板
        if (this.template && this.template.length > 0) {
            for (var i = 0; i < this.template.length; i++) {
                var templateName = (this.template)[i];
                this.getTemplateFuncSync(templateName);
            }
        }
	} catch (e) {
		logger.error("渲染器初始化失败: " + util.inspect(e));
		throw e;
	}
    logger.info('结束--初始化模板/视图渲染器,预编译模板...');
};

/**
 * 渲染整个页面,返回html
 * @param data 页面数据参数
 * @returns String html
 */
Renderer.prototype.render = function(data){
    return (this.getMainFuncSync())(data);
};

/**
 * 渲染header模板
 * @param data
 * @returns String html
 */
Renderer.prototype.renderHeader = function(data){
    return (this.getHeaderFuncSync())(data);
};

/**
 * 渲染footer模板
 * @param data
 * @returns String html
 */
Renderer.prototype.renderFooter = function(data){
    return (this.getFooterFuncSync())(data);
};

/**
 * 渲染content模板
 * @param data
 * @returns String html
 */
Renderer.prototype.renderContent = function(data){
    return (this.getContentFuncSync())(data);
};

/**
 * 渲染模板, 返回html
 * @param template 当类型为Function时,为模板预编译函数;当类型为String时,为模板名称或路径名
 * @param data
 * @returns String html
 */
Renderer.prototype.renderTemplate = function(template, data){
    if (typeof(template) == 'function') {
        return template(data);
    } else if (typeof(template) == 'string') {
        var templateFunc = this.getTemplateFuncSync(template);
        return templateFunc(data);
    }
    return null;
};

/**
 * 渲染视图(含模板-注意路径),返回html--异步方式
 * @param view 当类型为Function时,为视图预编译函数,此时忽略options;当类型为String时,为视图名称或路径名
 * @param data 视图数据源参数
 * @param callback(err, html)
 * @param options 渲染参数
 */
Renderer.prototype.renderView = function(view, data, callback, options){
    if (typeof(view) == 'function') {
        callback(null, view(data));
        return;
    } else if (typeof(view) == 'string') {
        this.getViewFunc(view, function(err, func){
            if (err || !func) {
                callback(err || new Error('获取视图' + view + '出错！'), null);
            } else {
                callback(null, func(data));
            }
        }, options);
        return;
    }
    callback(null, null);
};

/**
 * 渲染视图(含模板-注意路径),返回html
 * @param view 当类型为Function时,为视图预编译函数,此时忽略options;当类型为String时,为视图名称或路径名
 * @param data 视图数据源参数
 * @param options 渲染参数
 * @returns String html
 */
Renderer.prototype.renderViewSync = function(view, data, options){
    if (typeof(view) == 'function') {
        return view(data);
    } else if (typeof(view) == 'string') {
        var viewFunc = this.getViewFuncSync(view, options);
        return viewFunc(data);
    }
    return null;
};

/**
 * 返回页面main主模板Function
 * @returns Function
 * @throw 编译失败,报错
 */
Renderer.prototype.getMainFuncSync = function(){
    var cacheKey = this.parseCacheKey(this.main, ViewType.BASE_TEMPLATE);
    var mainFunc = this._main || this._template.get(cacheKey);
    if (mainFunc == null) {
        if (!this.main) {
            throw new Error("Main template not found!");
        }
        logger.info('Compile main template...');
        mainFunc = this.compileTemplateSync(this.main);
        if (mainFunc == null) {
            throw new Error("Compile main template failure!");
        }
        //缓存
        this._main = mainFunc;
        this._template.put(cacheKey, mainFunc);
    } else {
        logger.debug('Get main template from cache...');
    }
    return mainFunc;
};

/**
 * 回页面header模板Function
 * @returns Function
 */
Renderer.prototype.getHeaderFuncSync = function(){
    var cacheKey = this.parseCacheKey(this.header, ViewType.BASE_TEMPLATE);
    var headerFunc = this._header || this._template.get(cacheKey);
    if (headerFunc == null && this.header) {
        logger.info('Compile header template...');
        headerFunc = this.compileTemplateSync(this.header);
        if (headerFunc != null) {
            this._header = headerFunc;
            this._template.put(cacheKey, headerFunc);
        }
    }else {
        logger.debug('Get header template from cache...');
    }
    return headerFunc;
};

/**
 * 返回页面footer模板Function
 * @returns Function
 */
Renderer.prototype.getFooterFuncSync = function(){
    var cacheKey = this.parseCacheKey(this.footer, ViewType.BASE_TEMPLATE);
    var footerFunc = this._footer || this._template.get(cacheKey);
    if (footerFunc == null && this.footer) {
        logger.info('Compile footer template...');
        footerFunc = this.compileTemplateSync(this.footer);
        if (footerFunc != null) {
            this._footer = footerFunc;
            this._template.put(cacheKey, footerFunc);
        }
    }else {
        logger.debug('Get footer template from cache...');
    }
    return footerFunc;
};

/**
 * 返回页面content模板Function
 * @returns Function
 */
Renderer.prototype.getContentFuncSync = function(){
    var cacheKey = this.parseCacheKey(this.content, ViewType.BASE_TEMPLATE);
    var contentFunc = this._content || this._template.get(cacheKey);
    if (contentFunc == null && this.content) {
        logger.info('Compile content template...');
        contentFunc = this.compileTemplateSync(this.content);
        if (contentFunc != null) {
            this._content = contentFunc;
            this._template.put(cacheKey, contentFunc);
        }
    }else {
        logger.debug('Get content template from cache...');
    }
    return contentFunc;
};

/**
 * 返回普通模板Function
 * @param templateName
 * @returns Function
 */
Renderer.prototype.getTemplateFuncSync = function(templateName){
    var cacheKey = this.parseCacheKey(templateName, ViewType.TEMPLATE);
    var templateFunc = this._template.get(cacheKey);
    if (templateFunc == null && templateName) {
        logger.info('Compile common template ' + templateName + '...');
        templateFunc = this.compileTemplateSync(templateName);
        if (templateFunc != null) {
            this._template.put(cacheKey, templateFunc);
        }
    } else {
        logger.debug('Get common template ' + templateName + ' from cache...');
    }
    return templateFunc;
};

/**
 * 返回视图Function对象--异步
 * options如果为Boolean,则表示是否缓存,默认全局this.cache值;
 * options如果为Object,则为{cache: false, reload: false},cache-是否缓存,reload: 强制重新加载文件,默认值false;
 * @param name 视图名称或路径
 * @param callback(err, viewFunc)  viewFunc为Function对象
 * @param options 参数
 */
Renderer.prototype.getViewFunc = function(name, callback, options){
    var viewFunc = null;
    var cacheKey = this.parseCacheKey(name, ViewType.VIEW);

    //解析参数
    var isCache = this.cache || false;
    var isReload = false;
    if (options) {
        if (typeof(options) == 'boolean') {
            isCache = options;
        } else if (typeof(options) == 'object') {
            isCache = options.hasOwnProperty('cache') ? options.cache : isCache;
            isReload = options.hasOwnProperty('reload') ? options.reload : isReload;
        }
    }

    if (!isReload) {   //非强制重新加载文件, 从缓存中读取
        viewFunc = this._views.get(cacheKey);
        if (viewFunc != null) {
            logger.debug('Get view ' + name + ' from cache ...');
            callback.call(this, null, viewFunc);
            return;
        } else {  //缓存中不存在
            isReload = true;
        }
    }

    if (isReload) {  //加载文件
        logger.info('Compile view ' + name + '...');
        this.compileView(name, function(err, func){
            if (err) {
                callback.call(this, err, null);
            } else {
                if (func) {
                    if (isCache) {
                        this._views.put(cacheKey, func);
                    }
                    callback.call(this, null, func);
                } else {
                    var e = new Error('编译视图' + name + '出错！');
                    callback.call(this, e, null);
                }
            }
        });
    }
};

/**
 * 返回视图Function对象--同步
 * options如果为Boolean,则表示是否缓存,默认全局this.cache值;
 * options如果为Object,则为{cache: false, reload: false},cache-是否缓存,reload: 强制重新加载文件,默认值false;
 * @param name 视图名称或路径
 * @param options 参数
 * @retruns Function
 */
Renderer.prototype.getViewFuncSync = function(name, options){
    var viewFunc = null;
    var cacheKey = this.parseCacheKey(name, ViewType.VIEW);

    //解析参数
    var isCache = this.cache || false;
    var isReload = false;
    if (options) {
        if (typeof(options) == 'boolean') {
            isCache = options;
        } else if (typeof(options) == 'object') {
            isCache = options.hasOwnProperty('cache') ? options.cache : isCache;
            isReload = options.hasOwnProperty('reload') ? options.reload : isReload;
        }
    }

    if (!isReload) {   //非强制重新加载文件, 从缓存中读取
        viewFunc = this._views.get(cacheKey);
        if (viewFunc != null) {
            logger.debug('Get view ' + name + ' from cache ...');
            return viewFunc;
        } else {  //缓存中不存在
            isReload = true;
        }
    }

    if (isReload) {  //加载文件
        logger.info('Compile view ' + name + '...');
        viewFunc = this.compileViewSync(name);
        if (viewFunc != null && isCache) {
            this._views.put(cacheKey, viewFunc);
        }
    }

    return viewFunc;
};

/**
 * 从名称和路径中解析缓存key值
 * @param name
 * @param type 类型, 默认为视图: ViewType.VIEW = 0; 模板: ViewType.TEMPLATE = 1;基础模板: ViewType.BASE_TEMPLATE = 2
 * @returns String cache-key值
 */
Renderer.prototype.parseCacheKey = function(name, type){
    type = type || ViewType.VIEW;
    if (name != null) {
        if (type == ViewType.BASE_TEMPLATE) {
            return '__' + name + '__';
        } else if (type == ViewType.TEMPLATE) {
            return 'template:' + name.replace(/\//, "_");
        } else if (type == ViewType.VIEW) {
            return 'view:' + name.replace(/\//, "_");
        }
    }
    return name;
};

/**
 * 编译模板--同步方式
 * @param name 模板名或路径
 * @returns Function 将返回内部解析好的Function函数;
 * @throw e 失败
 */
Renderer.prototype.compileTemplateSync = function(name){
	try {
		var mainTemplateText = this.readTemplateSync(name);
		if (mainTemplateText == null) {
			return null;
		}
		return ejs.compile(mainTemplateText, this._templateCompileOptions);
	} catch (e) {
		logger.error('编译模板' + name + '出错: ' + util.inspect(e));
        throw e;
	}
};

/**
 * 编译视图--异步方法
 * @param name 视图名称、路径
 * @param callback(err, viewFunc) err为异常信息，viewFunc编译后的函数
 */
Renderer.prototype.compileView = function(name, callback){
    this.readView(name, function(err, viewText){
        if (err) {
            logger.error('编译视图' + name + '出错: ' + util.inspect(err));
            callback.call(this, err, null);
        } else {
            var viewFunc = ejs.compile(viewText, this._viewsCompileOptions);
            if (viewFunc) {
                callback.call(this, null, viewFunc);
            } else {
                var e = new Error('编译视图' + name + '出错!');
                logger.error('编译视图' + name + '出错: ' + util.inspect(e));
                callback.call(this, e, null);
            }
        }
    });
};

/**
 * 编译视图--同步方式
 * @param name 视图名或路径
 * @returns Function 将返回内部解析好的Function函数
 * @throw e 失败
 */
Renderer.prototype.compileViewSync = function(name){
    try {
        var viewText = this.readViewSync(name);
        if (viewText == null) {
            return null;
        }
        return ejs.compile(viewText, this._viewsCompileOptions);
    } catch (e) {
        logger.error('编译视图' + name + '出错: ' + util.inspect(e));
        throw e;
    }
};

/**
 * 异步读取(加载)模板
 * @param filePath 默认为this.templatePath的相对路径
 * @param callback(err, text) 成功: text为字符串; 失败: text为null; err为异常
 */
Renderer.prototype.readTemplate = function(filePath, callback){
	var ext = this.templateEngine || this.engine;
	rendererUtil.readFile(filePath, ext, this.templatePath, this.encoding, function(err, text){
		if (err) {
			logger.error('加载模板文件' + filePath +'出错: ' + util.inspect(err));
			callback.call(this, err, null);
		} else {
			callback.call(this, null, text);
		}
	});
};

/**
 * 同步读取(加载)模板
 * @param filePath 默认为this.templatePath的相对路径
 * @returns String 成功: 返回字符串;
 * @throw e 失败
 */
Renderer.prototype.readTemplateSync = function(filePath){
	var ext = this.templateEngine || this.engine;
	var text = null;
	try {
		text = rendererUtil.readFileSync(filePath, ext, this.templatePath, this.encoding);
	} catch (e) {
		logger.error('加载模板文件' + filePath + '出错: ' + util.inspect(e));
        throw e;
	}
	return text;
};

/**
 * 异步读取(加载)视图
 * @param filePath 默认为this.viewsPath的相对路径
 * @param callback(err, text) 成功: text为字符串; 失败: text为null; err为异常
 */
Renderer.prototype.readView = function(filePath, callback){
	rendererUtil.readFile(filePath, this.engine, this.viewsPath, this.encoding, function(err, text){
		if (err) {
			logger.error('加载视图文件' + filePath + '出错: ' + util.inspect(err));
			callback.call(this, err, null);
		} else {
			callback.call(this, null, text);
		}
	});
};

/**
 * 同步读取(加载)视图
 * @param filePath 默认为this.viewsPath的相对路径
 * @returns String 成功: 返回字符串;
 * @throw e 失败
 */
Renderer.prototype.readViewSync = function(filePath){
	var text = null;
	try {
		text = rendererUtil.readFileSync(filePath, this.engine, this.viewsPath, this.encoding);
	} catch (e) {
		logger.error('加载视图文件' + filePath + '出错: ' + util.inspect(e));
        throw e;
	}
	return text;
};

module.exports = Renderer;
