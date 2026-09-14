

jQuery(function(){

	nav.init();
	$(window).on("resize", function () {
		nav.resize();
		if($(window).innerWidth() > 961){
			$('#header .change-tel').attr('href', "CS00.html");
			$('#header .public-service, #footer .public-service').attr('href', "http://www.ykorum.com/orum/index.html");
		}else{
			$('#header .change-tel').attr('href', "tel:1688-7073");
			$('#header .public-service, #footer .public-service').attr('href', "http://www.ykorum.com/orum/m/");
		}

		// viewPort();
		isMobile();
	});

	$(window).on("scroll", function () {
		nav.resize();
	});

	$('.overlay .btn-close').click(function (e) {
		e.preventDefault();
		var target = $(this).closest('.overlay');
		modalClose(target);
	});

	tabLink();

	// ios viewport
	let viewPort = () => {
		let Vh = window.innerHeight * 0.01;
		document.documentElement.style.setProperty('--vh', `${Vh}px`);
	}
	// viewPort();
	

	// AOS
	AOS.init({
		easing: 'ease-out-quart',
		once: true,
		duration: 2500,
	});

	// 팝업 검색
	popAutoComplete();

	function isMobile() {

		var user = navigator.userAgent;
		var is_mobile = false;
		
		if( user.indexOf("iPhone") > -1 || user.indexOf("Android") > -1 ) {
			is_mobile = true;
			$('body').addClass('mobile-device');
		}else{
			$("body").niceScroll({
				zindex: 1000,
				// horizrailenabled: false,
				scrollspeed: 50,
				mousescrollstep: 40,
				smoothscroll: true,
				// nativeparentscrolling: false,
				// touchbehavior: false,
			});
			$("body").getNiceScroll().resize();
		}
		return is_mobile;	
	}
	isMobile();

});

