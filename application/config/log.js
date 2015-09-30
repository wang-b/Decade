/*
 * 功能: log4js日志相关配置
 * @User wangb
 * @Date 2015-06-14 18:06:00
 * @Version 1.0.0
 */
var log4js = require("log4js");
var path = require("path");

log4js.configure({
	appenders: [
		{
			type: "console",
			category: "console"
		}, //控制台输出
		{
			type: "file",
			filename: path.join(__dirname, "../../logs/log.log"),
			pattern: "_yyyy-MM-dd",
			alwaysIncludePattern: false,
			category: "normal"
		} //日期文件格式
	],
	replaceConsole: false, //替换console.log
	levels: {
		consoleLog: "DEBUG",
		fileLog: "DEBUG"
	}
});

var logger = log4js.getLogger("normal");

module.exports.logger = logger;
module.exports.use = function(app){
	/** 注: app为express对像,依赖外部注入 */
	//页面请求志,用auto的话,默认的级别是WARN
	//app.use(log4js.connectLogger(logger, {level: "auto", format: ":method :url"}));
	app.use(log4js.connectLogger(logger, {level: "debug", format: ":method :url"}));
	//app.use(log4js.connectLogger(logger, {level: "debug"}));
};