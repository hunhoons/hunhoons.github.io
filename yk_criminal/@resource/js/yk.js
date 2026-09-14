jQuery(function(){

	
	nav.init();
	tabLink();

	$(window).on("resize", function () {
		nav.resize();
	});

	$(window).on("scroll", function () {
		nav.resize();
	});

	$('.overlay .btn-close').click(function (e) {
		e.preventDefault();
		var target = $(this).closest('.overlay');
		modalClose(target);
	});

	popDataSearch();

});

//nav
var nav = {
	gnbScrollTop: 0,
	delta: 80,
	unMob: 960,

	//init
	init: function () {
		nav.checkViewport();
		nav.headerChange();

		$(document).on('click', '#hamburger', function () {
			if ($('body').hasClass('opened-nav')) {
				nav.closeNav();
			} else {
				nav.openNav();
			}
		});

		$(document).on('click', '#goTop', function () {
			window.scrollTo({top: 0, behavior:'smooth'});
		});

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
			if ((st > nav.gnbScrollTop) && (nav.gnbScrollTop > 10)) {
				$('body').addClass('scroll-down').removeClass('scroll-up');
			} else {
				$('body').addClass('scroll-up').removeClass('scroll-down');
			}
			nav.gnbScrollTop = st;
		});

		
		$('body').on('click', '#nav .menu .has-depth', function(e){
			const headerThis = $('#nav .menu .has-depth');
			if($(window).innerWidth() < 1281){
				e.preventDefault();
				$(this).parent('li').toggleClass('active');
				headerThis.not($(this)).parent('li').removeClass('active');
				$(this).siblings('ul').slideToggle(300);
				headerThis.not($(this)).siblings('ul').slideUp(300);
			}else{
				$(this).parent('li').removeClass('active');
			}
		});
	
		$('body').on('click', "#floatBenner .benner-close", function(){
			$('#floatBenner').addClass('active');
			$("#header .floating-wrap").removeClass("position");
		});
		

		
		

		if (!$("#floatBenner").hasClass('active')) {
			$("#header .floating-wrap").addClass("position");
        }else{
			$("#header .floating-wrap").removeClass("position");
		}


	},

	//checkViewport
	checkViewport: function () {
		var wWidth = window.innerWidth;

		if(wWidth > nav.unMob) {
			$('body').removeClass('is-mobile');
		} else {
			$('body').addClass('is-mobile');
		}

		//for ios vh
		let vh = window.innerHeight * 0.01;
		document.documentElement.style.setProperty('--vh', `${vh}px`);

		if(wWidth > 1280){
			$("body").on('mouseenter', "#nav .menu", () => {
				if(!$('body').hasClass('modal-opened')){
					$("#header").addClass("nav-hover")
				}
			});
			$("body").on('mouseleave', "#nav .menu", () => {
				$("#header").removeClass("nav-hover")
			});
			$("body").removeClass("opened-nav");
		}else{
			$("body").off('mouseenter', "#nav .menu", () => {
				$("#header").removeClass("nav-hover")
			});
		}

	},

	//openNav
	openNav: function () {
		$('body').addClass("opened-nav");
		if($('body').hasClass('modal-opened')){
			$('body').removeClass('modal-opened')
		}
	},

	//closeNav
	closeNav: function () {
		$('body').removeClass("opened-nav");
		if($('#popSearch').hasClass('active')){
			$('#popSearch').removeClass('active')
		}
	},

	//resize
	resize: function () {
		nav.checkViewport();
		nav.headerChange();
	},

	//current
	current: function (dep1, dep2) {
		var gnb = $('#nav .menu > li'),
			current1 = dep1 - 1,
			gnbDep = $(gnb).eq(current1).find('li'),
			current2 = dep2 - 1;

		//dep1
		if (!dep1 == "") {
			$(gnb).eq(current1).addClass('current');
			$(gnb).eq(current1).siblings().removeClass('current');
		}

		//dep2
		if (!dep2 == "") {
			$(gnbDep).eq(current2).addClass('current');
			$(gnbDep).eq(current2).siblings().removeClass('current');
		}
	},

	//headerChange
	headerChange: function () {
		var st = $(window).scrollTop(),
			$header = $("#header"),
			headerH = $header.outerHeight();

		//header Fix
		if (st > headerH) {
			$header.addClass("fixed");
		} else {
			$header.removeClass("fixed");
		}
	},
	HeaderHref: function(){
		$('#nav .menu .has-depth').each( (idx, item) => {
			
			let h_depth = $(item).attr('href');
			let h_arr = [];
			h_arr.push(h_depth);
			$(window).resize( () => {
				if($(window).innerWidth() > 1281){
					$(item).attr('href', h_arr);
				}else{
					$(item).attr('href', "javascript:void(0);")
				}
			});	
			if($(window).innerWidth() > 1281){
				$(item).attr('href', h_arr);
			}else{
				$(item).attr('href', "javascript:void(0);")
			}
		});
	},
	FooterNav: function(){
		const NavThis = $('#footer .footer-nav > li:not(.type-depth) .has-depth');
		NavThis.click(function(e){
			if ($(window).innerWidth() < 961) {
				e.preventDefault();
                $(this).parent("li").toggleClass("active");
                NavThis.not($(this)).parent("li").removeClass("active");

                $(this).siblings("ul").slideToggle(300);
                NavThis.not($(this)).siblings("ul").slideUp(300);
                // alert('hi');
            } else {
                $(this).parent("li").removeClass("active");
            }
		});
		
		$('#footer .footer-nav > li:not(.type-depth) .has-depth').each( (idx, item) => {
			let f_depth = $(item).attr('href');
			let f_arr = [];
			f_arr.push(f_depth);
			$(window).resize( () => {
				if($(window).innerWidth() > 961){
					$(item).attr('href', f_arr);
				}else{
					$(item).attr('href', "javascript:void(0);")
				}
			});	
			if ($(window).innerWidth() > 961) {
                $(item).attr("href", f_arr);
            } else {
                $(item).attr("href", "javascript:void(0);");
            }
		});

		

	}
}