//nav
var nav = {
	gnbScrollTop: 0,
	delta: 80,
	unMob: 960,
	inWidth : window.innerWidth,

	//init
	init: function () {
		nav.checkViewport();
		nav.headerChange();
		$(document).on('click', '#hamburger', function () {
			if ($('html, body').hasClass('opened-nav')) {
				nav.closeNav();				
			} else {
				nav.openNav();
			}
		});

	},

	//checkViewport
	checkViewport: function () {
		var wWidth = window.innerWidth;
		let depth = document.querySelectorAll('#nav .primary > li .has-depth');

		if(wWidth > nav.unMob) {
			$('body').removeClass('is-mobile');
			depth.forEach( (item, idx)=>{
				let gnbDepthHref = item.getAttribute('data-href');
				depth[idx].href= `${gnbDepthHref}.html`;
			})
		} else {
			$('body').addClass('is-mobile');
			depth.forEach( (item, idx)=>{
				item.href="javascript:void(0);";
			});

			$('body').on('click', '#nav .primary > li .has-depth', function (e) {
				var moTarget = $(this).closest('li'),
					realTarget = $(this).attr('href');

				if ($(moTarget).hasClass('active')) {
					location.href = realTarget;
				} else {
					$(moTarget).addClass('active');
					$(moTarget).siblings('li').removeClass('active');
				}
			});

		}

		//for ios vh
		// let vh = window.innerHeight * 0.01;
		// document.documentElement.style.setProperty('--vh', `${vh}px`);
	},

	//current
	current: function (dep1, dep2) {
		let windowW = $(window).innerWidth();
		var gnb = $('#nav .gnb.aside li.menu ul li'),
			current1 = dep1 - 1;
			// gnbDep = $(gnb).eq(current1).find('.has-depth'),
			// current2 = dep2 - 1;
		//dep1
		if (!dep1 == "") {
			$(gnb).eq(current1).addClass('current');
			$(gnb).eq(current1).siblings().removeClass('current');
			if (windowW < 821) {
				$(gnb).eq(current1).addClass('active');
				$(gnb).eq(current1).removeClass('current');
			} else {
				$(gnb).eq(current1).removeClass('active');
			}
		}

		//dep2
		// if (!dep2 == "") {
		// 	$(gnbDep).eq(current2).addClass('current');
		// 	$(gnbDep).eq(current2).siblings().removeClass('current');
		// }
	},

	//openNav
	openNav: function () {
		$('html, body').addClass("opened-nav");
		let depth = document.querySelectorAll('#nav .primary > li .has-depth');
		if(window.innerWidth < 821){
			depth.forEach( (item, idx)=>{
				item.href="javascript:void(0);";
			});
		}else{
			depth.forEach( (item, idx)=>{
				let depthHref = item.getAttribute('data-href');
				depth[idx].href= `${depthHref}.html`;
			});
		}		
		$('body').removeClass("modal-opened");
		$('.overlay').removeClass('active');

		function isMobile() {

			var user = navigator.userAgent;
			var is_mobile = false;
			
			if( user.indexOf("iPhone") > -1 || user.indexOf("Android") > -1 ) {
				is_mobile = true;
				$('body').addClass('mobile-device');
			}else{
				$('body').getNiceScroll().remove();
			}
			return is_mobile;	
		}
		isMobile();
		
	},

	//closeNav
	closeNav: function () {
		$('html, body').removeClass("opened-nav");

		function isMobile() {
			var user = navigator.userAgent;
			var is_mobile = false;
			
			if( user.indexOf("iPhone") > -1 || user.indexOf("Android") > -1 ) {
				is_mobile = true;
				$('body').addClass('mobile-device');
			}else{
				$("body").niceScroll({
					zindex: 1000,                    
					scrollspeed: 50,
					mousescrollstep: 40,
					smoothscroll: true,                    
				});
				$("body").getNiceScroll().resize();
			}
			return is_mobile;	
		}
		isMobile();
	},

	//resize
	resize: function () {
		nav.checkViewport();
		nav.headerChange();

		$(window).on("scroll", function (e) {
			var st = $(this).scrollTop();

			//scroll Check
			if (st == 0) {
				$('body').removeClass('scroll-has');
			} else {
				$('body').addClass('scroll-has');

				if(st == $(document).height() - $(window).height()){
					$('body').addClass('scroll-end');
				} else {
					$('body').removeClass('scroll-end');
				}
			}

			if (Math.abs(nav.gnbScrollTop - st) <= nav.delta) return;

			//scroll up/down
			if ((st > nav.gnbScrollTop) && (nav.gnbScrollTop > 0)) {
				$('body').addClass('scroll-down').removeClass('scroll-up');
			} else {
				$('body').addClass('scroll-up').removeClass('scroll-down');
			}
			nav.gnbScrollTop = st;
		});
	},

	//headerChange
	headerChange: function () {
		var st = $(window).scrollTop(),
			$header = $("#container:not('.transparent') #header"),
			headerH = $header.outerHeight();

		//header Fix
		if (st > headerH) {
			$header.addClass("fixed");
		} else {
			$header.removeClass("fixed");
		}
	},
	FooterNav: function(){
		const NavThis = $('#footer .footer-nav > li > .has-depth');
		NavThis.click(function(e){
			if($(window).innerWidth() < 821){
				$(this).parent('li').toggleClass('active');
				NavThis.not($(this)).parent('li').removeClass('active');

				$(this).siblings('ul').slideToggle(300);
				NavThis.not($(this)).siblings('ul').slideUp(300);
				// alert('hi');
			}else{
				e.preventDefault();
				$(this).parent('li').removeClass('active');
			}
		});

		$('.floating-wrap .btn.top').click(() => {
			$( 'html, body' ).animate( { scrollTop : 0 }, 400 );
			return false;
		})

		
		$('#footer .footer-nav .has-depth').each( (idx, item) => {
			let f_depth = $(item).attr('href');
			let f_arr = [];
			f_arr.push(f_depth);
			$(window).resize( () => {
				if($(window).innerWidth() > 821){
					$(item).attr('href', f_arr);
				}else{
					$(item).attr('href', "javascript:void(0);")
				}
			});	
			if($(window).innerWidth() > 821){
				$(item).attr('href', f_arr);
			}else{
				$(item).attr('href', "javascript:void(0);")
			}
		});
		
		$('#cookie .btn.close').click( () => {
			$('#cookie').addClass('closed');
		});

	}
}

// modalOpen
function modalOpen(popId){
	$(popId).addClass("active");
	$('body').addClass("modal-opened");
	$('#header').addClass('fixed');
	$('html, body').removeClass('opened-nav');

	function isMobile() {
		var user = navigator.userAgent;
		var is_mobile = false;
		
		if( user.indexOf("iPhone") > -1 || user.indexOf("Android") > -1 ) {
			is_mobile = true;
			$('body').addClass('mobile-device');
		}else{
			$('body').getNiceScroll().remove();
		}
		return is_mobile;	
	}
	isMobile();
	
	var $popHeight = $(popId).find('.popup').height();
    if ($(window).height() < $popHeight) {
        $(popId).addClass('flow-y');
    }
}

