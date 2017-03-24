// 公用函数

// ajax方法
function ajax(url, data, method, success, error) {
	var req = new XMLHttpRequest(),
		resA = '',
		data = data || {},
		method = method || 'get',
		success = success || function() {},
		error = error || function(f) { alert(url + '发生错误！') };
	//在send之前重置onreadystatechange方法,否则会出现新的同步请求会执行两次成功回调
	req.onreadystatechange = function() {
		// alert(url+"req.readyState"+req.readyState);
		if(req.readyState == 4) {
			// alert(url+"req.status"+req.status);
			if(req.status >= 200 && req.status < 300 || req.status == 304 || req.status == 0) {
				success && success(req.responseText);
			} else {
				error && error(req.status);
			}
		}
	};
	if(data) {
		var res = [];
		for(var i in data) {
			res.push(encodeURIComponent(i) + '=' + encodeURIComponent(data[i]));
		}
		resA = res.join('&');
	}
	if(method === 'get') {
		if(data) {
			url += '?' + resA;
		}
		req.open(method, url, true);
		req.send(null);
	}
	if(method === 'post') {
		req.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
		req.open(method, url, true);
		req.send(resA);
	}
}
// 给element绑定一个针对event事件的响应，响应函数为listener
function addFuc(ele, event, listener) {
	if(ele.addEventListener) {
		ele.addEventListener(event, listener, false);
	} else if(ele.attachEvent) {
		ele.attachEvent("on" + event, listener);
	} else {
		ele["on" + event] = listener;
	}
}
// 判断element是否有className
function hasClass(ele, className) {
	var list = ele.className.split(/\s+/);
	for(var i = 0; i < list.length; i++) {
		if(list[i] == className) {
			return true;
		}
	}
	return false;
}
// 为element增加一个className
function addClass(ele, className) {
	var list = ele.className.split(/\s+/);
	if(!list[0]) {
		ele.className = className;
	} else {
		ele.className += ' ' + className;
	}
};
// 移除element中的className
function removeClass(ele, className) {
	var list = ele.className.split(/\s+/);
	if(!list[0]) return;
	for(var i = 0; i < list.length; i++) {
		if(list[i] == className) {
			list.splice(i, 1);
			ele.className = list.join(' ');
		}
	}
};
// 设置cookie
function setCookie(name, value, days) {
	var cookie = encodeURIComponent(name) + '=' + encodeURIComponent(value);
	var exp = new Date();
	exp.setTime(exp.getTime() + days * 24 * 60 * 60 * 1000);
	cookie += '; expires=' + exp.toGMTString();
	document.cookie = cookie;
}
// 获取cookie值
function getCookie() {
	var cookie = {};
	var all = document.cookie;
	if(all === '') return cookie;
	var list = all.split('; ');
	for(var i = 0, len = list.length; i < len; i++) {
		var item = list[i];
		var p = item.indexOf('=');
		var name = item.substring(0, p);
		name = decodeURIComponent(name);
		var value = item.substring(p + 1);
		value = decodeURIComponent(value);
		cookie[name] = value;
	}
	return cookie;
}
//通过class获取节点
function getElementsByClassName(className) {
	var classArr = [];
	var tags = document.getElementsByTagName('*');
	for(var i = 0; i < tags.length; i++) {
		if(tags[i].nodeType == 1) {
			if(tags[i].getAttribute('class') == className) {
				classArr.push(tags[i]);
			}
		}
	}
	return classArr; //返回
}
// addLoadEvent函数
function addLoadEvent(func) {
	var oldonload = window.onload;
	if(typeof window.onload != 'function') {
		window.onload = func;
	} else {
		window.onload = function() {
			oldonload();
			func();
		}
	}
}

/*
  通知条
*/
//添加tipClose点击事件，并设置cookie
function closeTip() {
	var tipClose = document.getElementById("tipClose");
	addFuc(tipClose, "click", function() {
		hideTip();
		setCookie("tipCookie", "tipCookieValue", 30);
	});
}
addLoadEvent(closeTip);
//加载页面前检查cookie
function checkCookie() {
	//如果通知条tipCookie已设置，则不再显示通知条
	if(getCookie().tipCookie) {
		// console.log(getCookie().tipCookie);
		hideTip();
	}
	if((getCookie().loginSuc) && (getCookie().followSuc)) {
		// console.log(getCookie().loginSuc);
		// console.log(getCookie().followSuc);
		hideFollow();
		showFollowSuc();
	}
}
addFuc(window, "unbeforeunload", checkCookie());
// 隐藏通知条函数
function hideTip() {
	var tip = document.getElementById("tip");
	tip.style.display = "none";
}