// modalOpen
function modalOpen(popId){
	$(popId).addClass("active");
	$('body').addClass("modal-opened");
	if($('body').hasClass("opened-nav")){
		$('body').removeClass("opened-nav");
	}
}
// modalAcc
function modalAcc(btn){
	if ($(btn).attr('aria-haspopup')  === 'true') {

		var layerpop = $("#" + $(btn).attr("aria-controls"));
		var popup = layerpop.children(".popup");
		var btnPopClose = layerpop.find(".pop-close");
		var focusAble = popup.find("button, input:not([type='hidden']), select, iframe, textarea, [href], [tabindex]:not([tabindex='-1'])");
		var focusAbleFirst = focusAble && focusAble.first();
		var focusAbleLast = focusAble && focusAble.last();
		var layerpopOuter = $("#wrap");
		var focusDisable;

		function popupClose() {
			if (focusDisable === true) popup.attr("tabindex", "-1");
			modalClose(target);
			layerpopOuter.removeAttr("aria-hidden");
			$(btn).focus();
			$(document).off("keydown");
		}

		$(btn).blur();
		layerpopOuter.attr("aria-hidden", "true");
		focusAble.length ? focusAbleFirst.focus().on("keydown", function (event) {
			if (event.shiftKey && (event.keyCode || event.which) === 9) {// Shift + Tab키
				event.preventDefault();
				focusAbleLast.focus();
			}
		}) : popup.attr("tabindex", "0").focus().on("keydown", function (event) {
			focusDisable = true;
			if ((event.keyCode || event.which) === 9) event.preventDefault();
		});

		focusAbleLast.on("keydown", function (event) {
			if (!event.shiftKey && (event.keyCode || event.which) === 9) { // Tab키
				event.preventDefault();
				focusAbleFirst.focus();
			}
		});

		btnPopClose.on("click", popupClose);

		layerpop.on("click", function (event) {
			if (event.target === event.currentTarget) {
				popupClose();
			}
		});

		$(document).on("keydown", function (event) {
			console.log('esc');
			var keyType = event.keyCode || event.which; // Esc키 : 레이어 닫기
			if (keyType === 27 && layerpop.hasClass("active")) {
				popupClose();
			}
		});
	}
}

// modalClose
function modalClose(popId){
	$(popId).removeClass("active");
	$('body').removeClass("modal-opened");
}

// 달력 팝업
function datePicker() {
	$('input.calader').datepicker({
		changeMonth: true,
		changeYear: true,
		autoSize: true,
		size: "15px",
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
		minDate: new Date(),
	});
}

//tabLink
function tabLink(targer) {
	$('.tabs:not(.basic.large) > li a').each(function(){
		var tabTarget = $(this).attr('href'),
			linkTarget = $(this).attr('title');

		$(this).click(function(e){
			if (linkTarget != '페이지이동'){
				e.preventDefault();
			}

			$(this).parent('li').addClass('current');
			$(this).parent('li').siblings('li').removeClass('current');
			$(tabTarget).addClass('active').siblings('.tab-content').removeClass('active');
			
		});
	});
}

//numberMaxLength
function numberMaxLength(e){
	if(e.value.length > e.maxLength){
		e.value = e.value.slice(0, e.maxLength);
	}
}

// 휴대폰 자동 하이픈
const autoHyphen2 = (target) => {
    target.value = target.value
        .replace(/[^0-9]/g, "")
        .replace(/^(\d{0,3})(\d{0,4})(\d{0,4})$/g, "$1-$2-$3")
        .replace(/(\-{1,2})$/g, "");
};

