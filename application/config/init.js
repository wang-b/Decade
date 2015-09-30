/*
 * 功能: 系统配置参数
 * @User wangb
 * @Date 2015-06-16 11:00:00
 * @Version 1.0.0
 */
module.exports = {
	// 系统相关
	system : {
		name : "Decade",
		title : "Decade",
		keywords : "Decade,decade,十年,10年,ten years,Ten years",
		description : "Decade"
	},
    //环境变量
    env : {
        NODE_ENV : 'development',   //开发: development; 生产: production
        PORT : '3000' //端口
    },
	//版本
	version : {
		name : "1.0.0",
		code : 2015061601
	},
	//区域设置
	locale : "zh-CN"
};