/*
  头部
*/
// 关注/登陆
function logIn() {
	//为关注按钮添加点击事件
	var follow = document.getElementById("follow");
	addFuc(follow, "click", function() {
		//先判断登陆的loginCookie是否已设置
		if(!getCookie().loginSuc) {
			// 登陆cookie未设置，弹出登陆弹窗
			showLoginPop();
			// 为登陆弹窗的关闭按钮添加点击事件，点击后关闭登陆弹窗
			var loginClose = document.getElementById("loginClose");
			addFuc(loginClose, "click", function() {
				closeLoginPop();
			});
			// 为登陆弹窗里的登陆按钮添加点击事件，并做表单验证,验证成功后ajax提交表单，失败后提示请正确输入
			var loginButton = document.getElementById("loginButton");
			//点击事件
			addFuc(loginButton, "click", function() {
				// ajax请求登陆
				if(validate()) {
					//ajax登陆
					ajax(
						url = 'http://study.163.com/webDev/login.htm',
						data = {
							userName: md5("studyOnline"),
							password: md5("study.163.com")
						},
						method = 'get',
						success = function(res) {
							// alert("登陆API的返回：" + res);
							// ajax请求得到的status为0，网上搜索有的说是跨域问题，搞了好久还是没搞懂，唉
							if(res == 1) {
								//登陆成功，则设置loginSuc cookie
								closeLoginPop();
								setCookie("loginSuc", "loginSucValue", 30);
								// console.log(getCookie().loginSuc);
								ajax(
									url = 'http://study.163.com/webDev/attention.htm',
									data = {},
									method = 'get',
									success = function(res) {
										alert("关注API的返回：" + res);
										if(res == 1) {
											//隐藏关注按钮，显示已关注按钮，并设置followSuc cookie
											hideFollow();
											showFollowSuc();
											setCookie("followSuc", "followSucValue", 30);
											// console.log(getCookie().followSuc);
										}
									}
								)
							}
						},
						error = function() { alert("登陆错误，请重新登陆") }
					)
				}
			});
		} else {
			// 若已设置loginSuc cookie，调用关注API，并设置followSuc cookie
			ajax(
				url = 'http://study.163.com/webDev/attention.htm',
				data = {},
				method = 'get',
				success = function() {
					hideFollow();
					showFollowSuc();
					setCookie("followSuc", "followSucValue", 30);
				}
			)
		}
	});
	// js表单验证是否输入用户名和密码必填项
	function validate() {
		//获取用户输入的用户名和密码
		var userName = document.getElementById("userName").value,
			password = document.getElementById("password").value;
		//验证用户名和密码是否为空，不为空则      
		if(userName == null || userName == "") {
			alert("请输入用户名")
		}
		if(password == null || password == "") {
			alert("请输入密码")
		}
		if((userName == "studyOnline") && (password == "study.163.com")) {
			return true;
		} else {
			alert("请正确输入用户名和密码")
		}
	}
	//显示登陆弹窗
	function showLoginPop() {
		// 弹出登陆界面，并遮罩
		document.getElementById("mask").style.display = "block";
		document.getElementById("login").style.display = "block";
	}
	// 关闭登陆弹窗
	function closeLoginPop() {
		document.getElementById("mask").style.display = "none";
		document.getElementById("login").style.display = "none";
	}
	//隐藏关注按钮
	function hideFollow() {
		var follow = document.getElementById("follow");
		follow.style.display = "none";
	}
	//显示已关注按钮
	function showFollowSuc() {
		var followSuc = document.getElementById("followSuc");
		followSuc.style.display = "block";
	}
}
addLoadEvent(logIn);

