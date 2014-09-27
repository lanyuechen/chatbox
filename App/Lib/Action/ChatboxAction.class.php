<?php

class ChatboxAction extends Action {

	public function msg_user(){
		//获取聊天用户
		$group = 1;
		$users = D('Chat_ing')->where(array('group'=>$group))->select();
	}

	public function msg(){

		//获取聊天用户
		$group = 1;
		$users = D('Chat_ing')->where(array('group'=>$group))->select();


		$users = array_values($users);
		echo json_encode($users);
	}
}