// modalClose
function modalClose(popId){
	$(popId).removeClass("active");
	$('#header').removeClass('fixed');
	$('body').removeClass("modal-opened");
	function isMobile() {
		var user = navigator.userAgent;
		var is_mobile = false;
		
		if( user.indexOf("iPhone") > -1 || user.indexOf("Android") > -1 ) {
			is_mobile = true;
			$('body').addClass('mobile-device');
		}else{
			$("body").niceScroll({
				zindex: 1000,                    
				scrollspeed: 50,
				mousescrollstep: 40,
				smoothscroll: true,                    
			});
			$("body").getNiceScroll().resize();
		}
		return is_mobile;	
	}
	isMobile();
}

//tabLink
function tabLink() {
	$('.tabs.small > li a, .tabs.swiper-wrapper > li a').each(function(){
		var tabTarget=$(this).attr('href');
		$(this).click(function(e){
			e.preventDefault();
			$(this).parent('li').addClass('active').find('a').attr('aria-selected', 'true');
			$(this).parent('li').siblings('li').removeClass('active').find('a').attr('aria-selected', 'false');
			$(tabTarget).addClass('active').siblings('.tab-content').removeClass('active');
			
		});
	});

	$('.tabs.small > li a').on('keydown', function (e) {
		var tabTarget=$(this).attr('href');
		if (e.keyCode == 32) {
			e.preventDefault();
			$(this).parent('li').addClass('active').find('a').attr('aria-selected', 'true');
			$(this).parent('li').siblings('li').removeClass('active').find('a').attr('aria-selected', 'false');
			$(tabTarget).addClass('active').siblings('.tab-content').removeClass('active');
		}
	});

	$('.tabs.medium').each(function () {
		var divide = $(this).find('li').length;
		$(this).find('li').each(function () {
			$(this).css('width', parseFloat(100 / divide) + '%');
		});
	});
}

//accordion
function accordion(targetN) {
	$('.js-accordion-switche').click(function(e) {
		e.preventDefault();

		var container = $(this).parent().parent();
		var slideContent = $(container).children('.js-accordion-content');

		if ($(container).hasClass('active')){
			$(container).removeClass('active').find('button');
			$(slideContent).slideUp(600);
		} else {
			if(targetN == 1){
				$(container).siblings().removeClass('active').find('button');
				$(container).siblings().children('.js-accordion-content').slideUp(600);
			}
			$(container).addClass('active').find('button');
			$(slideContent).slideDown(600);
		}
	});
}

//input maxLengthCheck
function maxLengthCheck(obj){
	if(obj.value.length > obj.maxLength) {
		obj.value = obj.value.slice(0, obj.maxLength);
	}
}

// 달력 팝업
function datePicker() {
	$('input.date').datepicker({
		changeMonth: true,
		changeYear: true,
		autoSize: true,
		size: "18px",
		dateFormat: 'yy.mm.dd',
		prevText: '이전 달',
		nextText: '다음 달',
		monthNames: ['. 01', '. 02', '. 03', '. 04', '. 05', '. 06', '. 07', '. 08', '. 09', '. 10', '. 11', '. 12'],
		monthNamesShort: ['. 01', '. 02', '. 03', '. 04', '. 05', '. 06', '. 07', '. 08', '. 09', '. 10', '. 11', '. 12'],
		dayNames: ['일', '월', '화', '수', '목', '금', '토'],
		dayNamesShort: ['일', '월', '화', '수', '목', '금', '토'],
		dayNamesMin: ['일', '월', '화', '수', '목', '금', '토'],
		//yearSuffix: "년" ,
		showMonthAfterYear: true,
	});
}

// 검색 자동완성
function autoComplete() {
	$('.content-header .search-wrap .input-text').on('focus', function(){
		$(this).parent('.input-wrap').addClass('active');
		$("html, body").animate({ scrollTop: 0 }, 500);
	});

	$('.content-header .search-wrap .input-text').on('keydown, keyup', function () {	
		var searchWord = $(this).val();
		var searchLength = searchWord.length;
		if (searchLength >= 1) {
			$('.content-header .search-wrap, .content-header .autocomplete, .content-header .search-wrap .input-wrap').addClass('active');
			$(this).parent('.input-wrap').find('.btn.clear').show();
			$('body').addClass('modal-opened');
		} else {
			$('.content-header .search-wrap, .content-header .autocomplete, .content-header .search-wrap .input-wrap').removeClass('active');
			$(this).parent('.input-wrap').find('.btn.clear').hide();
		}
	});

	$('.search-bottom .btn.small').click(function() {
		$('.content-header .search-wrap, .content-header .autocomplete, .content-header .search-wrap .input-wrap').removeClass('active');
		$('.content-header .search-wrap .input-text').val('');
		$('body').removeClass('modal-opened');
	});

	$('.content-header .search-wrap .btn.clear').click(function() {
		$(this).siblings('.input-text').val('');
		$(this).hide();
		$('.content-header .autocomplete').removeClass('active');
		return false;
	});
}