/*
  轮播
*/
function circleImg() {
	var curControl = 0, //当前控制按钮
		bannerArr = getElementsByClassName("bannerList")[0].getElementsByTagName("li"), //图片组
		bannerLen = bannerArr.length,
		controlArr = getElementsByClassName("controlList")[0].getElementsByTagName("li"); //控制组
	// 定时器每5秒自动变换一次banner
	var autoChange = setInterval(function() {
		if(curControl < bannerLen - 1) {
			curControl++;
		} else {
			curControl = 0;
		}
		//调用变换处理函数
		changeTo(curControl);
	}, 5000);
	//调用控制按钮点击和鼠标悬浮事件处理函数
	addEvent();

	function addEvent() {
		for(var i = 0; i < bannerLen; i++) {
			//闭包防止作用域内活动对象的影响
			(function(j) {
				//鼠标点击控制按钮作变换处理
				addFuc(controlArr[j], "click", function() {
					changeTo(j);
					curControl = j;
				});
			})(i);
			(function(j) {
				//鼠标悬浮图片上方则清除定时器
				addFuc(bannerArr[j], "mouseover", function() {
					clearTimeout(autoChange);
					curControl = j;
				});
				//鼠标滑出图片则重置定时器
				addFuc(bannerArr[j], "mouseout", function() {
					autoChange = setInterval(function() {
						if(curControl < bannerLen - 1) {
							curControl++;
						} else {
							curControl = 0;
						}
						//调用变换处理函数
						changeTo(curControl);
					}, 5000);
				});
			})(i);
		}
	}
	//变换处理函数
	function changeTo(num) {
		var curBanner = getElementsByClassName("bannerOn")[0];
		fadeOut(curBanner); //淡出当前banner
		removeClass(curBanner, "bannerOn");
		addClass(bannerArr[num], "bannerOn");
		fadeIn(bannerArr[num]); //淡入目标banner
		//设置banner的控制按钮
		var curControlOn = getElementsByClassName("controlOn")[0];
		removeClass(curControlOn, "controlOn");
		addClass(controlArr[num], "controlOn");
	}
	//淡入处理函数
	function fadeIn(elem) {
		setOpacity(elem, 0); //初始全透明
		for(var i = 0; i <= 20; i++) { //透明度改变 20 * 5 = 100
			(function() {
				var level = i * 5; //透明度每次变化值
				setTimeout(function() {
					setOpacity(elem, level)
				}, i * 25); //i * 25 即为每次改变透明度的时间间隔
			})(i);
		}
	}
	//淡出处理函数
	function fadeOut(elem) {
		for(var i = 0; i <= 20; i++) { //透明度改变 20 * 5 = 100
			(function() {
				var level = 100 - i * 5; //透明度每次变化值
				setTimeout(function() {
					setOpacity(elem, level)
				}, i * 25); //i * 25 即为每次改变透明度的时间间隔
			})(i);
		}
	}
	//设置透明度
	function setOpacity(elem, level) {
		if(elem.filters) {
			elem.style.filter = "alpha(opacity=" + level + ")";
		} else {
			elem.style.opacity = level / 100;
		}
	}
}
addLoadEvent(circleImg);

/*
 *内容区
 */
// 右侧内容区
// 机构介绍，点击图片弹出视频弹窗
function videoPlay() {
	var videoImg = document.getElementById("videoImg"),
		videoClose = document.getElementById("videoClose");
	addFuc(videoImg, "click", function() {
		showVideoPop();
	});
	addFuc(videoClose, "click", function() {
		hideVideoPop();
	});
	// 弹出视频弹窗函数
	function showVideoPop() {
		document.getElementById("mask").style.display = "block";
		document.getElementById("videoPop").style.display = "block";
	}
	// 点击关闭视频弹窗
	function hideVideoPop() {
		document.getElementById("mask").style.display = "none";
		var videoPop = document.getElementById("videoPop"),
			video = document.getElementById("video");
		videoPop.style.display = "none";
		video.pause(); //停止视频播放
	}
}
addLoadEvent(videoPlay);

// 热门推荐，从服务器请求数据，默认展示前 10 门课程，隔 5 秒更新一门课程， 实现滚动更新热门课程的效果
function showHotList() {
	var returnData = null,
		elementLi = '',
		num = 0,
		elementUl = document.getElementById("hotList");
	// 构造单个热门课程项
	function createNode(opt) {
		return '<img src="' + opt.smallPhotoUrl + '" alt="' + opt.name + '" class="hotListPic"><div><p class="hotListTitle">' + opt.name + '</p><span class="hotListUserCount">' + opt.learnerCount + '</span></div>';
	}
	//ajax请求数据
	ajax(
		url = 'http://study.163.com/webDev/hotcouresByCategory.htm',
		data = {},
		method = 'get',
		success = function(res) {
			returnData = JSON.parse(res);
			for(var i = 0; i < 10; i++) {
				elementLi += '<li class="hotListLi">' + createNode(returnData[i]) + '</li>';
			}
			elementUl.innerHTML = elementLi;
		}
	)
	// 每5秒更新一门课
	var updateCourse = setInterval(function func() {
		elementUl.removeChild(elementUl.childNodes[0]);
		var liNode = document.createElement('li');
		liNode.setAttribute('class', 'hotListLi');
		liNode.innerHTML = createNode(returnData[num]);
		elementUl.appendChild(liNode);
		num == 19 ? num = 0 : num++;
	}, 5000);
}
addLoadEvent(showHotList);

