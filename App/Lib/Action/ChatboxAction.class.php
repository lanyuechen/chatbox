<?php

class ChatboxAction extends Action {

	public function user_chat_list(){
		//获取聊天用户
		$group = '542776a98072ea16c4353f8f';
		if($users = D('Chat_ing')->where(array('group'=>$group))->select()){
			$users = array_values($users);
			echo json_encode(array('code'=>200, 'msg'=>$users));
		}else{
			echo json_encode(array('code'=>500, 'msg'=>'user list is empty'));
		}		
	}

	public function msg_s2c(){

		$postdata = file_get_contents("php://input");
		$req = json_decode($postdata, true);

		echo msg_push($req['uid_from'], $req['uid_to'], $req['title'], $req['desc'], $req['type']);
	}

	public function msg(){
		$uid = I('uid');

		$user = getuser($uid);
		$map['uid_to|uid_from'] = '542776a98072ea16c4353f8f';
		// $map['group'] = $user['group'];
		$msgs = D('Msg')->where($map)->select();

		$msgs = array_values($msgs);
		echo json_encode($msgs);
	}
}