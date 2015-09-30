/*
 * 功能: 页面渲染器相关工具方法
 * @User wangb
 * @Date 2015-06-17 21:44:00
 * @Version 1.0.0
 */
var path = require('path');
var fs = require('fs');

require('../lib/extension/extension');

function RendererUtil(){}
RendererUtil.prototype = {};

/**
 * 修正文件路径
 * @param filePath
 * @param ext
 * @param basePath
 * @return String 修正后路径
 */
RendererUtil.prototype.reviseFilePath = function(filePath, ext, basePath){
	filePath = filePath || "";
	basePath = basePath || "";
	try {
		if (ext && !ext.$startWith(".")) {
			ext = "." + ext;
		}
		if (ext && !filePath.$endWith(ext)) {
			filePath = filePath + ext;
		}
		if (!path.isAbsolute(filePath)) {
			filePath = path.join(basePath, filePath);
		}
	} catch (e) {
		logger.error('修正文件路径出错: ' + util.inspect(e));
	}
	return filePath;
};

/**
 * 异步读取(加载)文件为字符串
 * @param filePath 文件路径
 * @param ext 后缀
 * @param basePath 根路径
 * @param encoding
 * @param callback
 */
RendererUtil.prototype.readFile = function(filePath, ext, basePath, encoding, callback){
	encoding = encoding || 'utf-8';
	callback = callback || function(err, text){};
	filePath = this.reviseFilePath(filePath, ext, basePath);
	fs.readFile(filePath, encoding, callback);
};

/**
 * 同步读取(加载)文件为字符串
 * @param filePath 文件路径
 * @param ext 后缀
 * @param basePath 根路径
 * @param encoding
 * @return String 成功加载字符串
 * @throw 加载失败,抛出异常
 */
RendererUtil.prototype.readFileSync = function(filePath, ext, basePath, encoding){
	encoding = encoding || 'utf-8';
	filePath = this.reviseFilePath(filePath, ext, basePath);
	return text = fs.readFileSync(filePath, encoding);
};

module.exports = new RendererUtil();