/*
 * 功能: 总路由分发器相关
 * @User wangb 
 * @Date 2015-06-14 21:59:00
 * @Version 1.0.0
 */
var indexRouter = require('../routes/index');
var userRouter = require('../routes/user');
var testRouter = require('../routes/test');

var renderer = require('./renderer.init');

//注: app为依赖注入的express对象
var dispatch = function(app){
	if (typeof(app) === 'undefined' || app == null || !app) {
		throw new Error('参数错误!');
	}

    //注入app,renderer等对象,实现控制反转
	app.use('/', indexRouter.use(app, renderer));
	app.use('/user', userRouter.use(app, renderer));
	app.use('/test', testRouter.use(app, renderer));
};
module.exports.use = dispatch;   //提供别名
module.exports.dispatch = dispatch;