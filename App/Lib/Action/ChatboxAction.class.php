<?php

class ChatboxAction extends Action {

	public function msg_s2c(){

		$postdata = file_get_contents("php://input");
		$req = json_decode($postdata, true);

		$user = getuser($req['uid_to']);

		$uid_from = $req['uid_from'];
		$uid_to = $req['uid_to'];
		$title = $req['title'];
		$desc = $req['desc'];
		$type = $req['type'];

		echo msg_push($uid_from, $uid_to, $title, $desc, $type);
	}

	public function msg(){
		$uid_to = I('uid_to');
		$uid_from = I('uid_from');
		
		$map['_or'][] = array('uid_to'=>$uid_to, 'uid_from'=>$uid_from);
		$map['_or'][] = array('uid_to'=>$uid_from, 'uid_from'=>$uid_to);

		$msgs = D('Msg')->where($map)->select();

		$msgs = array_values($msgs);
		echo json_encode($msgs);
	}

	public function msg_new(){
		$uid_to = I('uid_to');
		$uid_from = I('uid_from');

		$map['uid_from'] = $uid_to;
		$map['uid_to'] = $uid_from;
		$map['state'] = 0;
		$map['ct'] = array('lt', time());

		if($msgs = D('Msg')->where($map)->select()){
			D('Msg')->where($map)->save(array('state'=>1));
			$msgs = array_values($msgs);
			echo json_encode(array('code'=>200, 'msg'=>$msgs));
		}else{
			echo json_encode(array('code'=>500, 'msg'=>'no new msg'));
		}
	}
}