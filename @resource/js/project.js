(() => {

	

	// resize 
	window.addEventListener('resize', () => {
		nav.resize();
	});

	// scroll
	window.addEventListener('scroll', () => {
		nav.resize();
	});

	var nav = {
		gnbScrollTop: 0,
		delta: 80,
		unMob: 960,
	
		//init
		init: () => {
			nav.checkViewport();
			//nav.headerChange();
	
			
	
			// $(window).on("scroll", function (e) {
			// 	var st = $(this).scrollTop();
	
			// 	//scroll Check
			// 	if (st == 0) {
			// 		$('body').removeClass('scroll-has');
			// 	} else {
			// 		$('body').addClass('scroll-has');
	
			// 		if(st == $(document).height() - $(window).height()){
			// 			$('body').addClass('scroll-end');
			// 		} else {




			// 			$('body').removeClass('scroll-end');
			// 		}
			// 	}
	
			// 	if (Math.abs(nav.gnbScrollTop - st) <= nav.delta) return;
	
			// 	//scroll up/down
			// 	if ((st > nav.gnbScrollTop) && (nav.gnbScrollTop > 0)) {
			// 		$('body').addClass('scroll-down').removeClass('scroll-up');
			// 	} else {
			// 		$('body').addClass('scroll-up').removeClass('scroll-down');
			// 	}
			// 	nav.gnbScrollTop = st;
			// });
		},
		//checkViewport
		checkViewport: () => {
			let cccc = 960;
			let wWidth = window.innerWidth;
			
			if(wWidth > cccc) {
				document.body.classList.remove('is-mobile');
			} else {
				document.body.classList.add('is-mobile');
			}
	
			//for ios vh
			let vh = window.innerHeight * 0.01;
			document.documentElement.style.setProperty('--vh', `${vh}px`);
	
		},
		resize : () => {
			nav.checkViewport()
		}
	
	}

	nav.init();

})();




//nav
// var nav = {
// 	gnbScrollTop: 0,
// 	delta: 80,
// 	unMob: 960,

// 	//init
// 	init: function () {
// 		nav.checkViewport();
// 		nav.headerChange();

// 		$(document).on('click', '.btn.navi', function () {
// 			if ($('body').hasClass('opened-nav')) {
// 				nav.closeNav();	
// 			} else {
// 				nav.openNav();
// 			}
// 		});

// 		$(document).on('click', '#goTop', function () {
// 			window.scrollTo({top: 0, behavior:'smooth'});
// 		});

// 		$(window).on("scroll", function (e) {
// 			var st = $(this).scrollTop();

// 			//scroll Check
// 			if (st == 0) {
// 				$('body').removeClass('scroll-has');
// 			} else {
// 				$('body').addClass('scroll-has');

// 				if(st == $(document).height() - $(window).height()){
// 					$('body').addClass('scroll-end');
// 				} else {
// 					$('body').removeClass('scroll-end');
// 				}
// 			}

// 			if (Math.abs(nav.gnbScrollTop - st) <= nav.delta) return;

// 			//scroll up/down
// 			if ((st > nav.gnbScrollTop) && (nav.gnbScrollTop > 0)) {
// 				$('body').addClass('scroll-down').removeClass('scroll-up');
// 			} else {
// 				$('body').addClass('scroll-up').removeClass('scroll-down');
// 			}
// 			nav.gnbScrollTop = st;
// 		});
// 	},

// 	//checkViewport
// 	checkViewport: function () {
// 		var wWidth = window.innerWidth;

// 		if(wWidth > nav.unMob) {
// 			$('body').removeClass('is-mobile');
// 		} else {
// 			$('body').addClass('is-mobile');
// 		}

// 		//for ios vh
// 		let vh = window.innerHeight * 0.01;
// 		document.documentElement.style.setProperty('--vh', `${vh}px`);
// 	},

// 	//openNav
// 	openNav: function () {
// 		$('body').addClass("opened-nav");
// 		setTimeout( () => {
// 			$('#nav').addClass('active');
// 		}, 800);
// 	},

// 	//closeNav
// 	closeNav: function () {
// 		$('#nav').removeClass('active');
// 		setTimeout( () => {
// 			$('body').removeClass("opened-nav");
// 		}, 600);
		
// 	},

// 	//resize
// 	resize: function () {
// 		nav.checkViewport();
// 		nav.headerChange();
// 	},

// 	//current
// 	current: function (dep1, dep2) {
// 		var gnb = $('#nav ul > li'),
// 			current1 = dep1 - 1,
// 			gnbDep = $(gnb).eq(current1).find('li'),
// 			current2 = dep2 - 1;

// 		//dep1
// 		if (!dep1 == "") {
// 			$(gnb).eq(current1).addClass('current');
// 			$(gnb).eq(current1).siblings().removeClass('current');
// 		}

// 		//dep2
// 		if (!dep2 == "") {
// 			$(gnbDep).eq(current2).addClass('current');
// 			$(gnbDep).eq(current2).siblings().removeClass('current');
// 		}
// 	},

// 	//headerChange
// 	headerChange: function () {
// 		var st = $(window).scrollTop(),
// 			$header = $("#header"),
// 			headerH = $header.outerHeight();

// 		//header Fix
// 		if (st > headerH) {
// 			$header.addClass("fixed");
// 		} else {
// 			$header.removeClass("fixed");
// 		}
// 	}
// }

// // modalOpen
// function modalOpen(popId){
// 	$(popId).addClass("active");
// 	$('body').addClass("modal-opened");
// }

// // modalClose
// function modalClose(popId){
// 	$(popId).removeClass("active");
// 	$('body').removeClass("modal-opened");
// }

// //tabLink
// function tabLink() {
// 	$('.tabs > li a').each(function(){
// 		var tabTarget = $(this).attr('href'),
// 			linkTarget = $(this).attr('title');

// 		$(this).click(function(e){
// 			if (linkTarget != '페이지이동'){
// 				e.preventDefault();
// 			}

// 			$(this).parent('li').addClass('current');
// 			$(this).parent('li').siblings('li').removeClass('current');
// 			$(tabTarget).addClass('active').siblings('.tab-content').removeClass('active');
// 		});
// 	});
// }

// //numberMaxLength
// function numberMaxLength(e){
// 	if(e.value.length > e.maxLength){
// 		e.value = e.value.slice(0, e.maxLength);
// 	}
// }
