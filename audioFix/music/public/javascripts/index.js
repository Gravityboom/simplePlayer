function $(s){
	return document.querySelectorAll(s);
}

var lis = $("#list li");

for(let i =0;i<lis.length;i++){
	lis[i].onclick = function(){
		for(var j = 0;j<lis.length;j++){
			lis[j].className = "";
		}
		this.className = "selected";
		load("/media/"+this.title);//加载音乐
	}
}


var box = $("#container")[0];
box.style.height="100%";
box.style.width = "100%";
var height = 0;
var width = 0;
var canvas = document.createElement("canvas");
var ctx = canvas.getContext("2d");

resize();//让canvas和box一样大小;

canvas.style.backgroundColor = "#eee";

box.appendChild(canvas);

function resize(){
	height = box.clientHeight;
	width = box.clientWidth;
	canvas.height = height;
	canvas.width = width;
	
	var line = ctx.createLinearGradient(0,0,0,height);
	line.addColorStop(0,"rgb(255,0,0)");
	line.addColorStop(1,"rgb(0,0,255)");
	ctx.fillStyle = line;
}
window.onresize = resize;//改变窗口 canvas自适应大小

/**
 * 
 * @param {Object} getArr 将频域数组传给画布
 */

function draw(getArr){
	ctx.clearRect(0,0,width,height)
	var w = width / 128;//求得每个长条的宽度  256是个数
	for(var i = 6;i<262;i++){
		var h = getArr[i] / 256 * height;//音域最大值256  每个长条的高度
		ctx.fillRect(w * i+1,height - h,w*1.1,h);
	}
}



var xhr = new XMLHttpRequest();
var ac = new (window.AudioContext || window.webkitAudioContext) ();

var gainNode = ac[ac.createGain()?"createGain":"createGainNode"]();//控制音量
gainNode.connect(ac.destination);//连接到destination节点上 

var analyser = ac.createAnalyser();
analyser.fftSize = 256;//设置fft的大小  则每次打开的频域数据为512/2 = 256
analyser.connect(gainNode);

var sourceFlag = null;//控制停止音乐
var count = 0;

function load(url){
	var n = ++count;
	sourceFlag && sourceFlag[sourceFlag.stop ? "stop" : "noteOff"]();

	xhr.abort();//快速切换歌曲时，先取消之前的请求

	xhr.open("GET",url);//打开一个请求

	xhr.responseType = "arraybuffer";//服务器返回的音频数据以二进制数组返回 便于储存

	xhr.onload = function(){
		if(n != count){console.log("加载未完成"); return}
		ac.decodeAudioData(xhr.response,function(getBuffer){//解码xhr.response【arraybuffer类型】
			if(n != count){console.log(n,count,"解码未完成"); return}
			var bufferSource = ac.createBufferSource();

			bufferSource.buffer = getBuffer;

			sourceFlag = bufferSource;//判断歌曲是否在播放

			bufferSource.connect(analyser);
			//bufferSource.connect(gainNode);//连接到gainNode节点上
			//bufferSource.connect(ac.destination);
			
			bufferSource[bufferSource.start?"start":"noteOn"](0);
			visualizer();
			
		},function(err){
			console.log(err);
		});
	}
	xhr.send();
}

//改变音量大小
function changeVolume(percent){
	gainNode.gain.value = percent;
	//在ejs中创建音量控件元素
}

$("#volume")[0].onchange = function(){
	changeVolume(this.value/this.max);
}
function visualizer(){
	var arr = new Uint8Array(analyser.frequencyBinCount);//定义数组，长度为analyser.frequencyBinCount【256】
	
	requestAnimationFrame = window.requestAnimationFrame ||
							window.webkitRequestAnimationFrame||
							window.mozRequestAnimationFrame;//专门写动画的API  刷新帧数约60fps
	//requestAnimationFrame(v);//类似于setInterval的用法 
	(function v(){
		analyser.getByteFrequencyData(arr);//将分析对象的频域数据(长度256的数组)传递给arr数组,分析对象analyser实时传递音频数组的数据 (60fps)
		//console.log(arr);
		draw(arr);
		requestAnimationFrame(v);
	})();
}
