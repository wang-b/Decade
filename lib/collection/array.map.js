/* 
 * 功能: 以Array实现的map功能
 * @User wangb
 * @Date 2015-06-23 11:00:00
 * @Version 1.0.0
 */
function Map(){
	this._keys = new Array();
	this._values = new Array();
	
	this.size = function(){
		return this._keys.length;
	};
	
	this.isEmpty = function(){
		return this._keys.length == 0;
	};
	
	this.put = function(key, value){
		if (typeof(key) == 'undefined' || key == null) {
			throw new Error('参数错误');
		}
		if (typeof(value) == 'undefined') {
			value = null;
		}
		var keys = this._keys;
		var idx = -1;
		for (var i = 0; i < keys.length; i++) {
			if (key === keys[i]) {
				idx = i;
				break;
			}
		}
		if (idx == -1) {  //不存在key,插入末尾
			this._keys.push(key);
			this._values.push(value);
		} else {  //已存在key
			(this._values)[idx] = value;
		}
	};
	
	this.get = function(key){
		if (typeof(key) == 'undefined' || key == null) {
			return null;
		}
		var keys = this._keys;
		var idx = -1;
		for (var i = 0; i < keys.length; i++) {
			if (key === keys[i]) {
				idx = i;
				break;
			}
		}
		if (idx == -1) {
			return null;
		} else {
			return (this._values)[idx];
		}
	};
	
	this.remove = function(key){
		if (typeof(key) == 'undefined' || key == null) {
			return null;
		}
		var keys = this._keys;
		var idx = -1;
		for (var i = 0; i < keys.length; i++) {
			if (key === keys[i]) {
				idx = i;
				break;
			}
		}
		if (idx == -1) {
			return null;
		} else {
			this._keys.splice(idx, 1);
			this._values.splice(idx, 1);
		}
	};
	
	this.containsKey = function(key){
		if (typeof(key) == 'undefined' || key == null) {
			return false;
		}
		var keys = this._keys;
		for (var i = 0; i < keys.length; i++) {
			if (key === keys[i]) {
				return true;
			}
		}
		return false;
	};
	
	this.containsValue = function(value){
		if (typeof(value) == 'undefined' || value == null) {
			return false;
		}
		var values = this._values;
		for (var i = 0; i < values.length; i++) {
			if (value === values[i]) {
				return true;
			}
		}
		return false;
	};
	
	this.getKeys = function(){
		return this._keys;
	};
	
	this.getValues = function(){
		return this._values;
	};
}

module.exports = Map;