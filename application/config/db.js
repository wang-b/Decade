/*
 * 功能: 数据库配置常量
 * @User wangb
 * @Date 2015-06-28 14:38:00
 * @Version 1.0.0
 */
module.exports = {
    //mysql相关配置
    mysql : {
        host : '127.0.0.1',  //主机名
        port : 3306,    //端口
        database : 'db_decade',  //数据库名
        user : 'root',   //用户名
        password : '!QAZ1234', //密码
        charset : 'UTF8_GENERAL_CI',//连接的字符集. (默认: 'UTF8_GENERAL_CI'.设置该值要使用大写!)
        connectTimeout : 10 * 1000, //连接超时
        timezone: 'local',  //储存本地时间的时区. (默认: 'local')
        stringifyObjects: false, //是否序列化对象. See issue #501. (默认: 'false')
        insecureAuth: false, //是否允许旧的身份验证方法连接到数据库实例. (默认: false)
        typeCast: true,  //确定是否讲column值转换为本地JavaScript类型列值. (默认: true)
        queryFormat: null, //自定义的查询语句格式化函数,用于sql语句组装
        supportBigNumbers: false,   //数据库处理大数字(长整型和含小数),时应该启用 (默认: false).
        bigNumberStrings: false,  //启用 supportBigNumbers和bigNumberStrings 并强制这些数字以字符串的方式返回(默认: false).
        dateStrings: false, //强制日期类型(TIMESTAMP, DATETIME, DATE)以字符串返回，而不是一javascript Date对象返回. (默认: false)
        debug: true, //是否开启调试. (默认: false)
        multipleStatements: false,//是否允许在一个query中传递多个查询语句. (Default: false)
        //以下为连接池相关参数
        acquireTimeout : 10 * 1000, //最大等待获取可用连接时间，默认10 * 1000
        waitForConnections : true, //当连接池没有连接或超出最大限制时，默认为true，设置为true且会把连接放入队列，而设置为false会返回error
        connectionLimit : 20, //连接数限制，默认：10
        queueLimit : 50000 //最大连接请求队列限制，设置为0表示不限制，默认：0
    },
    //mysql集群配置，含多个不同host数据库配置
    mysqlCluster : {
        config : {
            canRetry : true, //值为true时，允许连接失败时重试(Default: true)
            removeNodeErrorCount : 5, //当连接失败时 errorCount 值会增加. 当errorCount 值大于 removeNodeErrorCount 将会从PoolCluster中删除一个节点. (Default: 5)
            defaultSelector : 'RR', //默认选择器, (Default: RR)，可选值：RR: 循环(Round-Robin)；RANDOM: 通过随机函数选择节点；ORDER: 无条件地选择第一个可用节点.
            restoreNodeTimeout : 0  //默认值0.
        },
        list : []
    },
    //mongodb相关配置
    mongodb : {

    }
};