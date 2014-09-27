<?php

include_once ('app/Lib/baidu/Channel.class.php');

function msg_push($uid_from, $uid_to, $title, $desc, $type){
	$user = getuser($uid_to);
	
	$msgId = addmsg($uid_from, $uid_to, $title, $desc, $type);

	if(strtolower($user['device']) == 'ios'){
		$desc = mb_substr($desc, 0, 30);
		$optional[Channel :: MESSAGE_TYPE] = 1;
	}
	$channel = new Channel(C('bd_api_key'), C('bd_secret_key'));
	$optional[Channel :: USER_ID] = $user['pushid'];
	$optional[Channel :: DEPLOY_STATUS] = C('bd_deploy_status');
	$message['type'] = $type;
	$message['title'] = $title;
	$message['description'] = $desc;
	$message['msgId'] = $msgId;

	$res = false;
	$res = $channel->pushMessage(1, $message, time(), $optional);
	return $res ? $res : $channel->errmsg;
}

function getuser($uid){
	if(!$user = S('user_' . $uid)){
		$user = D('Chat_ing')->where(array('uid'=>$uid))->find();
		S('user_' . $uid, $user);
	}
	return $user;
}

function addmsg($uid_from, $uid_to, $title, $desc, $type){

	$msg['uid_from'] = $uid_from;
	$msg['uid_to'] = $uid_to;
	$msg['title'] = $title;
	$msg['desc'] = $desc;
	$msg['type'] = $type;
	$msg['state'] = 0;
	$msg['ct'] = time();

	return D('Msg')->add($msg);
}