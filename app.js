var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var morganLogger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var util = require('util');
//var partials = require('express-partials');

//加载系统相关功能
var extension = require('./lib/extension/extension');
var configure = require('./system/configure');  //全局配置,在其他express.use()之前加载
var routerDispatcher = require('./system/router');

var app = express();

/** 加载全局configure */
configure.use(app);
var systemConfigure = configure.systemConfigure;
global.SystemConfigure = systemConfigure;
global.System = systemConfigure;   //***提供别名: System***
global.logger = systemConfigure.logger;  //全局日志对象
global.lang = systemConfigure.lang;  //全局国际化工具函数

//设置系统环境变量
process.env.NODE_ENV = systemConfigure.init.env.NODE_ENV || 'development';
process.env.PORT = systemConfigure.init.env.PORT;

// view engine setup
app.set('views', path.join(__dirname, 'views'));

//app.set('view engine', 'ejs');
// wangb 修改模板后缀名:.html
var ejs = require('ejs');
app.engine('.html', ejs.__express);
app.set('view engine', 'html');
//app.use(partials());

// uncomment after placing your favicon in /public
app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(morganLogger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
	extended : false
}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

/** router分发 */
routerDispatcher.dispatch(app);

var renderer = require('./system/renderer.init');
var baseRenderer = renderer.base;

// catch 404 and forward to error handler
app.use(function(req, res, next) {
	var err = new Error('Not Found');
	err.status = 404;
	next(err);
});

// error handlers
// development error handler
// will print stacktrace
if (app.get('env') === 'development' && process.env.NODE_ENV === 'development') {
	app.use(function(err, req, res, next) {
        try {
            var bodyHtml = baseRenderer.renderViewSync('../common/error', {
                status: err.status || 500,
                message: err.message,
                error: err
            }, true);
            res.send(baseRenderer.render({
                title: System.lang('出错了'),
                header: baseRenderer.renderHeader(),
                footer: baseRenderer.renderFooter(),
                content: baseRenderer.renderContent({body: bodyHtml})
            }));
        } catch (e) {
            res.status(err.status || 500);
            res.render('common/error', {
                message: err.message,
                error: err
            });
        }
	});
}

// production error handler
// no stacktrace leaked to user
app.use(function(err, req, res, next) {
    try {
        var view = '../common/404';
        if (err.status == 500) {
            view = '../common/500';
        }
        var bodyHtml = baseRenderer.renderViewSync(view, null, true);
        res.send(baseRenderer.render({
            title: System.lang('出错了'),
            header: baseRenderer.renderHeader(),
            footer: baseRenderer.renderFooter(),
            content: baseRenderer.renderContent({body: bodyHtml})
        }));
    } catch (e) {
        if (err.status == 500) {
            res.render('common/500');
            return;
        }
        res.render('common/404');
    }
});

//***** 处理全局未被捕获的异常，可以防止程序因为未处理的异常而退出 ******
process.on('uncaughtException', function(err){
    console.error('Catch uncaughtException: ' + util.inspect(err));
    logger.error('Catch uncaughtException: ' + util.inspect(err));
});

module.exports = app;
