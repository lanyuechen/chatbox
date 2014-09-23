<?php
return array (
	//'配置项'=>'配置值'
	'DB_TYPE' => 'mongo', // 数据库类型
	'DB_HOST' => 'localhost', // 服务器地址
	'DB_NAME' => 'chatbox', // 数据库名
	'DB_USER' => '', // 用户名
	'DB_PWD' => '', // 密码
	'DB_PORT' => 27017, // 端口
	'DB_PREFIX' => '', // 数据库表前缀

	'URL_CASE_INSENSITIVE' =>true,
	'VAR_URL_PARAMS'      => '_URL_',
	'COOKIE_EXPIRE'      => 86400,
	
	'DATA_CACHE_TYPE'=>'Apc',

	'SESSION_OPTIONS' => array(
		'expire' => 86400
	),

	// baidu
	'bd_api_key' => 'nxCBGTFvfqlXP0DIxxUu4aUQ',
	'bd_secret_key' => 'uHsz1vQscFNqrYY7sM3HZ8Lj49nI4yCm',
	'bd_deploy_status' => 1,

);
?>