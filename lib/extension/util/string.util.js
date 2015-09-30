/*
 * 功能: String相关工具方法
 * @User wangb
 * @Date 2015-06-21 18:58:00
 * @Version 1.0.0
 */ 
module.exports = {
	startWith : function(s, str){
		if (typeof(str) == "undefined" || str == null || typeof(s) != "string"
				|| s.length == 0 || s.length < str.length) {
			return false;
		}
		if (s.substr(0, str.length) == str) {
			return true;
		} 
		return false;
	},
	endWith : function(s, str){
		if (typeof(str) == "undefined" || str == null || typeof(s) != "string"
				|| s.length == 0 || s.length < str.length) {
			return false;
		}
		if (s.substring(s.length - str.length) == str) {
			return true;
		} 
		return false;
	}
};