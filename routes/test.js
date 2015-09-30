/*
 * 功能: bootstrap测试相关路由功能,注: app为依赖注入的express对象
 * @User wangb
 * @Date 2015-06-14 20:03:00
 * @Version 1.0.0
 */
var mysqlHelper = require('../application/db/db.mysql.test');
var util = require('util');

module.exports.use = function(app, renderer){
	var router = require('express').Router();
    var baseRenderer = renderer.base;
	
	router.get('/', function(req, res, next){
        try {
            var bodyHtml = baseRenderer.renderViewSync('test/index', null, true);
            var data = {
                title: System.lang('Mysql连接测试'),
                header: baseRenderer.renderHeader(),
                footer: baseRenderer.renderFooter(),
                content: baseRenderer.renderContent({body: bodyHtml})
            };
            var html = baseRenderer.render(data);
            res.send(html);
        } catch(err) {
            next(err);
        }
	});

    router.get('/mysql', function(req, res, next){
        mysqlHelper.testSimpleConnection(null, function (rows, fields) {
            try {
                var msg = '';
                //msg += 'fields = ' + util.inspect(fields);
                msg += '</br>rows = ' + util.inspect(rows);

                var bodyHtml = baseRenderer.renderViewSync('test/mysql', {msg: msg}, true);
                var data = {
                    title: System.lang('Mysql连接测试'),
                    header: baseRenderer.renderHeader(),
                    footer: baseRenderer.renderFooter(),
                    content: baseRenderer.renderContent({body: bodyHtml})
                };
                var html = baseRenderer.render(data);
                res.send(html);
            } catch (ex) {
                next(ex);
            }
        }, function (err) {
            next(err);  //转发到下一个处理程序
        });
    });

    router.get('/pool', function(req, res, next){
        mysqlHelper.testSimplePool(null, function (rows, fields) {
            try {
                var msg = '';
                //msg += 'fields = ' + util.inspect(fields);
                msg += '</br>rows = ' + util.inspect(rows);

                var bodyHtml = baseRenderer.renderViewSync('test/mysql', {msg: msg}, true);
                var data = {
                    title: System.lang('Mysql连接池Test'),
                    header: baseRenderer.renderHeader(),
                    footer: baseRenderer.renderFooter(),
                    content: baseRenderer.renderContent({body: bodyHtml})
                };
                var html = baseRenderer.render(data);
                res.send(html);
            } catch (ex) {
                next(ex);
            }
        }, function (err) {
            next(err);  //转发到下一个处理程序
        });
    });

    router.get('/cluster', function(req, res, next){
        mysqlHelper.testSimpleCluster(null, function (rows, fields) {
            try {
                var msg = '';
                //msg += 'fields = ' + util.inspect(fields);
                msg += '</br>rows = ' + util.inspect(rows);

                var bodyHtml = baseRenderer.renderViewSync('test/mysql', {msg: msg}, true);
                var data = {
                    title: System.lang('Mysql连接池集群Test'),
                    header: baseRenderer.renderHeader(),
                    footer: baseRenderer.renderFooter(),
                    content: baseRenderer.renderContent({body: bodyHtml})
                };
                var html = baseRenderer.render(data);
                res.send(html);
            } catch (ex) {
                next(ex);
            }
        }, function (err) {
            next(err);  //转发到下一个处理程序
        });
    });

    router.get('/changeuser', function(req, res, next){
        mysqlHelper.testSimpleChangeUser(null, function (rows, fields) {
            try {
                var msg = '';
                //msg += 'fields = ' + util.inspect(fields);
                msg += '</br>rows = ' + util.inspect(rows);

                var bodyHtml = baseRenderer.renderViewSync('test/mysql', {msg: msg}, true);
                var data = {
                    title: System.lang('Mysql切换用户Test'),
                    header: baseRenderer.renderHeader(),
                    footer: baseRenderer.renderFooter(),
                    content: baseRenderer.renderContent({body: bodyHtml})
                };
                var html = baseRenderer.render(data);
                res.send(html);
            } catch (ex) {
                next(ex);
            }
        }, function (err) {
            next(err);  //转发到下一个处理程序
        });
    });

    router.get('/handleDisconnect', function(req, res, next){
        mysqlHelper.testSimpleHandleDisconnect(null, function (rows, fields) {
            try {
                var msg = '';
                //msg += 'fields = ' + util.inspect(fields);
                msg += '</br>rows = ' + util.inspect(rows);

                var bodyHtml = baseRenderer.renderViewSync('test/mysql', {msg: msg}, true);
                var data = {
                    title: System.lang('Mysql断线重连Test'),
                    header: baseRenderer.renderHeader(),
                    footer: baseRenderer.renderFooter(),
                    content: baseRenderer.renderContent({body: bodyHtml})
                };
                var html = baseRenderer.render(data);
                res.send(html);
            } catch (ex) {
                next(ex);
            }
        }, function (err) {
            next(err);  //转发到下一个处理程序
        });
    });

    router.get('/escape', function(req, res, next){
        mysqlHelper.testSimpleEscape(null, function (rows, fields) {
            try {
                var msg = '';
                //msg += 'fields = ' + util.inspect(fields);
                msg += '</br>rows = ' + util.inspect(rows);

                var bodyHtml = baseRenderer.renderViewSync('test/mysql', {msg: msg}, true);
                var data = {
                    title: System.lang('Mysql防止sql注入Test'),
                    header: baseRenderer.renderHeader(),
                    footer: baseRenderer.renderFooter(),
                    content: baseRenderer.renderContent({body: bodyHtml})
                };
                var html = baseRenderer.render(data);
                res.send(html);
            } catch (ex) {
                next(ex);
            }
        }, function (err) {
            next(err);  //转发到下一个处理程序
        });
    });

    router.get('/queryFormat', function(req, res, next){
        mysqlHelper.testQueryFormat(null, function (rows, fields) {
            try {
                var msg = '';
                //msg += 'fields = ' + util.inspect(fields);
                msg += '</br>rows = ' + util.inspect(rows);

                var bodyHtml = baseRenderer.renderViewSync('test/mysql', {msg: msg}, true);
                var data = {
                    title: System.lang('Mysql自定义格式化函数Test'),
                    header: baseRenderer.renderHeader(),
                    footer: baseRenderer.renderFooter(),
                    content: baseRenderer.renderContent({body: bodyHtml})
                };
                var html = baseRenderer.render(data);
                res.send(html);
            } catch (ex) {
                next(ex);
            }
        }, function (err) {
            next(err);  //转发到下一个处理程序
        });
    });

    router.get('/streamHandle', function(req, res, next){
        mysqlHelper.testStreamHandle(null, function (rows, fields) {
            try {
                var msg = '';
                msg += 'fields = ' + util.inspect(fields);
                msg += '</br></br>rows = ' + util.inspect(rows);

                var bodyHtml = baseRenderer.renderViewSync('test/mysql', {msg: msg}, true);
                var data = {
                    title: System.lang('Mysql流处理Test'),
                    header: baseRenderer.renderHeader(),
                    footer: baseRenderer.renderFooter(),
                    content: baseRenderer.renderContent({body: bodyHtml})
                };
                var html = baseRenderer.render(data);
                res.send(html);
            } catch (ex) {
                next(ex);
            }
        }, function (err) {
            next(err);  //转发到下一个处理程序
        });
    });

    router.get('/transaction', function(req, res, next){
        mysqlHelper.testSimpleTransaction(null, function (rows, fields) {
            try {
                var msg = '';
                msg += 'fields = ' + util.inspect(fields);
                msg += '</br></br>rows = ' + util.inspect(rows);

                var bodyHtml = baseRenderer.renderViewSync('test/mysql', {msg: msg}, true);
                var data = {
                    title: System.lang('Mysql事务Test'),
                    header: baseRenderer.renderHeader(),
                    footer: baseRenderer.renderFooter(),
                    content: baseRenderer.renderContent({body: bodyHtml})
                };
                var html = baseRenderer.render(data);
                res.send(html);
            } catch (ex) {
                next(ex);
            }
        }, function (err) {
            next(err);  //转发到下一个处理程序
        });
    });

    router.get('/showtables', function(req, res, next){
        mysqlHelper.testShowTables(null, function (rows, fields) {
            try {
                var msg = '';
                //msg += 'fields = ' + util.inspect(fields);
                msg += '</br></br>rows = ' + util.inspect(rows);

                var bodyHtml = baseRenderer.renderViewSync('test/mysql', {msg: msg}, true);
                var data = {
                    title: System.lang('Mysql表查询Test'),
                    header: baseRenderer.renderHeader(),
                    footer: baseRenderer.renderFooter(),
                    content: baseRenderer.renderContent({body: bodyHtml})
                };
                var html = baseRenderer.render(data);
                res.send(html);
            } catch (ex) {
                next(ex);
            }
        }, function (err) {
            next(err);  //转发到下一个处理程序
        });
    });

    router.get('/desctable', function(req, res, next){
        mysqlHelper.testDescTable(null, function (rows, fields) {
            try {
                var msg = '';
                //msg += 'fields = ' + util.inspect(fields);
                msg += '</br></br>rows = ' + util.inspect(rows);

                var bodyHtml = baseRenderer.renderViewSync('test/mysql', {msg: msg}, true);
                var data = {
                    title: System.lang('Mysql表结构查询Test'),
                    header: baseRenderer.renderHeader(),
                    footer: baseRenderer.renderFooter(),
                    content: baseRenderer.renderContent({body: bodyHtml})
                };
                var html = baseRenderer.render(data);
                res.send(html);
            } catch (ex) {
                next(ex);
            }
        }, function (err) {
            next(err);  //转发到下一个处理程序
        });
    });

    /**
     * 当前子路由下，公共的异常处理
     */
    /*
    router.use(function(err, req, res, next){
        var bodyHtml = baseRenderer.renderViewSync('../common/error', {
            status : err.status || 500,
            message : err.message,
            error : err
        });
        res.send(baseRenderer.render({
            title: System.lang('TEST'),
            header: baseRenderer.renderHeader(),
            footer: baseRenderer.renderFooter(),
            content: baseRenderer.renderContent({body: bodyHtml})
        }));
    });
    */

	return router;
};