/*
 * 功能: 用户相关路由功能,注: app为依赖注入的express对象
 * @User wangb
 * @Date 2015-06-14 20:03:00
 * @Version 1.0.0
 */
module.exports.use = function(app, renderer){
	var router = require('express').Router();
	
	// GET users listing. 
	router.get('/', function(req, res, next) {
		res.send('respond with a resource: user list.');
	});
	
	return router;
};