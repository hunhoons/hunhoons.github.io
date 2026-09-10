jQuery(function(){

	nav.init();

	$(window).on("resize", function () {
		nav.resize();
	});

	$(window).on("scroll", function () {
		nav.resize();
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
		//nav.navHover();

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

		// banner 문의
		$(document).on('click', '#btnConatct', function(){
			if($('#bannerUserName').val() == "" || $('#bannerUserName').val() == null){
				alert('이름을 입력해주세요.');
                $('#bannerUserName').focus();
                return false;
			}

			if($('#bannerUserTel').val() == "" || $('#bannerUserTel').val() == null){
				alert('연락처를 입력해주세요.');
                $('#bannerUserTel').focus();
                return false;
			}

			if($('#bannerUserTel').val().length < 13){
				alert(`잘못된 양식입니다. \n연락처를 다시 입력해주세요.`);
                $('#bannerUserTel').val("");
                $('#bannerUserTel').focus();
                return false;
			}

			if($('#bannerPrivacy').is(':checked') == false){
				alert('개인정보수집에 동의하여주세요.');
                return false;
			}


			if($(window).outerWidth() < 960){
				if($('#bannerUserName').val() != "" || $('#bannerUserTel').val() != ""){
					$('#bannerUserName').val("");
					$('#bannerUserTel').val("");

					alert('잘못된 접근입니다.');
					location.reload();
				}
			}

			$(this).prop('disabled', true);

			const form = $('#bannerDataForm')[0];
			const data = new FormData(form);

			$.ajax({
				url: "",
				data: data,
				type: "POST",
				dataType: 'JSON',
				contentType: false,
				processData: false,
				async: false,
				success : function (result){
					if(result.code == false){ // 실패 시
						alert(result.msg);
						$(this).prop('disabled', true);
					}else{
						alert(result.msg);
							location.href = "";
					}
				}, // success
			}); // $.ajax

		});


		// popup 검색
		$(document).on('click', '#popFormBtn', function(){

			let inputValue = $(this).parents('.search-wrap').find('input[type="text"]');
			if(inputValue.val() == "" || inputValue.val() == null){
				alert('검색어를 입력해주세요.');
				inputValue.focus();
				return false;
			}

			$(this).prop('disabled', true);

			const form = $('#popForm')[0];
			const data = new FormData(form);

			$.ajax({
				url: "",
				data: data,
				type: "POST",
				dataType: 'JSON',
				contentType: false,
				processData: false,
				async: false,
				success : function (result){
					if(result.code == false){ // 실패 시
						alert(result.msg);
						$(this).prop('disabled', true);
					}else{
						alert(result.msg);
							location.href = "";
					}
				}, // success
			}); // $.ajax

		});
		


		// 검색 시작
		$(document).on('input', '.search-wrap .input-text', function(){
			let parentrSearch = $(this).parents('.search-wrap');
			$(this).val() != "" ? 
			parentrSearch.addClass('inputs') : parentrSearch.removeClass('inputs');
		});
		$(document).on('click', '.btn.search-close', function(){
			$('.search-wrap').removeClass('inputs');
			$('.search-wrap .input-text').val("");kop
		});
		$(document).on('click', '.search-wrap .tag-wrap .tag', function(){
			let text = $(this).text();
			text = text.replace('#',"");
			//$('.search-wrap .input-text').val(text);
			if($('.search-wrap .input-text').val(text)){
				setTimeout( () => {
					$('.search-wrap #dataForm').submit();	
				}, 300);
			}
		});

		// 검색 종료
		

		// scroll
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

		// PC Nav
		$(document).off('mouseenter focusin', "#nav > ul");
		if(wWidth > 1024){
			$('body').on('mouseenter focusin', '#nav > ul', function(){
				$('#header').addClass('nav-hover');
	
			}).on('mouseleave', '#nav > ul', function(){
				$('#header').removeClass('nav-hover');
			});
		}
		

		// Mo Nav
		$(document).off('click', "#nav .depth1:not(.lawyers)");
		$(document).on('click', '#nav .depth1:not(.lawyers)', function(e){
			if(wWidth < 960){
				e.preventDefault();

				$(this).parent('li').toggleClass('current');
				$('#nav .depth1').not(this).parent('li').removeClass('current');
				// $(this).siblings('ul').slideUp(300); 
				// $('#nav .depth1').not(this).siblings('ul').slideUp(300);

			}
		});




		// MO Footer Nav
		$(document).off('click', "#footer .footer-nav .depth1:not(.lawyers)");
		if(wWidth < 768){
			$(document).on('click', "#footer .footer-nav .depth1:not(.lawyers)", function(e){
				e.preventDefault();				
				$(this).parent('li').toggleClass('current');
				$('#footer .footer-nav .depth1').not(this).parent('li').removeClass('current');

				$(this).siblings("ul").slideToggle(300);
                $('#footer .footer-nav .depth1').not(this).siblings("ul").slideUp(300);
			});
		}

		// opened nav remove
		if(wWidth > 960){
			$('body').removeClass('opened-nav');
			$('.float-contact .input-text').val("");
			$('.float-contact .checkbox').prop("checked", false);
		}




		$(document).on('click', '#aside li a', function(){
			$(this).parent('li').addClass('current');
			$('#aside li a').not(this).parent('li').removeClass('current');
		});

		$(document).off('click', "#aside .btn.lnb");
		let setLnbOpen = false;
		if(wWidth < 960){
			$(document).on('click', "#aside .btn.lnb", function(e){
				if(setLnbOpen){
					$('#aside').removeClass('opened-lnb');
					$(this).siblings('ul').fadeOut(200);
					setLnbOpen = false;
				}else{
					$('#aside').addClass('opened-lnb');
					$(this).siblings('ul').fadeIn(200);
					setLnbOpen = true;
				}
			});
		}else{
			$('#aside').removeClass('opened-lnb');
		}


		// header banner 문의
		if($(window).outerWidth() < 960){
			$('#bannerUserName').val("");
			$('#bannerUserName').prop('disabled', true);

			$('#bannerUserTel').val("");
			$('#bannerUserTel').prop('disabled', true);
		}else{
			$('#bannerUserName').prop('disabled', false);
			$('#bannerUserTel').prop('disabled', false);
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
	},

	//current
	current: function (dep1, dep2) {
		var gnb = $('#nav > ul > li'),
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
			//$('.float-contact').addClass("fixed");
		} else {
			$header.removeClass("fixed");
			//$('.float-contact').removeClass("fixed");
		}

		
		

	},

}

// Header
function HeaderWhite(target){
	let $target = $(target);
    $target.addClass("white");
    setTimeout(function(){
        $target.removeClass("white");
    }, 2000);
}

// locations
function LocationGnb(url, depth1, depth2, depth3) {

	if(depth1 != "" && (depth2 == "" || depth2 == null) && (depth3 == "" || depth3 == null )){
		return `
			<a href="./Main-001.html" class="local"> <i class="ico home"></i> </a>
			<a href="${url}" class="local"> ${depth1} </a>
		`;
	}
	if(depth1 != "" && depth2 != "" && (depth3 == "" || depth3 == null) ){
		return `
			<a href="./Main-001.html" class="local"> <i class="ico home"></i> </a>
			<a href="${url}" class="local"> ${depth1} </a>
			<span class="local"> ${depth2} </span>
		`;
	}

	if(depth1 != "" && depth2 != "" && depth3 != ""){
		return `
				<a href="./Main-001.html" class="local"> <i class="ico home"></i> </a>
				<a href="${url}" class="local"> ${depth1} </a>
				<span class="local"> ${depth2} </span>
				<span class="local"> ${depth3} </span>
			`;
	}

}




// 휴대폰 자동 하이픈
const autoHyphen = (target) => {
	target.value = target.value
		.replace(/[^0-9]/g, "")
		.replace(/^(\d{0,3})(\d{0,4})(\d{0,4})$/g, "$1-$2-$3")
		.replace(/(\-{1,2})$/g, "");
};

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

//tabLink
function tabLink() {
	$('.tabs > li a').each(function(){
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

// typing
function typeText(text) {
    var textElement = document.getElementById('typing-text');
    textElement.innerHTML = ''; // 기존 텍스트 제거
    var chars = text.split('');
    var index = 0;

    function type() {
        if (index < chars.length) {
            textElement.innerHTML += chars[index++];
            setTimeout(type, 200); // 타이핑 속도 조절 (100ms)
        }
    }
    type();
}

// clipboard
function ClipboardCopy(){
	const pageUrl = location.href;
	let inputs = document.createElement('input');
	inputs.setAttribute('type', 'hidden');
	inputs.classList.add('clipBoards');
	inputs.value = pageUrl;

	$('.article').append(inputs);

	let copy = document.querySelector('.clipBoards');
	window.navigator.clipboard.writeText(copy.value).then( () => {
		alert('현재 페이지 URL이 복사 되었습니다.');
		copy.remove();
	});
}

