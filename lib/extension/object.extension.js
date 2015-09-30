/*
 * 功能: 扩展Object功能
 * @Warning 扩展对象功能存在安全隐患: 命名冲突问题,可能修改已有功能;
 * @User wangb
 * @Date 2015-06-20 16:56:00
 * @Version 1.0.0
 */
Object.prototype.$size = function(){
	/*
	//Mozilla Javascript引擎支持该属性: __count__, 主要浏览器Firefox
	if (Object.prototype.hasOwnProperty('__count__')) {
		return this.__count__;
	}
	*/
	var count = 0;
	for ( var key in this ) {
		if (this.hasOwnProperty(key)) {
			count ++;
		}
	}
	return count;
};

module.exports = Object;