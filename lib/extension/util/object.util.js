/*
 * 功能: Object相关工具方法
 * @User wangb
 * @Date 2015-06-21 22:34:00
 * @Version 1.0.0
 */
module.exports = {
	size : function(obj){
		if (typeof(obj) == 'undefined' || obj == null) {
			return -1;
		}
		if (typeof(obj) == 'object') {
			if (obj instanceof Array) {
				return obj.length;
			}
			/*
			//Mozilla Javascript引擎支持该属性: __count__, 主要浏览器Firefox
			if (Object.prototype.hasOwnProperty('__count__')) {
				return obj.__count__;
			}
			*/
			var count = 0;
			for ( var key in obj ) {
				if (obj.hasOwnProperty(key)) {
					count ++;
				}
			}
			return count;
		}
		return -1;
	}
};