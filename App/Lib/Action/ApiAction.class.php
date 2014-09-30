<?php

class ApiAction extends Action {

	protected $ok = 200;	// 成功
	protected $err = 500; // 未知错误
	protected $no_auth = array('code'=>404, 'msg'=>'not login');
	protected $pre_repeat = array('code'=>413, 'msg'=>'add_pre:beg repeat');
	protected $is_chating = array('code'=>414, 'msg'=>'user is chating');
	protected $pre_no = array('code'=>415, 'msg'=>'add_ing:not found');
	
	protected $work_time_out = 416;	//	不在工作时间内

	public function auth(){
		if(!cookie('userAuth')){
			echo json_encode(array('code'=>500, 'msg'=>'not login'));
			return;
		}
		$msg = array('me'=>array(), 'he'=>array());
		if($me = D('User')->where(array('auth'=>cookie('userAuth')))->find()){
			$me['uid'] = $me['_id'];
			unset($me['_id']);
			$msg['me'] = $me;
		}
		$heAuth = I('heAuth');
		if($he = D('User')->where(array('auth'=>$heAuth))->find()){
			$he['uid'] = $he['_id'];
			unset($he['_id']);
			$msg['he'] = $he;
		}

		echo json_encode(array('code'=>200, 'msg'=>$msg));
	}

	public function login(){

		$map['mobile'] = I('mobile');
		$map['password'] = I('password');
		if($user = D('User')->where($map)->find()){
			cookie('userAuth', $user['auth']);
			$user['uid'] = $user['_id'];
			unset($user['_id']);
			echo json_encode(array('code'=>200, 'msg'=>$user));
		}else{
			echo json_encode(array('code'=>500, 'msg'=>'login fail'));
		}
	}

	public function logout(){
		cookie('userAuth', null);
		echo json_encode(array('code'=>200, 'msg'=>'logout'));
	}

	public function user_chat_list(){

		$auth = cookie('userAuth');
		$user = D('User')->where(array('auth'=>$auth))->find();
		if(!$user){
			echo json_encode($this->no_auth);
			return;
		}

		$map['uid'] = array('neq', $user['_id']);
		if($users = D('Chat_ing')->where($map)->select()){
			$users = array_values($users);
			echo json_encode(array('code'=>200, 'msg'=>$users));
		}else{
			echo json_encode(array('code'=>500, 'msg'=>'user list is empty'));
		}		
	}

	//请求加入聊天列表
	//请求参数：group
	public function chat_beg(){

		$auth = cookie('userAuth');
		$user = D('User')->where(array('auth'=>$auth))->find();
		if(!$user){
			echo json_encode($this->no_auth);
			return;
		}

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

		$res = $this->add_pre($user, '542776a98072ea16c4353f8f');

		echo json_encode($res);
	}

	//用户确认
	public function chat_confirm(){

		$auth = cookie('userAuth');
		$user = D('User')->where(array('auth'=>$auth))->find();
		if(!$user){
			echo json_encode($this->no_auth);
			return;
		}

		$uid = $user['_id'];

		$res = $this->add_ing($uid);

		echo json_encode($res);
	}

	//用户退出聊天
	public function chat_quit(){

		$auth = cookie('userAuth');
		$user = D('User')->where(array('auth'=>$auth))->find();
		if(!$user){
			echo json_encode($this->no_auth);
			return;
		}

		$uid = $user['_id'];

		$res = $this->quit($uid);

		echo json_encode($res);
	}

	public function msg_c2s(){

		$auth = cookie('userAuth');
		$user = D('User')->where(array('auth'=>$auth))->find();
		if(!$user){
			echo json_encode($this->no_auth);
			return;
		}

		if(!$user['_id']){
			$res['code'] = 500;
			$res['msg'] = 'msg_c2s:参数错误';
			echo json_encode($res);
			return;
		}

		$user = getuser($user['_id']);

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