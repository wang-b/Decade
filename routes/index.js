/*
var express = require('express');
var router = express.Router();

// GET home page. 
router.get('/', function(req, res, next) {
	res.render('index', {
		title : 'Hello world!Nodejs!'
	});
});

module.exports = router;
*/

/*
 * 功能: 首页相关路由功能,注: app为依赖注入的express对象
 * @User wangb
 * @Date 2015-06-14 20:03:00
 * @Version 1.0.0
 */
module.exports.use = function(app, renderer){
	var router = require('express').Router();
    var baseRenderer = renderer.base;
	
	// GET home page. 
	router.get('/', function(req, res, next) {
        try {
            var bodyHtml = baseRenderer.renderViewSync('index/index', null, true);
            var data = {
                title: System.lang('首页'),
                header: baseRenderer.renderHeader(),
                footer: baseRenderer.renderFooter(),
                content: baseRenderer.renderContent({body: bodyHtml})
            };
            var html = baseRenderer.render(data);
            res.send(html);
        } catch (err) {
            next(err);
        }
	});
	
	return router;
};