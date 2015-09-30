/* 
 * 功能: 以Entry对象数组实现的map功能
 * @User wangb
 * @Date 2015-06-23 12:09:00
 * @Version 1.0.0
 */
function Map(){
	this._entries = new Array();
	
	this.size = function(){
		return this._entries.length;
	};
	
	this.isEmpty = function(){
		return this._entries.length == 0;
	};
	
	this.put = function(key, value){
		if (typeof(key) == 'undefined' || key == null) {
			throw new Error('参数错误');
		}
		if (typeof(value) == 'undefined') {
			value = null;
		}
		//key去重
		var idx = -1;
		for (var i = 0; i < this._entries.length; i++) {
			var entry = (this._entries)[i];
			if (entry.key === key) {
				idx = i;
				entry.value = value;
				break;
			}
		}
		if (idx == -1) {
			this._entries.push({key : key, value : value});
		} 
	};
	
	this.get = function(key){
		if (typeof(key) == 'undefined' || key == null) {
			return null;
		}
		for (var i = 0; i < this._entries.length; i++) {
			var entry = (this._entries)[i];
			if (entry.key === key) {
				return entry.value;
			}
		}
		return null;
	};
	
	this.remove = function(key){
		if (typeof(key) == 'undefined' || key == null) {
			return null;
		}
		var idx = -1;
		var value = null;
		for (var i = 0; i < this._entries.length; i++) {
			var entry = (this._entries)[i];
			if (entry.key === key) {
				idx = i;
				value = entry.value;
				break;
			}
		}
		if (idx > -1) {
			this._entries.splice(idx, 1);
		}
		return value;
	};
	
	this.containsKey = function(key){
		for (var i = 0; i < this._entries.length; i++) {
			var entry = (this._entries)[i];
			if (entry.key === key) {
				return true;
			}
		}
		return false;
	};
	
	this.containsValue = function(value){
		for (var i = 0; i < this._entries.length; i++) {
			var entry = (this._entries)[i];
			if (entry.value === value) {
				return true;
			}
		}
		return false;
	};
	
	this.getKeys = function(){
		var keys = new Array();
		for (var i = 0; i < this._entries.length; i++) {
			var entry = (this._entries)[i];
			keys.push(entry.key);
		}
		return keys;
	};
	
	this.getValues = function(){
		var values = new Array();
		for (var i = 0; i < this._entries.length; i++) {
			var entry = (this._entries)[i];
			values.push(entry.value);
		}
		return values;
	};
}

module.exports = Map;