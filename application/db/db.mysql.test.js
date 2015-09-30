/*
 * 功能: mysql数据库连接工具
 * @User wangb
 * @Date 2015-06-30 17:58:00
 * @Version 1.0.0
 */
var mysql = require('mysql');
var util = require('util');

var systemConfigure = require('../../system/configure').systemConfigure;

var logger = systemConfigure.logger;
var mysqlDBConfig = systemConfigure.dbConfig.mysql;

function MysqlHelper(dbConfig){
    if (!dbConfig) {
        logger.error('MysqlHelper instance error! DBConfig is null!');
        throw new Error('MysqlHelper instance error! DBConfig is null!');
    }
    this.config = dbConfig;

    this.testSimpleConnection = function(sql, onQuerySuccessful, onQueryFailed){
        sql = sql || 'SELECT * FROM user WHERE id=1';
        onQuerySuccessful = onQuerySuccessful || function(rows, fields){
            logger.debug('操作数据库结果: rows = ' + util.inspect(rows) + ', fields = ' + util.inspect(fields));
        };
        onQueryFailed = onQueryFailed || function(err){
            logger.debug('操作数据库失败: ' + util.inspect(err));
        };

        var connection = mysql.createConnection(this.config);

        //创建一个连接
        logger.info('[connection connect] start!');
        connection.connect(function(err){
            if (err) {
                logger.error('[connection connect] failed!');
                onQueryFailed(err);
                return;
            }
            logger.info('[connection connect] succeeded!');

            //执行sql语句
            /*
             * 关于sql语句执行结果说明：
             * @select (err, rows, fields) rows: 结果对象数组
             * @insert (err, result)
             * @update (err, result)
             * @delete (err, result)
             * 其中result主要参数参数有: result.affectedRows（受影响的行数） result.insertId（insert时包含，插入的主键ID）
             */
            connection.query(sql, function(err, rows, fields){
                if (err) {
                    logger.error('[connection query] error - : ' + err);
                    onQueryFailed(err);
                } else {
                    logger.info('[connection query] result : rows = ' + rows + ', fields = ' + fields);
                    onQuerySuccessful(rows, fields);
                }
            });

            //关闭连接，会等待所有连接完成
            connection.end(function(err){
                if (err) {
                    logger.error('[connection end] error - : ' + err);
                    onQueryFailed(err);
                    return;
                }
                logger.info('[connection end] succeeded!');
            });
        });
    };

    this.testSimplePool = function(sql, onQuerySuccessful, onQueryFailed){
        sql = sql || 'SELECT * FROM user WHERE id=1';
        onQuerySuccessful = onQuerySuccessful || function(rows, fields){
            logger.debug('操作数据库结果: rows = ' + util.inspect(rows) + ', fields = ' + util.inspect(fields));
        };
        onQueryFailed = onQueryFailed || function(err){
            logger.debug('操作数据库失败: ' + util.inspect(err));
        };

        var pool = mysql.createPool(this.config);

        //监听connection事件
        pool.on('connection', function(connection){
            logger.info('新的数据库连接: ' + util.inspect(connection));
        });

        //方式一: 直接使用，用法和普通连接方式一样，不推荐
        /*
        pool.query(sql, function(err, rows, fields){
            //....
        });
        */

        //方式二: 共享方式，共享池中的连接，完成操作后请释放
        pool.getConnection(function(err, connection){
            if (err) {
                onQueryFailed(err);
            } else {
                connection.query(sql, function(e, rows, fields){
                    //释放链接，连接回到池中，其他线程可使用
                    connection.release();
                    if (e) {
                        onQueryFailed(e);
                    } else {
                        onQuerySuccessful(rows, fields);
                    }

                    //关闭连接池
                    pool.end(function(ex){
                        if (ex) {
                            logger.error('Pool end error : ' + util.inspect(ex));
                        }
                        logger.info('Pool end!');
                    });
                });
            }
        });
    };

    this.testSimpleCluster = function(sql, onQuerySuccessful, onQueryFailed){
        sql = sql || 'SELECT * FROM user WHERE id=1';
        onQuerySuccessful = onQuerySuccessful || function(rows, fields){
            logger.debug('操作数据库结果: rows = ' + util.inspect(rows) + ', fields = ' + util.inspect(fields));
        };
        onQueryFailed = onQueryFailed || function(err){
            logger.debug('操作数据库失败: ' + util.inspect(err));
        };

        var clusterConfig = {
            canRetry : true, //值为true时，允许连接失败时重试(Default: true)
            removeNodeErrorCount : 5, //当连接失败时 errorCount 值会增加. 当errorCount 值大于 removeNodeErrorCount 将会从PoolCluster中删除一个节点. (Default: 5)
            defaultSelector : 'RR', //默认选择器, (Default: RR)，可选值：RR: 循环(Round-Robin)；RANDOM: 通过随机函数选择节点；ORDER: 无条件地选择第一个可用节点.
            restoreNodeTimeout : 0  //默认值0.
        };  //集群相关配置
        var poolCluster = mysql.createPoolCluster(clusterConfig);
        poolCluster.add(this.config);  //anonymous group 匿名组
        poolCluster.add('MASTER', this.config);  //master（主）组
        poolCluster.add('SLAVE1', this.config);  //slave（从）组
        poolCluster.add('SLAVE2', this.config);  //slave（从）组

        // Target Group : ALL(anonymous, MASTER, SLAVE1-2), Selector : round-robin(default)
        poolCluster.getConnection(function(err, connection){
            if (err) {
                logger.debug('从poolCluster中获取连接出错: ' + util.inspect(err));
            } else {
                logger.debug('从poolCluster中获取连接成功!');
                connection.release();
            }
        });

         // Target Group : MASTER, Selector : round-robin
        poolCluster.getConnection('MASTER', function(err, connection){
            if (err) {
                logger.debug('从poolCluster中获取MASTER连接出错: ' + util.inspect(err));
            } else {
                logger.debug('从poolCluster中获取MASTER连接成功!');
                connection.release();
            }
        });

        // If can't connect to SLAVE1, return SLAVE2. (remove SLAVE1 in the cluster)
        poolCluster.on('remove', function(nodeId){
            logger.debug('Remove node : ' + nodeId);
        });

        // Target Group : SLAVE1-2, Selector : order
        poolCluster.getConnection('SLAVE*', 'ORDER', function(err, connection){
            if (err) {
                logger.debug('从poolCluster中获取SLAVE连接出错: ' + util.inspect(err));
            } else {
                logger.debug('从poolCluster中获取SLAVE连接成功!');
                connection.release();
            }
        });

        //通过of方法返回连接，of namespace : of(pattern, selector)
        poolCluster.of('*', 'ORDER').getConnection(function(err, connection){
            if (err) {
                logger.debug('从poolCluster中获取连接出错: ' + util.inspect(err));
            } else {
                logger.debug('从poolCluster中获取连接成功!');
                connection.release();
            }
        });

        var pool = poolCluster.of('SLAVE*', 'RANDOM');
        pool.getConnection(function(err, connection){
            if (err) {
                logger.debug('从poolCluster中获取连接出错: ' + util.inspect(err));
            } else {
                logger.debug('从poolCluster中获取连接成功!');
                connection.release();
            }
        });
        pool.getConnection(function(err, connection){
            if (err) {
                logger.debug('从poolCluster中获取连接出错: ' + util.inspect(err));
            } else {
                logger.debug('从poolCluster中获取连接成功!');

                connection.query(sql, function(e, rows, fields){
                    //释放链接，连接回到池中，其他线程可使用
                    connection.release();
                    if (e) {
                        onQueryFailed(e);
                    } else {
                        onQuerySuccessful(rows, fields);
                    }

                    //关闭连接集群
                    poolCluster.end(function(ex){
                        if (ex) {
                            logger.error('PoolCluster end error : ' + util.inspect(ex));
                        }
                        logger.info('PoolCluster end!');
                    });
                });
            }
        });
    };

    this.testSimpleChangeUser = function(sql, onQuerySuccessful, onQueryFailed){
        sql = sql || 'SELECT * FROM user WHERE id=1';
        onQuerySuccessful = onQuerySuccessful || function(rows, fields){
            logger.debug('操作数据库结果: rows = ' + util.inspect(rows) + ', fields = ' + util.inspect(fields));
        };
        onQueryFailed = onQueryFailed || function(err){
            logger.debug('操作数据库失败: ' + util.inspect(err));
        };

        var pool = mysql.createPool(this.config);

        //监听connection事件
        pool.on('connection', function(connection){
            logger.info('新的数据库连接: ' + util.inspect(connection));
        });

        pool.getConnection(function(err, connection){
            //Mysql允许在不断开连接的的情况下切换用户
            /*
             参数说明：
             @user: 新的用户 (默认为早前的一个).
             @password: 新用户的新密码 (默认为早前的一个).
             @charset: 新字符集 (默认为早前的一个).
             @database: 新数据库名称 (默认为早前的一个).
             */
            connection.changeUser({user : 'root'}, function(err){
                if (err) {
                    onQueryFailed(err);
                } else {
                    connection.query(sql, function(e, rows, fields){
                        //释放链接，连接回到池中，其他线程可使用
                        connection.release();
                        if (e) {
                            onQueryFailed(e);
                        } else {
                            onQuerySuccessful(rows, fields);
                        }

                        //关闭连接池
                        pool.end(function(ex){
                            if (ex) {
                                logger.error('Pool end error : ' + util.inspect(ex));
                            }
                            logger.info('Pool end!');
                        });
                    });
                }
            });
        });
    };

    this.testSimpleHandleDisconnect = function(sql, onQuerySuccessful, onQueryFailed){
        sql = sql || 'SELECT * FROM user WHERE id=1';
        onQuerySuccessful = onQuerySuccessful || function(rows, fields){
            logger.debug('操作数据库结果: rows = ' + util.inspect(rows) + ', fields = ' + util.inspect(fields));
        };
        onQueryFailed = onQueryFailed || function(err){
            logger.debug('操作数据库失败: ' + util.inspect(err));
        };

        var connection;
        var cfg = this.config;
        function handleDisconnect(){
            connection = mysql.createConnection(cfg);

            //连接数据库
            var retryCount = 5;
            connection.connect(function(err){
                if (err) {
                    logger.error('连接数据库失败: ' + util.inspect(err));
                    retryCount --;
                    if (retryCount > 0) {
                        logger.info('进行断线重连: ' + new Date());
                        setTimeout(handleDisconnect, 5000);  //2s重连一次
                    }
                } else {
                    logger.info('连接数据库成功！');
                    //执行sql语句
                    connection.query(sql, function(err, rows, fields){
                        if (err) {
                            logger.error('[connection query] error - : ' + err);
                            onQueryFailed(err);
                        } else {
                            logger.info('[connection query] result : rows = ' + rows + ', fields = ' + fields);
                            onQuerySuccessful(rows, fields);
                        }
                    });

                    //关闭连接，会等待所有连接完成
                    connection.end(function(err){
                        if (err) {
                            logger.error('[connection end] error - : ' + err);
                            onQueryFailed(err);
                            return;
                        }
                        logger.info('[connection end] succeeded!');
                    });
                }
            });

            //监听断线事件
            connection.on('error', function(err){
                logger.error('数据库操作出错: ' + util.inspect(err));
                if(err.code === 'PROTOCOL_CONNECTION_LOST'){
                    logger.info('断线重连PROTOCOL_CONNECTION_LOST : ' + new Date());
                    handleDisconnect();  //进行断线重连
                } else {
                    throw err;
                }
            });
        }

        handleDisconnect();
    };

    this.testSimpleEscape = function(sql, onQuerySuccessful, onQueryFailed){
        sql = sql || 'SELECT * FROM user WHERE id=1';
        onQuerySuccessful = onQuerySuccessful || function(rows, fields){
            logger.debug('操作数据库结果: rows = ' + util.inspect(rows) + ', fields = ' + util.inspect(fields));
        };
        onQueryFailed = onQueryFailed || function(err){
            logger.debug('操作数据库失败: ' + util.inspect(err));
        };

        var connection = mysql.createConnection(this.config);
        //方式一,调用函数
        //mysql.escapeId(): 转换标识符
        //mysql.escape(): 转换值
        sql = 'SELECT ' + mysql.escapeId('username') + ',' + mysql.escapeId('password')
            + ' FROM ' + mysql.escapeId('user') + ' WHERE id = ' + mysql.escape(1);

        //方式二，使用占位符+直接调用方式
        //??: 用于标识符；?: 用于值
        //sql = 'SELECT ??,?? FROM ?? WHERE id = ?';
        //var values = ['username', 'password', 'user', 1];
        //sql = mysql.format(sql, values);

        //方式三，查询模式
        /*
         说明不同类型值的转换结果说明：
         @Numbers 不变
         @Booleans 转换为字符串 'true' / 'false'
         @Date 对象转换为字符串 'YYYY-mm-dd HH:ii:ss'
         @Buffers 转换为是6进制字符串
         @Strings 不变
         @Arrays => ['a', 'b'] 转换为 'a', 'b'
         @嵌套数组 [['a', 'b'], ['c', 'd']] 转换为 ('a', 'b'), ('c', 'd')
         @Objects 转换为 key = 'val' pairs. 嵌套对象转换为字符串.
         @undefined / null ===> NULL
         @NaN / Infinity 不变. MySQL 不支持这些值,  除非有工具支持，否则插入这些值会引起错误.
         */
        connection.connect(function(err){
            if (err) {
                logger.error('[connection connect] failed!');
                onQueryFailed(err);
                return;
            }
            logger.info('[connection connect] succeeded!');

            sql = 'SELECT ??,?? FROM ?? WHERE id = ?';
            var data = ['username', 'password', 'user', 1];
            //执行sql语句
            connection.query(sql, data, function(err, rows, fields){
                if (err) {
                    logger.error('[connection query] error - : ' + err);
                    onQueryFailed(err);
                } else {
                    logger.info('[connection query] result : rows = ' + rows + ', fields = ' + fields);
                    onQuerySuccessful(rows, fields);
                }
            });

            //关闭连接，会等待所有连接完成
            connection.end(function(err){
                if (err) {
                    logger.error('[connection end] error - : ' + err);
                    onQueryFailed(err);
                    return;
                }
                logger.info('[connection end] succeeded!');
            });
        });

        //方式四，自定义转换函数
        //单独函数中给出。
    };

    this.testQueryFormat = function(sql, onQuerySuccessful, onQueryFailed){
        sql = sql || 'SELECT * FROM user WHERE id=1';
        onQuerySuccessful = onQuerySuccessful || function(rows, fields){
            logger.debug('操作数据库结果: rows = ' + util.inspect(rows) + ', fields = ' + util.inspect(fields));
        };
        onQueryFailed = onQueryFailed || function(err){
            logger.debug('操作数据库失败: ' + util.inspect(err));
        };

        var connection = mysql.createConnection(this.config);

        //自定义格式化函数
        connection.config.queryFormat = function(query, values){
            if (!values) {
                return query;
            }
            var i = -1;
            return query.replace(/(:{1,2})(\w+)/g, function(txt, prefix, key){
                var isId = prefix === '::';
                i ++;
                if (typeof values == 'object') {
                    if (values instanceof Array && i < values.length) {
                        return isId ? this.escapeId(values[i]) : this.escape(values[i]);
                    } else if (values.hasOwnProperty(key)) {
                        return isId ? this.escapeId(values[key]) : this.escape(values[key]);
                    }
                }
                return isId ? this.escapeId(key) : this.escape(key);
            }.bind(this));
        };

        connection.connect(function(err){
            if (err) {
                logger.error('[connection connect] failed!');
                onQueryFailed(err);
                return;
            }
            logger.info('[connection connect] succeeded!');

            sql = 'SELECT ::username,::password FROM ::user WHERE id = :id';
            var data = {
                username : 'username',
                password : 'password',
                user : 'user',
                id : 1
            };
            //data = ['username', 'password', 'user', 1];
            //执行sql语句
            connection.query(sql, data, function(err, rows, fields){
                if (err) {
                    logger.error('[connection query] error - : ' + err);
                    onQueryFailed(err);
                } else {
                    logger.info('[connection query] result : rows = ' + rows + ', fields = ' + fields);
                    onQuerySuccessful(rows, fields);
                }
            });

            //关闭连接，会等待所有连接完成
            connection.end(function(err){
                if (err) {
                    logger.error('[connection end] error - : ' + err);
                    onQueryFailed(err);
                    return;
                }
                logger.info('[connection end] succeeded!');
            });
        });
    };

    this.testStreamHandle = function(sql, onQuerySuccessful, onQueryFailed){
        sql = sql || 'SELECT * FROM user WHERE id=1';
        onQuerySuccessful = onQuerySuccessful || function(rows, fields){
            logger.debug('操作数据库结果: rows = ' + util.inspect(rows) + ', fields = ' + util.inspect(fields));
        };
        onQueryFailed = onQueryFailed || function(err){
            logger.debug('操作数据库失败: ' + util.inspect(err));
        };

        var connection = mysql.createConnection(this.config);

        connection.connect(function(err) {
            if (err) {
                logger.error('[connection connect] failed!');
                onQueryFailed(err);
                return;
            }
            logger.info('[connection connect] succeeded!');

            var rows = [];
            var isError = false;
            var fieldss = null;
            var query = connection.query(sql);
            query.on('error', function(e){
                logger.error('流处理出错: ' + util.inspect(e));
                isError = true;
                onQueryFailed(e);
            }).on('fields', function(fields){
                logger.info('流处理fields = : ' + util.inspect(fields));
                fieldss = fields;
            }).on('result', function(row){
                logger.info('流处理row = : ' + util.inspect(row));
                connection.pause();  //暂停
                rows.push(row);
                /*
                 processRow(row, function() {
                    connection.resume();  //继续
                 });
                 */
                connection.resume();
            }).on('end', function(){
                if (!isError){
                    onQuerySuccessful(rows, fieldss);
                }

                //关闭连接，会等待所有连接完成
                connection.end(function(err){
                    if (err) {
                        logger.error('[connection end] error - : ' + err);
                        onQueryFailed(err);
                        return;
                    }
                    logger.info('[connection end] succeeded!');
                });
            });
        });
    };

    this.testSimpleTransaction = function(sql, onQuerySuccessful, onQueryFailed){
        sql = sql || 'SELECT * FROM user WHERE id=1';
        onQuerySuccessful = onQuerySuccessful || function(rows, fields){
            logger.debug('操作数据库结果: rows = ' + util.inspect(rows) + ', fields = ' + util.inspect(fields));
        };
        onQueryFailed = onQueryFailed || function(err){
            logger.debug('操作数据库失败: ' + util.inspect(err));
        };

        var connection = mysql.createConnection(this.config);

        connection.connect(function(err) {
            if (err) {
                logger.error('[connection connect] failed!');
                onQueryFailed(err);
                return;
            }
            logger.info('[connection connect] succeeded!');

            connection.beginTransaction(function(e){
                if (e) {
                    logger.error('Connection beginTransaction error: ' + util.inspect(e));
                    onQueryFailed(e);
                    return;
                }

                connection.query('update user set username=? where id = 1', 'wangb1', function(e1, result){
                    if (e1) {
                        logger.error('数据库出错: ' + util.inspect(e1));
                        connection.rollback(function(){
                            logger.info('***Rollback!!!');
                            onQueryFailed(e1);
                        });
                        return;
                    }

                    logger.info('Update user table result: ' + util.inspect(result));
                    logger.info('Update user table result.affectedRows = ' + result.affectedRows);
                    if (result.affectedRows != 1) {
                        onQueryFailed(new Error('更新数据库失败！'));
                        connection.rollback(function(){
                            logger.info('***Rollback!!!');
                            onQueryFailed(e1);
                        });
                        return;
                    }

                    //sql = 'select * from x where id = 1';
                    connection.query(sql, function(e2, rows, fields){
                        if (e2) {
                            logger.error('[connection query] error - : ' + e2);
                            connection.rollback(function(){
                                logger.info('***Rollback!!!');
                                onQueryFailed(e2);
                            });
                            return;
                        }

                        logger.info('[connection query] result : rows = ' + rows + ', fields = ' + fields);
                        connection.commit(function(){
                            logger.info('***Commit!!!');
                            onQuerySuccessful(rows, fields);
                        });
                    });

                    //关闭连接，会等待所有连接完成
                    connection.end(function(e3){
                        if (e3) {
                            logger.error('[connection end] error - : ' + e3);
                            onQueryFailed(e3);
                            return;
                        }
                        logger.info('[connection end] succeeded!');
                    });
                });
            });
        });
    };

    this.pool = null;

    this.query = function(sql, data, callback){
        if (typeof data == 'function') {
            callback = data;
            data = null;
        }
        callback = callback || function(err, result, fields){
            if (err) {
                logger.error('数据库查询失败: ' + util.inspect(err));
                return;
            }
            logger.info('数据库查询结果: ' + util.inspect(result));
        };

        if (this.pool == null) {
            this.pool = mysql.createPool(this.config);
        }

        this.pool.getConnection(function(err, connection){
            if (err) {
                callback(err, null, null);
            } else {
                connection.config.queryFormat = this.queryFormat;
                connection.query(sql, data, function(err, result, fields){
                    connection.release();
                    callback(err, result, fields);
                });
            }
        });
    };

    //自定义格式化函数
    this.queryFormat = function(query, values){
        if (!values) {
            return query;
        }
        var i = -1;
        return query.replace(/(:{1,2})(\w+)/g, function(txt, prefix, key){
            var isId = prefix === '::';
            i ++;
            if (typeof values == 'object') {
                if (values instanceof Array && i < values.length) {
                    return isId ? this.escapeId(values[i]) : this.escape(values[i]);
                } else if (values.hasOwnProperty(key)) {
                    return isId ? this.escapeId(values[key]) : this.escape(values[key]);
                }
            }
            return isId ? this.escapeId(key) : this.escape(key);
        }.bind(mysql));
    };

    this.testShowTables = function(sql, onQuerySuccessful, onQueryFailed){
        sql = sql || 'show tables';
        onQuerySuccessful = onQuerySuccessful || function(rows, fields){
            logger.debug('操作数据库结果: rows = ' + util.inspect(rows) + ', fields = ' + util.inspect(fields));
        };
        onQueryFailed = onQueryFailed || function(err){
            logger.debug('操作数据库失败: ' + util.inspect(err));
        };

        this.query(sql, function(err, result){
            if (err) {
                onQueryFailed(err);
            } else {
                onQuerySuccessful(result);
            }
        });
    };

    this.testDescTable = function(tableName, onQuerySuccessful, onQueryFailed){
        tableName = tableName || 'user';
        onQuerySuccessful = onQuerySuccessful || function(rows, fields){
            logger.debug('操作数据库结果: rows = ' + util.inspect(rows) + ', fields = ' + util.inspect(fields));
        };
        onQueryFailed = onQueryFailed || function(err){
            logger.debug('操作数据库失败: ' + util.inspect(err));
        };

        var sql = 'desc ' + tableName;

        this.query(sql, function(err, result){
            if (err) {
                onQueryFailed(err);
            } else {
                onQuerySuccessful(result);
            }
        });
    };
}

var mysqlHelper = new MysqlHelper(mysqlDBConfig);

module.exports = mysqlHelper;