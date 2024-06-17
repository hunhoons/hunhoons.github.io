$( () => {

    fnc.init();

    $(window).on('resize', () => {
        fnc.checkView();
    });
    $(window).on('scroll', () => {
        fnc.checkView();
    });

});

// Variables
var fnc = {
    gnbScrollTop: 0,
	delta: 80,
	unMob: 960,

	//init
	init: function () {
		fnc.checkView()		

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

			if (Math.abs(fnc.gnbScrollTop - st) <= fnc.delta) return;

			//scroll up/down
			if ((st > fnc.gnbScrollTop) && (fnc.gnbScrollTop > 0)) {
				$('body').addClass('scroll-down').removeClass('scroll-up');
			} else {
				$('body').addClass('scroll-up').removeClass('scroll-down');
			}
			fnc.gnbScrollTop = st;
		});
	},
    checkView: function() {
        let vh = window.innerHeight * 0.01;
        document.documentElement.style.setProperty('--vh', `${vh}px`);
    },
}