//accordion
function accordion(targetN) {

	$('.js-accordion-switche').each( (idx, item) => {
		$(item).click( (e) => {
			e.preventDefault();

			const container = $(item).parent();
			const slideContent = $(container).siblings('.js-accordion-content');	

		if ($(container).hasClass('active')){
			$(container).removeClass('active').find('button');
			$(slideContent).slideUp(600);
		} else {
			if(targetN == 1){
				$(container).siblings().removeClass('active').find('button');
				$(container).siblings().children('.js-accordion-content').slideUp(300);
			}
			$(container).addClass('active').find('button');
			$(slideContent).slideDown(300);
		}

		});
	});
};

// 검색 자동완성 
function dataSearch(target){
	const dataSchbox = $('#content .search-wrap .search-box'),
		  dataValue = $('#content .search-wrap:not(.map-sch) input[type="search"'),
		  autoComp = $('#content .search-wrap .search-box'),		  
		  schClear = $('#content .search-wrap .input-wrap .btn.clear'),
		  schClose = $('#content .search-wrap .button-area .btn.close');
	
	if(target == 1){
		const mapDataValue = $('#content .search-wrap.map-sch input[type="search"');	

		mapDataValue.on('input, keydown, keyup', function(){
			let valLength = mapDataValue.val().length;
			if($(this).val() != "" && valLength >= 1){
				schClear.fadeIn(200);
				dataSchbox.slideDown(300);
				setTimeout( () => {
					autoComp.addClass('active');				
				},200);
			}else{
				schClear.fadeOut(200);
				autoComp.removeClass('active');					
				setTimeout( () => {
					dataSchbox.slideUp(300);
				},300);
			}
		});
	
		schClear.click( function(){
			autoComp.removeClass('active');
			schClear.fadeOut(100);
			mapDataValue.val("");
			$('body').removeClass('search-input');
			setTimeout( () => {
				dataSchbox.slideUp(300);
			},200)
			return false;
		});

	}else{
		dataValue.on('focus', function(){
			if($(window).innerWidth() > 821){
				$("html, body").animate({ scrollTop: 0 },500);
			}else{
				$("html, body").animate({ scrollTop: $("#content").position().top }, 500);
			}
		});
	
		dataValue.on('input, keydown, keyup', function(){
			let valLength = dataValue.val().length;
			if($(this).val() != "" && valLength >= 1){
				schClear.fadeIn(200);
				dataSchbox.slideDown(300);
				setTimeout( () => {
					autoComp.addClass('active');				
				},200);
				$('body').addClass('search-input');
			}else{
				schClear.fadeOut(200);
				autoComp.removeClass('active');					
				setTimeout( () => {
					dataSchbox.slideUp(300);
					$('body').removeClass('search-input');
				},300);
			}
		});
	
		schClear.click( function(){
			autoComp.removeClass('active');
			schClear.fadeOut(100);
			dataValue.val("");
			$('body').removeClass('search-input');
			setTimeout( () => {
				dataSchbox.slideUp(300);
			},200)
			return false;
		});
	
		schClose.click( function(){
			autoComp.removeClass('active');
			schClear.fadeOut(100);
			dataValue.val("");
			$('body').removeClass('search-input');
			setTimeout( () => {
				dataSchbox.slideUp(300);
			},200)
			return false;
		});
	}

}


function popDataSearch(){
	const popDataSchbox = $('#popSearch .search-wrap .search-box'),
		  popDataValue = $('#popSearch .search-wrap:not(.map-sch) input[type="search"]'),
		  popAutoComp = $('#popSearch .search-wrap .search-box'),		  
		  popSchClear = $('#popSearch .search-wrap .input-wrap .btn.clear'),
		  popSchClose = $('#popSearch .search-wrap .button-area .btn.close');
	
		  popDataValue.on('input, keydown, keyup', function(){
			let valLength = popDataValue.val().length;
			if($(this).val() != "" && valLength >= 1){
				popSchClear.fadeIn(200);
				popDataSchbox.slideDown(300);
				setTimeout( () => {
					popAutoComp.addClass('active');				
				},200);
				$('body').addClass('modal-opened');
			}else{
				popSchClear.fadeOut(200);
				popAutoComp.removeClass('active');					
				setTimeout( () => {
					popDataSchbox.slideUp(300);
					$('body').removeClass('modal-opened');
				},300);
			}
		});
	
		popSchClear.click( function(){
			popAutoComp.removeClass('active');
			popSchClear.fadeOut(100);
			popDataValue.val("");
			setTimeout( () => {
				popDataSchbox.slideUp(300);
			},200)
			return false;
		});
	
		popSchClose.click( function(){
			popAutoComp.removeClass('active');
			popSchClear.fadeOut(100);
			popDataValue.val("");
			setTimeout( () => {
				popDataSchbox.slideUp(300);
			},200)
			return false;
		});

}
