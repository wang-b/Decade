/*
 * 功能: 扩展String功能
 * @Warning 扩展对象功能存在安全隐患: 命名冲突问题,可能修改已有功能;推荐使用工具函数实现相关功能
 * @Solution 扩展对象功能,命名时需增加前缀或后缀,避免命名冲突
 * @User wangb
 * @Date 2015-06-20 16:56:00
 * @Version 1.0.0
 */ 
String.prototype.$startWith = function(str){
	if (typeof(str) == "undefined" || str == null 
			|| this.length == 0 || this.length < str.length) {
		return false;
	}
    return this.substr(0, str.length) == str;

};

String.prototype.$endWith = function(str){
	if (typeof(str) == "undefined" || str == null 
			|| this.length == 0 || this.length < str.length) {
		return false;
	}
    return this.substring(this.length - str.length) == str;

};

module.exports = String;