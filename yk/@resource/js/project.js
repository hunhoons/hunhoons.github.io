jQuery(function(){

	nav.init();

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
	},

	//current
	current: function (dep1, dep2) {
		var gnb = $('#nav ul > li'),
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

	//openNav
	openNav: function () {
		$('body').addClass("opened-nav");
	},

	//closeNav
	closeNav: function () {
		$('body').removeClass("opened-nav");
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
			$header = $("#header"),
			headerH = $header.outerHeight();

		//header Fix
		if (st > headerH) {
			$header.addClass("fixed");
		} else {
			$header.removeClass("fixed");
		}
	}
}

// modalOpen
function modalOpen(popId){
	$(popId).addClass("active");
	$('body').addClass("modal-opened");
}

// modalClose
function modalClose(popId){
	$(popId).removeClass("active");
	$('body').removeClass("modal-opened");
}
