'use strict';

var mCtrl = angular.module('mCtrl',[]);

mCtrl.controller('HomeCtrl', function ($scope, $http, $routeParams){
  console.log($scope);
  
  var appId = $routeParams.appId || '';
  $http.get('/User/homeJson?appid='+appId).success(function(data){
    // console.log(data);
    $('.subnav .app-name').html(data.app.name);
    $('.subnav .sub-app-info').unbind('click');
    $('.subnav .sub-app-info').bind('click', function(){
      modal_app_info(data.app.id,data.app.key);
    });
    $scope.app = data.app;
    $scope.data = data.data;
  });
  makecp([
    {copy:'.copy-appid',source:'.source-appid'},
    {copy:'.copy-appkey',source:'.source-appkey'}
  ]);
});

mCtrl.controller('NewmsgCtrl', function ($scope, $http, $routeParams, $filter){
  var os = $routeParams.os || '';
  $scope.os = os;
  if(os == 'i'){
    $scope.title = '创建iOS通知';
  }else{
    $scope.title = '创建Android通知';
  }
  var d = new Date();
  new Pikaday({
    field: document.getElementById('pdate')
  });

  $scope.push = {
    action: '2', 
    pending: '0', 
    range: '0', 
    valid: '0',
    prod: '0',
    kv: false,
    pdate: $filter('date')(d.getTime(), 'yyyy-MM-dd'), 
    ptime: '08:00'
  };
  $http.get('/User/newmsgJson').success(function(data){
    // console.log(data);
    $scope.madelist = data.madelist;
    $scope.app = data.app;
    $scope.push.prod = data.app.prod ? '1' : '0';
  });

  $scope.sendMsg = function(){
    var push = $scope.push;
    // console.log(push);

    var appid = $scope.app.id || '';
    var os = [$scope.os];
    var title = push.title || '';
    var content = push.content || '';
    var prod = parseInt(push.prod);
    if(os[0] == 'i'){
      title = 'msg-iOS';
      if(prod == 1 && !$scope.app.bundlep){
        toast('生产证书不存在，请先上传生产证书');
        return;
      }else if(prod == 0 && !$scope.app.bundled){
        toast('开发证书不存在，请先上传开发证书');
        return;
      }
    }
    if(title == ''){
      toast('请填写标题');
      return;
    }
    if(content == ''){
      toast('请填写内容');
      return;
    }
    
    //消息提醒方式
    var mode = 0;
    mode += push.mode0 ? 1 : 0;
    mode += push.mode1 ? 2 : 0;
    mode += push.mode2 ? 4 : 0;
    mode += push.mode3 ? 8 : 0;

    //发送时间
    var pending = '';
    if(push.pending == '1'){
      if(!push.ptime.match(/\d{2}:\d{2}/)){
        toast('发送时间格式不正确，应为 hh:mm');
        return false;
      }
      pending = push.pdate + ' ' + push.ptime;
    }

    //点击通知后的操作
    var action = 2;
    var actionVal = '';
    if(push.action == '1'){
      action = 1;
      actionVal = push.appPage;
      if(!actionVal || actionVal == ''){
        toast('请选择要打开的页面');
        return;
      }
    }else if(push.action == '3'){
      action = 3;
      actionVal = push.appUrl;
      if(!actionVal || actionVal == ''){
        toast('请填写要打开的URL');
        return;
      }else if(!actionVal.match(/^((https?|ftp|mms):\/\/)?(\w+[_\-]?\w+\.)*\w+\-?\w+\.[A-z]{2,}(\/.*)*\/?/)){
        toast('URL格式不正确');
        return;
      }
    }else{
      action = 2;
    }

    //消息保留时间
    var ttl = 0;
    if(push.valid == '1'){
      ttl = parseInt(push.ttl);
      if(ttl < 0 || ttl > 3600 * 24 * 3){
        toast('消息保留时常必须在0~72小时内，单位为秒');
      }
    }

    //用户范围
    var range = push.range;
    var made = [];
    var tag = [];
    if(range == '1'){
      var tmp = $('.tag-sys-content .tag-cmt');
      for(var i = 0; i < tmp.length; i++){
        made.push($(tmp[i]).html());
      }
      if(made.length == 0){
        toast('请选择系统Tag');
        return;
      }
    }else if(range == '2'){
      var tmp = $('.tag-usr-content .tag-cmt');
      for(var i = 0; i < tmp.length; i++){
        tag.push($(tmp[i]).html());
      }
      if(tag.length == 0){
        toast('请填写自定义Tag');
        return;
      }
    }else if(range == '3'){
      tag = ['mpush_testing'];
      range = '2';
    }

    var data = {
      appid: appid, title: title, content: content, os: os, 
      pending: pending, action: action, actionVal: actionVal, 
      mode: mode, ttl: ttl, range: range, made: made, tag: tag,
      prod: prod
    };

    if(push.kv){
      var exk = $(".key").map(function () {
          return this.value;
      }).get();
      var exv = $(".val").map(function () {
          return this.value;
      }).get();
      for (var i = 0; i < exk.length; i++) {
        if (exk[i] != '') {
          data['ex.' + exk[i]] = exv[i];
        }
      }
      for(var k in exk){
        if(exk[k].match(/<|>|!|&|'|"|\*|\?|\^|\\|\/|\|/)){
          toast('参数名包含非法字符');
          return false;
        }
      }
    }

    $http.post('/User/sendMsg2', data).success(function(r){
      console.log(r);
      if (r.success) {
        toast('消息发送成功','success');
      } else {
        if(r.msg.indexOf('repeatedly sent same') !== -1){
          toast('请不要在短时间内重复申请！');
        }else if(r.msg.indexOf('502') !== -1){
          toast('网关错误','err');
        }else{
          toast(r.msg,'err');
        }
      }
    });
  }
});

mCtrl.controller('MsgLogCtrl', function ($scope, $http, $filter){
  var d = new Date();
  $scope.date_start = $filter('date')(d.getTime() - 24 * 3600 * 1000, 'yyyy-MM-dd');
  $scope.date_end = $filter('date')(d.getTime(), 'yyyy-MM-dd');
  $scope.np = 1;
  new Pikaday({
    field: document.getElementById('date_start'),
    bound: false,
    container: document.getElementById('date_start_container'),
    showMonthAfterYear: true,
    defaultDate: new Date($scope.date_start),
    yearSuffix: '年'
  });
  new Pikaday({
    field: document.getElementById('date_end'),
    bound: false,
    container: document.getElementById('date_end_container'),
    showMonthAfterYear: true,
    yearSuffix: '年'
  });

  $scope.map = {
    os: '',
    start: $scope.date_start,
    end: $scope.date_end,
    page: 1
  };

  function parseISO8601(dateStringInRange) {  
    var isoExp = /^\s*(\d{4})-(\d\d)-(\d\d)\s*$/,  
    date = new Date(NaN), month,  
    parts = isoExp.exec(dateStringInRange);
    if(parts) {  
      month = +parts[2];  
      date.setFullYear(parts[1], month - 1, parts[3]);  
      if(month != date.getMonth() + 1) {  
        date.setTime(NaN);  
      }  
    }  
    return date;  
  }  

  $scope.msgmap = function(map){
    for(var k in map){
      $scope.map[k] = map[k];
    }
    var t = new Date(parseISO8601($scope.date_start));
    $scope.map.start = parseInt(t.getTime() / 1000);
    t = new Date(parseISO8601($scope.date_end));
    $scope.map.end = parseInt(t.getTime() / 1000 + 24 * 3600 - 1);
    if($scope.map.page == 'prev'){
      $scope.map.page = $scope.cp > 1 ? $scope.cp - 1 : 1;
    }else if($scope.map.page == 'next'){
      $scope.map.page = $scope.cp < $scope.tp ? $scope.cp + 1 : $scope.tp;
    }else if($scope.map.page == 'jump'){
      $scope.map.page = $scope.np;
    }else if($scope.map.page == 'last'){
      $scope.map.page = $scope.tp;
    }
    var param = 'os=' + $scope.map.os;
    param += '&start=' + $scope.map.start;
    param += '&end=' + $scope.map.end;
    param += '&page=' + $scope.map.page;
    $http.get('/User/msglogJson?'+param).success(function(data){
      // console.log(data);
      $scope.tp = data.tp;
      $scope.cp = data.cp;

      $scope.data = data.data;

      var ml = data.data || [];
      var cat = [];
      var total = [];
      var sent = [];
      var read = [];
      var os = [];
      for(var i = 0; i < ml.length; i++){
        cat.push(ml[i].ct.replace(/\d{4}-|:\d{2}$/g,''));
        total.push(ml[i].total - ml[i].sent);
        sent.push(ml[i].sent - ml[i].read);
        read.push(ml[i].read);
        if(ml[i].os.length == 2){
          os.push(0.00002);
        }else if(ml[i].os[0] == 'i'){
          os.push(0.00001);
        }else{
          os.push(0);
        }        
      }
      
      new Highcharts.Chart({
        chart: {
          renderTo: 'msglog',
          type: 'column'
        },
        title: {
          text: ''
        },
        credits:{ 
          enabled: false, 
        },
        xAxis: {
          categories: cat,
          labels:{
            useHTML:true,
            formatter:function(){
              // console.log(this);
              return this.value + '<br>' + '<a href="javascript:;" onclick="msg_detail(this)">　　详情</a>';
            }
          }
        },
        yAxis: {
          allowDecimals: false,
          min: 0,
          title: {
            text: ''
          },
          stackLabels: {
            enabled: false
          }
        },
        legend: {
            x: 420,
            verticalAlign: 'top',
            backgroundColor: (Highcharts.theme && Highcharts.theme.legendBackgroundColorSolid) || 'white',
            borderColor: '#CCC',
            borderWidth: 1,
            shadow: false
        },
        tooltip: {
          formatter: function() {
            if(this.series.name == 'os'){
              return false;
            }if(this.series.name == '发送量'){
              return '<b>'+ this.x +'</b><br/>'+this.series.name +': '+ this.point.stackY +'<br/>';
            }else{
              return '<b>'+ this.x +'</b><br/>'+this.series.name +': '+ this.percentage.toFixed(2) +'%<br/>';
            }
          }
        },
        plotOptions: {
          column: {
            stacking: 'normal',
            borderWidth: 0,
            shadow: false
          }
        },
        series: [{
          name: 'os',
          data: os,
          color: '#ffffff',
          showInLegend: false,
          dataLabels: {
            enabled: true,
            verticalAlign: 'bottom',
            formatter: function(){
              if(this.y > 0.000019 && this.y < 0.000021){
                return 'iOS+Android';
              }else if(this.y > 0.000009 && this.y < 0.000011){
                return 'iOS';                
              }else{
                return 'Android';
              }
            }
          }
        },{
          name: '发送量',
          data: total,
          color: '#d5d5d5',
          dataLabels: {
            enabled: false,
          }
        },{
          name: '到达量',
          data: sent,
          color: '#ffac70',
          dataLabels: {
            enabled: true,
            color: '#ffffff',
            formatter: function(){
              var perc = this.percentage.toFixed(2);
              if(perc < 0.01){
                return '';
              }else{
                return ''+this.percentage.toFixed(2)+'%';
              }
            }
          }
        }, {
          name: '点击率',
          data: read,
          color: '#f3781e',
          dataLabels: {
            enabled: true,
            color: '#ffffff',
            verticalAlign: 'bottom',
            formatter: function(){
              var perc = this.percentage.toFixed(2);
              if(perc < 0.01){
                return '';
              }else{
                return ''+this.percentage.toFixed(2)+'%';
              }
            }
          }
        }]
      });
    });
  }

  $scope.msgdetail = function(ob){
    var i = ob.$index;
    var data = $scope.data;
    var ct,total,read,read_percent,title,cmt,tags,os;

    ct = data[i].ct;
    total = data[i].total;
    read = data[i].read;
    read_percent = (read / total * 100).toFixed(2) + '%';
    title = data[i].title;
    cmt = data[i].content;
    tags = data[i].scope.tags;
    if(data[i].os[0] == 'i'){
      os = 'iOS推送';
    }else{
      os = 'Android推送';
    }

    $('#msg_detail .modal-title').html(ct);
    $('#msg_detail #detail-total').html(total);
    $('#msg_detail #detail-read').html(read);
    $('#msg_detail #detail-read-percent').html(read_percent);
    $('#msg_detail #detail-title').html(title);
    $('#msg_detail #detail-cmt').html(cmt);
    $('#msg_detail #detail-tags').html(tags);
    $('#msg_detail #detail-os').html(os);
    $('#msg_detail').modal('show');
  }

  $scope.msgmap($scope.map);
});

mCtrl.controller('StatisCtrl', function ($scope, $http, $filter){
  var d = new Date();
  $scope.date_start = $filter('date')(d.getTime() - 24 * 3600 * 1000, 'yyyy-MM-dd');
  $scope.date_end = $filter('date')(d.getTime(), 'yyyy-MM-dd');

  new Pikaday({
    field: document.getElementById('date_start'),
    bound: false,
    container: document.getElementById('date_start_container'),
    showMonthAfterYear: true,
    defaultDate: new Date($scope.date_start),
    yearSuffix: '年'
  });
  new Pikaday({
    field: document.getElementById('date_end'),
    bound: false,
    container: document.getElementById('date_end_container'),
    showMonthAfterYear: true,
    yearSuffix: '年'
  });

  $scope.map = {
    os: '',
    start: $scope.date_start,
    end: $scope.date_end,
    page: 1
  };

  function parseISO8601(dateStringInRange) {  
    var isoExp = /^\s*(\d{4})-(\d\d)-(\d\d)\s*$/,  
    date = new Date(NaN), month,  
    parts = isoExp.exec(dateStringInRange);
    if(parts) {  
      month = +parts[2];  
      date.setFullYear(parts[1], month - 1, parts[3]);  
      if(month != date.getMonth() + 1) {  
        date.setTime(NaN);  
      }  
    }  
    return date;  
  }  

  $scope.pushmap = function(map){
    for(var k in map){
      $scope.map[k] = map[k];
    }
    var t = new Date(parseISO8601($scope.date_start));
    $scope.map.start = parseInt(t.getTime() / 1000);
    t = new Date(parseISO8601($scope.date_end));
    $scope.map.end = parseInt(t.getTime() / 1000 + 24 * 3600 - 1);
    
    var param = 'os=' + $scope.map.os;
    param += '&start=' + $scope.map.start;
    param += '&end=' + $scope.map.end;
    param += '&page=' + $scope.map.page;
    $http.get('/User/pushlist?'+param).success(function(data){
      $scope.pushlist = data.pushlist;
      // console.log(data.pushlist);
      $scope.tp = data.tp;
      $scope.cp = data.cp;

      var pl = data.pushlist || [];
      var cat = [];
      var sent = [];
      for(var i = 0; i < pl.length; i++){
        cat.push($filter('date')(pl[i].ct * 1000, 'MM-dd HH:mm'));
        sent.push(pl[i].sent);
      }
      $('#pushlist').highcharts({
          chart: {
              type: 'line'
          },
          title: {
              text: ''
          },
          legend:{
            floating: true,
            align: 'right',
            verticalAlign: 'top',
            x: -20,
            y: 10
          },
          xAxis: {
              categories: cat,
              gridLineWidth: 1
          },
          yAxis: {
              title: {
                  text: ''
              },
              min:0
          },
          series: [{
              name: '发送总量',
              data: sent,
              color: '#eb6300'
          }]
      });
    });
  }

  $scope.pushmap($scope.map);
});

mCtrl.controller('PkgCtrl', function ($scope, $http){
  $scope.map = {
    page: 1
  };
  $scope.np = 1;
  $scope.pkgmap = function(map){
    for(var k in map){
      $scope.map[k] = map[k];
    }
    if($scope.map.page == 'prev'){
      $scope.map.page = $scope.cp > 1 ? $scope.cp - 1 : 1;
    }else if($scope.map.page == 'next'){
      $scope.map.page = $scope.cp < $scope.tp ? $scope.cp + 1 : $scope.tp;
    }else if($scope.map.page == 'jump'){
      $scope.map.page = $scope.np;
    }else if($scope.map.page == 'last'){
      $scope.map.page = $scope.tp;
    }
    var param = 'os=' + $scope.map.os;
    param += '&page=' + $scope.map.page;
    $http.get('/User/verlistJson?'+param).success(function(data){
      // console.log(data);
      $scope.tp = data.tp;
      $scope.cp = data.cp;
      var data = data.verlist.data || [];
      var vers=[];
      for(var i = 0; i < data.length; i++){
        data[i].op = {};
        if(data[i].status == 'pause'){
          data[i].status = '已暂停';
          data[i].status_class = 'pause';
        }else if(data[i].status == 'stop'){
          data[i].status = '已停止';
          data[i].status_class = 'stop';
        }else{
          data[i].status = '已发布';
          data[i].status_class = 'ok';
        }
        vers.push(data[i]);
      }
      if(map.os == 'i'){
        $scope.versi = vers;  
      }else{
        $scope.versa = vers;
      } 
    });
  }
  $scope.mark = function(ob,status){
    var errId = ob.v._id;
    $http.post('/User/vermark',{id:errId,status:status}).success(function(data){
      if(data == 'ok'){
        toast('状态更改成功','success','/User/pkgmanage');
      }
    });
  }

  $scope.pkgmap({os:'a'});
  $scope.pkgmap({os:'i'});
});

mCtrl.controller('ConfigCtrl', function ($scope, $http, $routeParams){
  var os = $routeParams.os || '';
  var appId = $routeParams.appId || '';

  $scope.os_class = os;

  if(os == 'a'){
    $scope.title = 'Android配置';
  }else if(os == 'i'){
    $scope.title = 'iOS配置';
  }else{
    $scope.title = '应用信息';
  }

  makecp([
    {copy:'.copy-appid',source:'.source-appid'},
    {copy:'.copy-appkey',source:'.source-appkey'}
  ]);

  $http.get('/User/configJson?appid='+appId).success(function(data){
    // console.log(data);
    if(data.app.pause){
      data.app.pause_dis = '应用已暂停';
      data.app.pause_btn = '恢复应用';
    }else{
      data.app.pause_dis = '应用正常';
      data.app.pause_btn = '暂停应用';
    }
    data.app.prod = data.app.prod ? true : false;
      
    $scope.app = data.app;
    $scope.cat = data.cat;
  });

  $scope.modAppCat = function(){
    var cat = $scope.app.category || '';
    if(cat == '' || cat == '选择一个分类'){
      return false;
    }
    $http.post('/User/modApp2', {category: cat}).success(function(data){
      if (data.success) {
        toast('应用分类修改成功','success', '#/config');
      }else {
        toast(data.msg, 'err');
      }
    });
  };

  $scope.modAppPause = function(){
    if(!confirm('您确定要更改App的状态吗？')){
      return;
    }
    var pause = $scope.app.pause ? 0 : 1;
    $http.post('/User/modApp2', {pause: pause}).success(function(data){
      if (data.success) {
        toast('应用状态修改成功','success', '#/config');
      }else {
        toast('应用状态修改失败', 'err');
      }
    });
  };

  $scope.modAppProd = function(prod){
    prod = parseInt(prod);
    $http.post('/User/modApp2', {prod: prod}).success(function(data){
      if (data.success) {
        toast('应用证书状态修改成功','success', '#/config');
      }else {
        if(data.msg.indexOf('no pem') != -1){
          toast('请上传.PEM证书');
        }else{
          toast(data.msg, 'err');
        }
      }
    });
  };
});

mCtrl.controller('ErrlogCtrl', function ($scope, $http, $filter){
  var d = new Date();
  $scope.date_start = $filter('date')(d.getTime() - 30 * 24 * 3600 * 1000, 'yyyy-MM-dd');
  $scope.date_end = $filter('date')(d.getTime(), 'yyyy-MM-dd');
  $scope.np = 1;
  new Pikaday({
    field: document.getElementById('date_start'),
    bound: false,
    container: document.getElementById('date_start_container'),
    showMonthAfterYear: true,
    defaultDate: new Date($scope.date_start),
    yearSuffix: '年'
  });
  new Pikaday({
    field: document.getElementById('date_end'),
    bound: false,
    container: document.getElementById('date_end_container'),
    showMonthAfterYear: true,
    yearSuffix: '年'
  });

  $scope.map = {
    os: '',
    ver: '',
    start: $scope.date_start,
    end: $scope.date_end,
    page: 1
  };

  var verno = function(os){
    var param = 'os=' + os;
    $http.get('/User/verno?'+param).success(function(data){
      $scope.verno = data.verno;
    });
  };

  function parseISO8601(dateStringInRange) {  
    var isoExp = /^\s*(\d{4})-(\d\d)-(\d\d)\s*$/,  
    date = new Date(NaN), month,  
    parts = isoExp.exec(dateStringInRange);
    if(parts) {  
      month = +parts[2];  
      date.setFullYear(parts[1], month - 1, parts[3]);  
      if(month != date.getMonth() + 1) {  
        date.setTime(NaN);  
      }  
    }  
    return date;  
  }  

  $scope.errmap = function(map){
    if(typeof(map['os']) != 'undefined'){
      verno(map['os']);
    }
    for(var k in map){
      $scope.map[k] = map[k];
      if(k == 'ver' && typeof($scope.map[k]) == 'object'){
        $scope.map[k] = $scope.map[k].v;
      }
    }
    var t = new Date(parseISO8601($scope.date_start));
    $scope.map.start = parseInt(t.getTime() / 1000);
    t = new Date(parseISO8601($scope.date_end));
    $scope.map.end = parseInt(t.getTime() / 1000 + 24 * 3600 - 1);
    
    var param = 'os=' + $scope.map.os;
    param += '&ver=' + $scope.map.ver;
    param += '&start=' + $scope.map.start;
    param += '&end=' + $scope.map.end;
    param += '&page=' + $scope.map.page;
    $http.get('/User/errlistJson?'+param).success(function(data){
      // console.log(data);
      $scope.errlist = data.errlist.data;
      $scope.tp = data.tp;
      $scope.cp = data.cp;
      var made = data.errsum.made || [];
      var madeArr = [];
      var sum = 0;
      for(var i = 0; i < made.length; i++){
        sum += made[i].s;
      }
      for(var i = 0; i < made.length; i++){
        var brightness = 0.2 - (i / made.length) / 5 ;
        var y = parseFloat((made[i].s * 100 / sum).toFixed(2));
        madeArr.push({
          name: made[i]._id,
          y: y,
          color: Highcharts.Color('#c76632').brighten(brightness).get()
        });
      }
      
      var osver = data.errsum.osver || [];
      var osverArr = [];
      sum = 0;
      for(var i = 0; i < osver.length; i++){
        sum += osver[i].s;
      }
      for(var i = 0; i < osver.length; i++){
        var brightness = 0.2 - (i / osver.length) / 5 ;
        var y = parseFloat((osver[i].s * 100 / sum).toFixed(2));
        osverArr.push({
          name: osver[i]._id,
          y: y,
          color: Highcharts.Color('#c76632').brighten(brightness).get()
        });
      }

      new Highcharts.Chart({
        chart: {
          renderTo: 'made'
        },
        title: {
          text: ''
        },
        tooltip: {
          formatter: function() {
            return '<b>'+ this.point.name +'</b>: '+ this.percentage.toFixed(2) +' %';
          }
        },
        plotOptions: {
          pie: {
            center:['20%', '50%'],
            borderWidth: 0,
            cursor: 'pointer',
            dataLabels: {
                enabled: false
            },
            shadow: false,
            showInLegend: true
          }
        },
        legend: {
          layout: 'vertical',
          align: 'center',
          verticalAlign: 'middle',
          itemMarginTop: 5,
          itemMarginBottom: 5,
          x: 100,
          borderColor: null,
          floating: true,
          labelFormatter:function() {
            return '　<b>'+ this.name +'</b>　　'+ this.y +' %';
          }
        },
        series: [{
          type: 'pie',
          size: '110%',
          innerSize: '80%',
          data: madeArr
        }]
      });

      new Highcharts.Chart({
        chart: {
          renderTo: 'osver'
        },
        title: {
          text: ''
        },
        tooltip: {
          formatter: function() {
            return '<b>'+ this.point.name +'</b>: '+ this.percentage.toFixed(2) +' %';
          }
        },
        plotOptions: {
          pie: {
            center:['20%', '50%'],
            borderWidth: 0,
            cursor: 'pointer',
            dataLabels: {
                enabled: false
            },
            shadow: false,
            showInLegend: true
          }
        },
        legend: {
          layout: 'vertical',
          align: 'center',
          verticalAlign: 'middle',
          itemMarginTop: 5,
          itemMarginBottom: 5,
          x: 100,
          borderColor: null,
          floating: true,
          labelFormatter:function() {
            return '　<b>'+ this.name +'</b>　　'+ this.y +' %';
          }
        },
        series: [{
          type: 'pie',
          size: '110%',
          innerSize: '80%',
          data: osverArr
        }]
      });
    });    
  }

  $scope.errmark = function(){
    var param = $('.checkbox.checked[name="errlist"]').parent().siblings('.errId').html();
    if(!param){
      toast('请先选择要标记的错误记录');
      return;
    }
    if(typeof(param) == 'string'){
      param = [param];
    }
    $http.post('/User/errmark', param).success(function(data){
      if(data['success']){
        toast('标记修复成功', 'success');
      }
    });
  }

  $scope.errmap($scope.map);
});