function searchLocation(){
	$('.location .search-wrap .input-text').on('focus', function(){
		$(this).parent('.input-wrap').addClass('active');
	});

	$('.location .search-wrap .input-text').on('keydown, keyup', function () {	
		var searchWord = $(this).val();
		var searchLength = searchWord.length;
		if (searchLength >= 1) {
			$('.location .search-wrap, .location .autocomplete, .location .search-wrap .input-wrap').addClass('active');
			$(this).parent('.input-wrap').find('.btn.clear').show();
		} else {
			$('.location .search-wrap, .location .autocomplete, .location .search-wrap .input-wrap').removeClass('active');
			$(this).parent('.input-wrap').find('.btn.clear').hide();
		}
	});

	$('.location .search-wrap .btn.clear').click(function() {
		$('.location .search-wrap, .location .autocomplete, .location .search-wrap .input-wrap').removeClass('active');
		$(this).siblings('.input-text').val('');
		$(this).hide();
		return false;
	});
}

//팝업 자동완성
function popAutoComplete() {
	$('.pop-search .search-wrap .input-text').on('focus', function(){
		$(this).parent('.input-wrap').addClass('active');
	});

	$('.pop-search .search-wrap .input-text').on('keydown, keyup', function () {	
		var searchWord = $(this).val();
		var searchLength = searchWord.length;
		if (searchLength >= 1) {
			$('.pop-search .search-wrap, .pop-search .autocomplete, .pop-search .search-bottom, .pop-search .search-wrap .input-wrap').addClass('active');
			$(this).parent('.input-wrap').find('.btn.clear').show();
			$('body').addClass('modal-opened');
		} else {
			$('.pop-search .search-wrap, .autocomplete, .pop-search .search-bottom, .pop-search .search-wrap .input-wrap').removeClass('active');
			$(this).parent('.input-wrap').find('.btn.clear').hide();
		}
	});

	$('.pop-search .search-wrap .btn.clear').click(function() {
		$(this).siblings('.input-text').val('');
		$(this).hide();
		$('.pop-search .autocomplete, .pop-search .search-bottom, .pop-search .input-wrap').removeClass('active');
		return false;
	});

	$('.pop-search .tag-wrap .tag').each( (idx, item)=> {
		$(item).click( () => {
			$('.pop-search .search-wrap input[type="text"]').val($(item).val());
		});
	});
}

function keywordAutoComplete() {
	$('.keyword .search-wrap .input-text').on('focus', function(){
		$(this).parent('.input-wrap').addClass('active');
		$('html, body').animate({
	        scrollTop: $(".keyword").offset().top
	    }, 500);
	});

	$('.keyword .search-wrap .input-text').on('keydown, keyup', function () {	
		var searchWord = $(this).val();
		var searchLength = searchWord.length;
		if (searchLength >= 1) {
			$('.keyword .search-wrap, .keyword .autocomplete, .keyword .search-wrap .input-wrap').addClass('active');
			$(this).parent('.input-wrap').find('.btn.clear').show();
			//$('body').addClass('modal-opened');
		} else {
			$('.keyword .search-wrap, .keyword .autocomplete, .keyword .search-wrap .input-wrap').removeClass('active');
			$(this).parent('.input-wrap').find('.btn.clear').hide();
		}
	});

	$('.keyword .search-wrap .btn.clear').click(function() {
		$(this).siblings('.input-text').val('');
		$(this).hide();
		$('.keyword .autocomplete').removeClass('active');
		return false;
	});

	$('.keyword .tag-wrap .tag').each( (idx, item)=> {
		$(item).click( () => {
			$('.keyword .search-wrap input[type="text"]').val($(item).val());
		});
	});
}

// // 새로고침시 상단 이동		
function reloadHistory(){ // 새로고침 시 제일 상단으로 이동
	history.scrollRestoration = "manual";
}
reloadHistory();

