/* 
 * 功能: 加载系统相关配置,国际化,缓存等支持工具类
 * @User wangb
 * @Date 2015-06-14 18:08:00
 * @Version 1.0.0
 */ 
var log = require("../application/config/log");  //log4js日志
var init = require("../application/config/init");  //系统设置
var constant = require("../application/config/constant");
var dbConfig = require("../application/config/db");
var i18n = require("../application/i18n/i18n");  //国际化

//组件相关对象
var logger = log.logger;

//区域设置
var localeCode = init.locale || "zh-CN";
var lang = function(key, options){
	return i18n.lang(key, localeCode, options);
};

module.exports = {
    systemConfigure : {
        logger : logger,
        lang : lang,
        init : init,
        constant: constant,
        dbConfig : dbConfig
    },
    use : function(app){  /** 注: app为依赖注入的express对象  */
        log.use(app);  //由于加载顺序的原因，放在其他app.use前面
    }
};