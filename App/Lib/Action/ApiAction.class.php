<?php

class ApiAction extends Action {

	protected $ok = 200;	// 成功
	protected $err = 500; // 未知错误
	protected $pre_repeat = array('code'=>413, 'msg'=>'add_pre:重复申请');
	protected $is_chating = array('code'=>414, 'msg'=>'用户已在聊天列表');
	protected $pre_no = array('code'=>415, 'msg'=>'add_ing:未发现该用户');
	
	protected $work_time_out = 416;	//	不在工作时间内

	//请求加入聊天列表
	//请求参数：group
	public function chat_beg(){

		$user = D('User')->find();

		$uid = $user['_id'];

		//用户已在预备列表
		if(in_array($uid, S('pre_list'))){
			echo json_encode($this->pre_repeat);
			return;
		}
		//用户已在聊天列表
		if(in_array($uid, S('ing_list'))){
			echo json_encode($this->is_chating);
			return;
		}

		$res = $this->add_pre($user, '1');

		echo json_encode($res);
	}

	//用户确认
	public function chat_confirm(){

		$user = D('User')->find();

		$res = $this->add_ing($user['_id']);

		echo json_encode($res);
	}

	//用户退出聊天
	public function chat_quit(){

		$user = D('User')->find();

		$res = $this->quit($user['_id']);

		echo json_encode($res);
	}

	public function msg_c2s(){

		$user = D('User')->find();

		$user = D('Chat_ing')->where(array('uid'=>$user['_id']))->find();

		if(!$user['uid']){
			$res['code'] = 500;
			$res['msg'] = 'msg_c2s:参数错误';
			echo json_encode($res);
			return;
		}

		$user = getuser($user['uid']);

		$title = I('title');
		$desc = I('desc');
		$type = intval(I('type'));

		if(addmsg($user['uid'], $user['group'], $title, $desc, $type)){
			$res['code'] = 200;
			$res['msg'] = 'msg_c2s:消息发送成功';
		}else{
			$res['code'] = 500;
			$res['msg'] = 'msg_c2s:消息发送失败';
		}
		echo json_encode($res);
	}

	//将请求用户添加到预聊天列表
	private function add_pre($user, $group){

		if(!$user || !$user['_id']){
			return array('code'=>500, 'msg'=>'add_pre:参数错误');
		}

		if(D('Chat_ing')->where(array('uid'=>$user['_id']))->find()){
			return $this->is_chating;
		}

		if(D('Chat_pre')->where(array('uid'=>$user['_id']))->find()){
			return $this->pre_repeat;
		}

		$user['uid'] = $user['_id'];
		$user['state'] = 'init';
		$user['group'] = $group;
		$user['ad'] = time();
		unset($user['_id']);

		if($id = D('Chat_pre')->add($user)){
			return array('code'=>200, 'msg'=>'add_pre:申请成功，id='.$id);
		}
		
		return array('code'=>500, 'msg'=>'add_pre:添加数据库失败');
	}

	//用户确认，将预聊天列表中的该用户添加到聊天列表
	private function add_ing($uid){

		if(!$uid){
			return array('code'=>500, 'msg'=>'add_ing:参数错误');
		}
		$user = D('Chat_pre')->where(array('uid'=>$uid))->find();
		if(!$user){
			return $this->pre_no;
		}
		if(D('Chat_ing')->where(array('uid'=>$uid))->find()){
			return $this->is_chating;
		}
		$user['ad'] = time();
		unset($user['_id']);
		if(D('Chat_ing')->add($user)){
			D('Chat_pre')->where(array('uid'=>$uid))->delete();
			return array('code'=>200, 'msg'=>'add_ing:申请成功');
		}

		return array('code'=>500, 'msg'=>'add_ing:添加数据库失败');
	}

	//退出聊天，清除chat_pre,chat_ing列表中该用户
	private function quit($uid){

		if(!$uid){
			return array('code'=>500, 'msg'=>'quit:参数错误');
		}

		S('user_' . $uid, null);

		D('Chat_ing')->where(array('uid'=>$uid))->delete();
		D('Chat_pre')->where(array('uid'=>$uid))->delete();

		return array('code'=>200, 'msg'=>'quit:成功退出聊天');
	}
}