// 左侧内容区
function initCourse(pageNo, psize, ptype) {
	var rootDom = document.getElementsByClassName("course");
	// 单个课程和课程详细的浮层一起构造
	function segment(opt) {
		return '<li class="courseLi"><div class="img"><img src="' + opt.middlePhotoUrl + '"></div><div class="title">' +
			opt.name + '</div><div class="orgName">' + opt.provider + '</div><span class="hot">' +
			opt.learnerCount + '</span><div class="discount">¥ <span>' + opt.price + '</span></div>' +
			'<div class="mDialog"><div class="uHead"><img src="' +
			opt.middlePhotoUrl + '" class="pic"><div class="uInfo"><h3 class="uTit">' +
			opt.name + '</h3><div class="uHot"><span class="uNum">' +
			opt.learnerCount + '</span>人在学</div><div class="uPub">发布者：<span class="uOri">' +
			opt.provider + '</span></div><div class="uCategory">分类：<span class="uTag">' +
			opt.categoryName + '</span></div></div></div><div class="uIntro">' +
			opt.description + '</div></div></li>';
	}
	//将每页课程写入html
	function courseRender(arr, num) {
		var courseTemplate = '';
		for(var i = 0; i < num; i++) {
			courseTemplate += segment(arr[i]);
		}
		rootDom[0].innerHTML = courseTemplate;
	}
	// ajax请求数据
	ajax(
		url = 'http://study.163.com/webDev/couresByCategory.htm',
		data = {
			pageNo: pageNo,
			psize: psize,
			type: ptype
		},
		method = 'get',
		success = function(res) {
			var result = JSON.parse(res);
			courseRender(result.list, result.pagination.pageSize);
			//页码导航功能
			pagination(result, courseRender, ptype, psize);
			// 显示课程详情
			showCourse();
		}
	)
}
//页码导航功能函数
function pagination(data, render, courseType, size) {
	var paginationDom = document.getElementsByClassName('pagination'),
		paginationList = null,
		prevBtn = null,
		nextBtn = null,
		index = 1; // 当前页码
	// 页码切换
	function reCourse(n) {
		ajax(
			url = 'http://study.163.com/webDev/couresByCategory.htm',
			data = {
				pageNo: n,
				psize: size,
				type: courseType
			},
			method = 'get',
			success = function(res) {
				var result = JSON.parse(res);
				render(result.list, result.pagination.pageSize);
				// 显示课程详情
				showCourse();
			}
		)
		// 页码样式变换
		for(var i = 1; i < paginationList.length - 1; i++) {
			removeClass(paginationList[i], 'on');
		}
		addClass(paginationList[n], 'on');
	}
	// 初始化相关dom
	paginationList = document.getElementsByClassName('ele');
	prevBtn = paginationList[0];
	nextBtn = paginationList[paginationList.length - 1];
	// 初始化页码1的样式
	addClass(paginationList[1], 'on');
	//上一页、下一页点击事件
	addFuc(prevBtn, "click", function() {
		if(index > 1) {
			reCourse(--index);
		}
	});
	addFuc(nextBtn, "click", function() {
		if(index < 8) {
			reCourse(++index);
		}
	});
	// 页码数字点击事件
	for(var i = 1; i < paginationList.length - 1; i++) {
		paginationList[i].id = i;
		addFuc(paginationList[i], "click", function() {
			index = this.id;
			reCourse(this.id);
		});
	}
}

//显示课程详情函数
function showCourse() {
	var courseCell = document.getElementsByClassName('courseLi');
	for(var i = 0; i < courseCell.length; i++) {
		addFuc(courseCell[i], "mouseover", function() {
			var dialog = this.getElementsByClassName('mDialog')[0];
			dialog.style.display = 'block';
		});
		addFuc(courseCell[i], "mouseout", function() {
			var dialog = this.getElementsByClassName('mDialog')[0];
			dialog.style.display = 'none';
		});
	}
}
// 产品设计和编程语言的切换函数
function tabSwitch(size) {
	var productBtn = document.getElementsByClassName('product')[0],
		programBtn = document.getElementsByClassName('program')[0],
		data = null;
	// 点击事件
	addFuc(productBtn, "click", function() {
		if(hasClass(programBtn, 'current')) {
			removeClass(programBtn, 'current');
			addClass(productBtn, 'current');
			initCourse(1, size, 10);
		}
	});
	addFuc(programBtn, "click", function() {
		if(hasClass(productBtn, 'current')) {
			removeClass(productBtn, 'current');
			addClass(programBtn, 'current');
			initCourse(1, size, 20);
		}
	});
	// 初始和刷新时自动加载产品设计
	initCourse(1, size, 10);
}
// 自适应窗口大小调整每页显示的课程数
function mainContent() {
	var tag = null; // 记录当前的每页课程数   
	if(document.body.clientWidth >= 1205) {
		tag = 20;
		tabSwitch(20);
	} else {
		tag = 15;
		tabSwitch(15);
	}
	// 根据窗口大小，做动态的布局改变
	addFuc(window, "resize", function() {
		if(tag == 15) {
			if(document.body.clientWidth >= 1205) {
				tag = 20;
				tabSwitch(20);
			}
		} else {
			if(document.body.clientWidth <= 1205) {
				tag = 15;
				tabSwitch(15);
			}
		}
	});
}
addLoadEvent(mainContent);