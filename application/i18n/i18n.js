/*
 * 功能: 国际化功能工具类
 * User: wangb
 * Date: 2015-06-15 01:20:00
 * Version: 1.0.0
 */
function I18N(){
	//TODO 完成国际化文件加载,lazy-init: 第一次访问时加载
}
I18N.prototype = new Object();  //***实现原型继承***

/**
 * 通过key和localeCode(区域代码)查找国际化信息; 如果没有找到,返回null
 * @param key
 * @param localeCode
 * @return String value || null
 */
I18N.prototype.find = function(key, localeCode){
	return null;
};

/**
 * 替换模式"...{default1}...{default2}..."的数据
 * @param value 源值
 * @param data 数据数组
 * @retrun 
 */
I18N.prototype.replace = function(value, data){
	if (typeof(value) != "string") {
		return value;
	}
	var reg=new RegExp("\{(.*)\}","gmi");  //TODO 提供对'{','}'自身的支持
	var idx = 0;
	return value.replace(reg, function(str, key){
		idx ++;
		//注: str为匹配到的整个字符串, key为匹配的字符串中的组:"(.*)",如果有多个组, 则有多个key1,key2...;
		//另: 组可以用此方式访问: $1,$2...
		if (typeof(data) == "undefined" || data == null) {
			return key;
		}
		if (typeof(data) == "string" || typeof(data) == "number" || typeof(data) == "boolean") {
			return data;
		}
		if (typeof(data) == "function") {
			return data.call(this, value, str, key, idx);
		}
		if (typeof(data) == "object") {
			//数组下标越界时,返回undefined
			if (data instanceof Array && typeof(data[idx - 1]) != "undefined" && data[idx - 1] != null) {
				return data[idx - 1];
			} else {
				return typeof(data[key]) == "undefined" || data[key] == null ? key : data[key];
			}
		}
		return key;
	});
};

/**
 * 通过key和localeCode(区域代码)查找国际化信息;
 * 如果找到信息,返回对应value;
 * 如果没有找到信息,返回options.defaultValue;
 * 如果options或options.defaultValue未定义时,直接返回key;
 * @param key
 * @param localeCode
 * @param options options.defaultValue -- 默认值; options.data(数组) -- 模式"...{default1}...{default2}..."的数据
 * @return value || options.defaultValue || key
 */
I18N.prototype.lang = function(key, localeCode, options){
	options = options || {};
	var value = this.find(key, localeCode);
	if (typeof(value) == 'undefined' || value == null) {
        value = key;
        if (options.defaultValue != null) {
            value = options.defaultValue;
        }
	}
	var data = options.data;
    if (typeof(options) == 'object' && options instanceof Array) {

    }
	return this.replace(value, data);
};

var i18n = new I18N();  //初始化

module.exports = i18n;
