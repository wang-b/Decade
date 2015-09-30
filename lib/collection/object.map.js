/* 
 * 功能: 以Object实现的map功能
 * @User wangb
 * @Date 2015-06-22 09:15:00
 * @Version 1.0.0
 */ 
function Map(){
	this._data = {};
	
	this.size = function(){
		var data = this._data;
		if (typeof(data) == 'undefined' || data == null) {
			return 0;
		}
		var count = 0;
		for ( var key in data ) {
			if (data.hasOwnProperty(key)) {
				count ++;
			}
		}
		return count;
	};

	this.put = function(key, value){
		var data = this._data;
		data[key] = value;
	};

	this.get = function(key){
		var data = this._data;
		var value = data[key];
		if (typeof(value) == 'undefined' || value == null) {
			return null;
		}
		return value;
	};

	this.isEmpty = function(){
		return this.size() == 0;
	};

	this.remove = function(key){
		var value = this.get(key);
		if (value != null || this._data.hasOwnProperty(key)) {
			delete (this._data)[key];
		}
		return value;
	};
	
	this.containsKey = function(key){
		return this._data.hasOwnProperty(key);
	};
}

module.exports = Map;