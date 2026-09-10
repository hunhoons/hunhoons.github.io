$(function(){
	/* [Function - Script Inital Setting] 함수 - Script Inital Setting */
	isInit();

	/* [Function - Resize & Scroll Event] 함수 - 리사이즈 & 스크롤 이벤트 */
	window.addEventListener("resize", isResize);
	window.addEventListener("scroll", isScroll);
	window.addEventListener("orientationchange", setViewPort);
});


/* ========================================
= [DEFAULT FUNCTION SETTING] 기본 실행 함수(필수 함수)
= Description: Default Script Function Settings
======================================== */

/* [Default Funtion - Layout Include] 기본 함수 - Layout Include(헤더,푸터 가저오기) */
function isLayoutPath(callback) {
	document.addEventListener("DOMContentLoaded", function () {
		var includeElements = document.querySelectorAll('[data-include-path]');
		var loadedCount = 0;
		
		Array.prototype.forEach.call(includeElements, function (el, i, arr) {
			var includePath = el.dataset.includePath;
			
			if (includePath) {
				var xhttp = new XMLHttpRequest();
				xhttp.onreadystatechange = function () {
					if (this.readyState == 4 && this.status == 200) {
						el.outerHTML = this.responseText;
						loadedCount++;

						// 모든 include가 끝났을 때 callback 실행
						if (loadedCount === includeElements.length && typeof callback === "function") {
							callback();
						}
					} else if (this.status == 400) {
						el.outerHTML = "Page not found.";
					}
				};
				xhttp.open("GET", includePath, true);
				xhttp.send();
			}
		});
	});
}

/* [Default Funtion - Inital] 기본 함수 - Inital(초기 세팅) */
function isInit(){

	let $tablet = 1023; // 테블릿 
	let $mobile = 767; 	// 모바일

	// [Inital - GNB On/Off Event] 초기 세팅 - GNB On/Off Event
	$(document).on("click", "#header .btn.menu", function(){

		// [GNB On/Off Evnet - Opened Nav] Opened Nav로 On/Off
		$("body").toggleClass("opened-nav"); 
	});


	// [Intial - GNB Mouse In/Out Event] 초기 세팅 - GNB Mouse In/Out Event
	$(document).on("mouseenter", "#nav", function(){ // 마우스 인
		$("#header").addClass("nav-open");
		
	});
	$(document).on("mouseleave", "#nav", function(){ // 마우스 아웃
		$("#header").removeClass("nav-open");
		
	});

	$(document).on("click", "#scrollTopBtn", function(e){ // 마우스 아웃
		if(window.lenis){
			// 1. Lenis 일시 정지
			window.lenis.stop();

			// 2. Lenis scrollTo + onComplete 콜백
			window.lenis.scrollTo(0, {
				duration: 1.2,
				force: true,  // ✅ stop 상태에서도 강제 실행!
				onComplete: function () {
					window.lenis.start();
				}
			});
		}else{
			e.preventDefault();
			window.scrollTo({top: 0, behavior: 'smooth'})
		}
	});

	$(document).on("click", "#btnGlobals", function(){ // 마우스 아웃
		$(this).parents('.global-wrap').toggleClass('active');
		
	});
	

	// [Intial - Family Site Event] 초기 세팅 - Family Site Event
	$(document).on('click', '#footer .btn.family', function(){
		const wrap = $(this).closest(".family-wrap");
		const dropdown = wrap.find("ul");

		if (wrap.hasClass("open")) {
			wrap.removeClass("open up down");
			return;
		}

		wrap.removeClass("up down open");

		const dropHeight = dropdown.outerHeight();
		const btnRect = this.getBoundingClientRect();
		const spaceBottom = window.innerHeight - (btnRect.bottom * 1.1);

		if (spaceBottom  < dropHeight) {
			wrap.addClass("open up");   // 위로 열기
		} else {
			wrap.addClass("open down"); // 아래로 열기
		}

	});


	// [Intial - Lib & Function Collection] 초기 세팅 - Lib & Function Collection
	// [Lib - AOS] 라이브러리 - AOS
	// AOS.init({
	// 	duration: 800,  // 애니메이션 지속 시간 (밀리초)
	// 	easing: 'ease-out',  // 애니메이션의 이징 함수
	// 	disableMutationObserver: false
	// });
	// AOS.refresh();

	// [Lib - Leins] 라이브러리 - Leins(전역 변수 사용)
	initLenis();
	lenisScrollBarCustom();


	// [Set - Function] 세팅 - Function
	setViewPort(); 						// 뷰 사이즈(높이, 디바이스 체크)
	setBindDepth();						// 모바일 A Tag 클릭 방지
	setrefreshOnOrientationChange(100); // 가로모드 체크

	isScroll(); 						// 스크롤 함수
}
function initLenis(){
	const isMobile = window.innerWidth <= 1024;

	window.lenis = new Lenis({
		lerp				: isMobile ? 0.065 : 0.08,
		smoothTouch			: true,
		syncTouchLerp		: 0.09,					// 터치 관성 보간
		wheelMultiplier		: 0.7, 					// 휠 민감도 (0.6~0.8 실무 안정)
		touchMultiplier 	: 1,
		orientation			: 'vertical',
		autoToggle			: true,  				// 탭 전환 시 자동 stop/start
		allowNestedScroll	: true,  				// 모달/팝업 내부 스크롤 허용
		anchors				: true,  				// href="#id" 앵커 자동 스무딩
		stopInertiaOnNavigate: true,				// 페이지 이동 시 관성 멈춤
	});

	window.lenis.on('scroll', ScrollTrigger.update);
	gsap.ticker.add((time) => window.lenis.raf(time * 1000));
	gsap.ticker.lagSmoothing(0);
}
function lenisScrollBarCustom(){
	// 모바일인 경우 생성 안함
	const isMobile = window.innerWidth <= 1024;
    if (isMobile) return;

	const scrollbar = document.querySelector('.lenis-scrollbar');
	if(scrollbar) return; // 있는 경우 리턴

	const track = Object.assign( document.createElement('div'), {
		className: "lenis-scrollbar",
	});
	const thumb = Object.assign( document.createElement('div'), {
		className: "lenis-scrollbar-thumb",
	});
	track.appendChild(thumb);
	document.body.appendChild(track);

	
	// 스크롤 노출 여부 (스크롤이 되는 페이지만 활성화, 아닌 곳은 비활성화)
    const toggleVisibility = () => {
		requestAnimationFrame(() => {
			track.classList.toggle(
				'is-visible', 
				document.documentElement.scrollHeight > window.innerHeight
				// 화면 전체 스크롤(전체 높이) 값 > 화면 뷰 높이 값 보다 큰 경우 활성화
			);
		});
    };
    toggleVisibility(); // 초기 실행
    window.addEventListener('resize', toggleVisibility); 
    new ResizeObserver(toggleVisibility).observe(document.documentElement); // 요소 자체의 크기가 바뀔 때 감지

	// Thumb 위치 값
	window.lenis.on('scroll', ({ progress }) => {
		thumb.style.transform = `translateY(${progress * (track.clientHeight - thumb.clientHeight)}px)`;
	});

	// Track 클릭 시 위치 이동
	track.addEventListener('pointerdown', (e) => {
		e.preventDefault();

		// 클릭한 위치 비율 계산
		const ratio = (e.clientY - track.getBoundingClientRect().top) / track.clientHeight;
		//				트랙 상단에서 클릭 지점까지의 거리 (px)			/	트랙 전체 높이 (px)
		//				→ 0.0 (최상단) ~ 1.0 (최하단) 사이 값

		window.lenis.scrollTo(ratio * (document.documentElement.scrollHeight - window.innerHeight));
		//								전체 페이지 높이							현재 화면 높이
		//								→ 둘의 차이 = 실제 스크롤 가능한 최대 거리
	});

	let isDragging = false, startY = 0, startScroll = 0;

	thumb.addEventListener('pointerdown', (e) => {
		e.preventDefault();
		e.stopPropagation();
		isDragging  = true;
		startY      = e.clientY;
		startScroll = window.lenis.scroll;
		thumb.setPointerCapture(e.pointerId);
		track.classList.add('is-dragging');
	});

	window.addEventListener('pointermove', (e) => {
		if (!isDragging) return;
		const ratio = (e.clientY - startY) / (track.clientHeight - thumb.clientHeight);
		window.lenis.scrollTo(startScroll + ratio * (document.documentElement.scrollHeight - window.innerHeight), { immediate: true });
	});

	window.addEventListener('pointerup', () => {
		if (!isDragging) return;
		isDragging = false;
		track.classList.remove('is-dragging');
	});
}
// Thumb 위치 강제 업데이트 함수
function updateScrollbarThumb() {
	const track = document.querySelector('.lenis-scrollbar');
	const thumb = document.querySelector('.lenis-scrollbar-thumb');
	if (!track || !thumb) return;

	const progress = window.lenis.scroll / (document.documentElement.scrollHeight - window.innerHeight);
	thumb.style.transform = `translateY(${progress * (track.clientHeight - thumb.clientHeight)}px)`;
}




/* [Default Funtion - Resize] 기본 함수 - Resize(리사이즈:반응형) */
function isResize(){
	
	let $tablet = 1025; // 테블릿

	// [Resize - Menu Current Close] 리사이즈 - 메뉴 및 Current 닫기
	if ($(window).outerWidth() < $tablet) {
		$("body").removeClass("opened-nav");
		$("#nav .depth-1").closest("li").removeClass("current");
	}


	// [Resize - Lib & Function Collection] 초기 세팅 - Lib & Function Collection
	// [Lib - AOS] 라이브러리 - AOS
	//AOS.refresh();

	// [Set - Function] 세팅 - Function
	setViewPort(); 	// 뷰 사이즈(높이, 디바이스 체크)
	setBindDepth();	// 모바일 A Tag 클릭 방지
	setrefreshOnOrientationChange(100); // 가로모드 체크
}

/* [Default Funtion - Scroll] 기본 함수 - Scroll(스크롤) */
function isScroll(){

	// [Scroll - Lib & Function Collection] 초기 세팅 - Lib & Function Collection
	// [Set - Function] 세팅 - Function
	setHeaderFixed(); // 헤더 Fixed
	setScrollState(); // 스크롤 상태 값
}

/* // () => [DEFAULT FUNCTION SETTING END] 기본 실행 함수(필수 함수) 종료 */



/* ========================================
= [FUNCTION SET COLLECTION] 함수 모음(내부사용)
= Description: Function Set Collection
======================================== */

/* [Function Set - Scroll Reset Normal] 내부 사용 -  Scroll Reset Normal(새로고침 시 스크롤 탑) */
function scrollResetBasic() {
	if ('scrollRestoration' in history) {
		history.scrollRestoration = 'manual';
	}
	window.scrollTo(0, 0);
}

/* [Function Set - Scroll Reset Lib Leins] 내부 사용 - Scroll Reset Lib Leins(라이브러리 사용) */
function scrollResetWithLenis(stopAfter = false) {
	if ('scrollRestoration' in history) {
		history.scrollRestoration = 'manual';
	}

	if (!window.lenis) {
		scrollResetBasic();
		return;
	}

	window.lenis.start();
	ScrollTrigger.refresh();

	requestAnimationFrame(() => {
		requestAnimationFrame(() => {
			window.lenis.scrollTo(0, {
				immediate: true,
				force: true,
			});

			if (stopAfter) window.lenis.stop();
		});
	});
}
/* [Function Set - View Port Size] 내부 사용 - View Port Size Event(뷰 사이즈) */
function setViewPort() {

	// [View Port - Height] 뷰 사이즈 - Height
	const vh = window.innerHeight * 0.01;
	document.documentElement.style.setProperty("--vh", `${vh}px`);
	
	// [View Port - Device] 뷰 사이즈 - Device(사이즈 따른 디바이스 클래스)
	const userAgent = navigator.userAgent.toLowerCase();
	const body 		= document.body.classList;
	const wW 		= window.innerWidth;

	body.remove("is-desktop", "is-tablet", "is-mobile");

	// [Device - Touch] 디바이스 - Touch(터치 기반)
	const isTouchDevice =
		/(tablet|ipad|playbook|silk)|(android(?!.*mobile))/i.test(userAgent) ||
		/Mobile/i.test(userAgent) ||
		navigator.maxTouchPoints > 0;

	if (wW <= 767){ 						// 모바일
		body.add("is-mobile");
	}else if (wW <= 1024){	// 테블릿
		body.add("is-tablet");
	}else{									// 데스크탑
		body.add("is-desktop")
	}
}

/* [Function Set - Header Fixed] 내부 사용 - Header Fixedt(헤더 고정) */
function setHeaderFixed() {
	const st = $(window).scrollTop();

	const header 		= $("#header");
	const headerHeight 	= header.outerHeight();

	if (st > 0) {
		header.addClass("fixed");
	} else {
		header.removeClass("fixed");
	}
}

/* [Function Set - Mobile Depth Block] 내부 사용 - Mobile Depth Block(모바일 뎁스 링크 이동 방지) */
function setBindDepth(){ 
	const wW 	= $(window).outerWidth();
	let $tablet = 1025; // 테블릿

	// 기존 이벤트 해제
	$(document).off("click.depthMenu", "#nav .depth-1");
	if (wW < $tablet) {
		// 모바일일 때만 .depth-1 링크 막고 토글
		$(document).on("click.depthMenu", "#nav .depth-1", function (e) {
			e.preventDefault(); // depth-1 링크 이동 막음

			const parentLi = $(this).closest("li");
			$("#nav .depth-1").closest("li").not(parentLi).removeClass("current");
			parentLi.toggleClass("current");
		});
	}
}

/* [Function Set - Scroll State] 내부 사용 - Scroll State(현재 스크롤 상태) */
let lastScrollTop = 0;
function setScrollState(){
	const st 	= $(window).scrollTop();
	const delta = 80; // 스크롤된 높이값
	const hasMain = $("#content.main").length > 0;

	$("body").toggleClass("scroll-has", st > 0);
	$("body").toggleClass( "scroll-end", st >= $(document).height() - $(window).height());

	if (hasMain) {
		const mains = 0;

		if (st > lastScrollTop) {
			// 스크롤 DOWN: mains 이상일 때만
			if ((st - lastScrollTop) > mains) {
				$("body").addClass("scroll-down").removeClass("scroll-up");
				lastScrollTop = st;
			}
		} else if (st < lastScrollTop) {
			// 스크롤 UP: 즉시
			$("body").addClass("scroll-up").removeClass("scroll-down");
			lastScrollTop = st;
		}

		return; // === main 로직 끝 ===
	}

	if (Math.abs(lastScrollTop - st) > delta) {
		if (st > lastScrollTop && lastScrollTop > 0) {
			$("body").addClass("scroll-down").removeClass("scroll-up");
		} else {
			$("body").addClass("scroll-up").removeClass("scroll-down");
		}
		lastScrollTop = st;
	}

}

/* [Function Set - Mobile Orientation Leload] 내부 사용 - Mobile Orientation Leload(모바일 회전 감지 후 새로고침 함수) */
function isRealMobileOrTablet() {
	const ua = navigator.userAgent;

	// 모바일 / 태블릿 UA
	const isMobileUA = /Android|iPhone|iPad|iPod|Tablet|Mobile/i.test(ua);

	// iPadOS 13+ (Mac처럼 보이는 iPad)
	const isIPad =
		/iPad/.test(ua) ||
		(/Macintosh/.test(ua) && navigator.maxTouchPoints > 1);

	// 터치 지원
	const isTouch = navigator.maxTouchPoints > 0;

	// 입력 방식
	const isCoarsePointer = window.matchMedia('(pointer: coarse)').matches;
	const hasNoHover = window.matchMedia('(hover: none)').matches;

	// ✅ 일반 모바일 (폰, 태블릿)
	if (isMobileUA && isTouch && isCoarsePointer) return true;

	// ✅ iPad (Pro 포함, 키보드/트랙패드 예외 처리)
	if (isIPad && isTouch && hasNoHover) return true;

	return false;
}
function setrefreshOnOrientationChange(delay = 200) {

	// === 모바일 / 태블릿(아이패드 포함) 판별 ===
	if (!isRealMobileOrTablet()) {
		$('.device-area').remove();
		return;
	}

	let lastOrientation =
		window.innerWidth > window.innerHeight ? 'landscape' : 'portrait';

	let resizeTimer;

	const checkOrientation = () => {
		const currentOrientation =
		window.innerWidth > window.innerHeight ? 'landscape' : 'portrait';

		if (currentOrientation !== lastOrientation) {
		lastOrientation = currentOrientation;

		location.reload();

		if (window.lenis) {
			window.lenis.stop();
			window.lenis.start();
		}
		}
	};

	// iOS / iPadOS 안정적인 방식 → resize 사용
	$(window).on('resize', function () {
		clearTimeout(resizeTimer);
		resizeTimer = setTimeout(checkOrientation, delay);
	});

	// === 가로모드일 때 오버레이 ===
	if (window.innerWidth > window.innerHeight) {
		$('body').append(`
		<div class="device-area">
			<div id="deviceRotate" class="device-rotate glass-box">
			<span>
				<i class="ico"></i>
				<span> 더 쾌적한 환경을 위해 휴대폰/태블릿을 세로로 봐주세요. </span>
			</span>
			<div class="img-wrap">
				<img src="../@resource/images/@common/logo.svg" alt="IDEA Pharmaceutical">
			</div>
			</div>
		</div>
		`);

		setTimeout(() => {
			
			$('.device-area').addClass('device-landscape');
		}, 100);
	}
}


/* // () => [FUNCTION SET COLLECTION END] Set 함수 모음 종료 */



/* ========================================
= [EVENT FUNCTION SETTING] 이벤트 함수
= Description: Event Function Settings Collection
======================================== */

/* [Event - GNB Current] 이벤트 - GNB Current(메뉴 뎁스 체크) */
function isCurrent (dep1, dep2) {
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
}

/* [Event - Navi On/Off] 이벤트 - Navi On/Off(메뉴 온/오프) */
function isNavOpen(){ // 메뉴 열기
	if(window.lenis) window.lenis.stop();
	$('body').addClass("opened-nav");	
}
function isNavClose(){ // 메뉴 닫기
	if(window.lenis) {
		window.lenis.start()
		requestAnimationFrame(() => {
        	updateScrollbarThumb();
    	});
	};
	$('body').removeClass("opened-nav");
}

/* [Event - Popup On/Off] 이벤트 - Popup On/Off(팝업 온/오프) */
function isPopupOpen(item){ // 팝업 열기
	const count = parseInt($('body').data('modalCount') || 0);
	$('body').data('modalCount', count + 1);

	if (window.lenis) window.lenis.stop();
	$(item).addClass('active');
	$('body').addClass('modal-opened');
}
function isPopupClose(item){ // 팝업 닫기
	const count = parseInt($('body').data('modalCount') || 0);
	const next  = Math.max(0, count - 1);
	$('body').data('modalCount', next);

	if (window.lenis && next === 0){ 
		window.lenis.start();
		requestAnimationFrame(() => {
        	updateScrollbarThumb();
    	});
	}
	$(item).removeClass('active');

	if (next === 0) $('body').removeClass('modal-opened');
}

/* [Event - Accordion & Tabs] 이벤트 - Accordion & Tabs(아코디언 & 탭 온/오프) */
function isAccordion(event){ // 아코디언
	let accBtn = $('.accordion-header');
	accBtn.on('click', function(e){
		e.preventDefault();
		if(event == 1){ // 1개씩 노출 될 때
			accBtn.parents('.accordion-area').removeClass('active');
			$(this).parents('.accordion-area').addClass('active');
		}
		if(event == 2){ // 1개 이상 노출 될 때
			$(this).parents('.accordion-area').toggleClass('active');
		}
	});
}
function isTab(){ // 탭
	let tabs = $('.tabs li a');
	let tabsContent = $('.tab-content');

	tabs.eq(0).parent('li').addClass('current');
	tabsContent.eq(0).addClass('active');

	tabs.on('click', function(e) {
		e.preventDefault();
		let THIS = $(this).attr('href'); // href 값
		
		/*** 탭 콘텐츠 부분 ***/
		tabsContent.removeClass('active'); // 탭 콘텐츠 모두 초기화
		$(THIS).addClass('active'); // 선택 된 탭 href = id 동일한 해당 콘텐츠만 active

		/*** 탭 부분 ***/
		tabs.parent('li').removeClass('current'); // 탭 부모 li current 초기화
		$(this).parent('li').addClass('current'); // 선택된 탭 부모 li current 표시
	});
}

function isTabCustom(item){ // 탭
	const tabCustom = $(item);
	let tabsCustom = tabCustom.find('.tabs:not(.sub) li a');
	let tabsContentCustom = tabCustom.find('.tab-content:not(.sub)');

	tabsCustom.eq(0).parent('li').addClass('current');
	tabsContentCustom.eq(0).addClass('active');

	tabsCustom.on('click', function(e) {
		e.preventDefault();
		let THIS = $(this).attr('href'); // href 값
		
		/*** 탭 콘텐츠 부분 ***/
		tabsContentCustom.removeClass('active'); // 탭 콘텐츠 모두 초기화
		$(THIS).addClass('active'); // 선택 된 탭 href = id 동일한 해당 콘텐츠만 active

		/*** 탭 부분 ***/
		tabsCustom.parent('li').removeClass('current'); // 탭 부모 li current 초기화
		$(this).parent('li').addClass('current'); // 선택된 탭 부모 li current 표시

		// ✅ [추가] 바깥 탭 전환 시 서브탭 리셋
		// 활성화된 콘텐츠 안의 서브탭만 초기화
		resetSubTab(tabCustom.find(THIS));
	});
}

function isPopTabDepth2(item){ // 탭
	const tabCustom = $(item);
	let tabsCustom = tabCustom.find('.tabs.sub li a');
	let tabsContentCustom = tabCustom.find('.tab-content.sub');

	tabsCustom.eq(0).parent('li').addClass('current');
	tabsContentCustom.eq(0).addClass('active');

	tabsCustom.on('click', function(e) {
		e.preventDefault();
		let THIS = $(this).attr('href'); // href 값
		
		/*** 탭 콘텐츠 부분 ***/
		tabsContentCustom.removeClass('active'); // 탭 콘텐츠 모두 초기화
		$(THIS).addClass('active'); // 선택 된 탭 href = id 동일한 해당 콘텐츠만 active

		/*** 탭 부분 ***/
		tabsCustom.parent('li').removeClass('current'); // 탭 부모 li current 초기화
		$(this).parent('li').addClass('current'); // 선택된 탭 부모 li current 표시
	});
}

// ✅ 서브탭 리셋 공통 함수
function resetSubTab(activeContent) {
	const subTabs     = activeContent.find('.tabs.sub li a');
	const subContents = activeContent.find('.tab-content.sub');

	if (!subTabs.length) return;

	// 전체 초기화 → 첫 번째만 active
	subTabs.parent('li').removeClass('current');
	subContents.removeClass('active');
	subTabs.eq(0).parent('li').addClass('current');
	subContents.eq(0).addClass('active');
}


/* [Event - Input MaxLength] 이벤트 - Input MaxLength(인풋 최대 길이) */
function isMaxlength(target, length){
	target.value = target.value.slice('0', length);
}

/* [Event - Clipboard Copy] 이벤트 - Clipboard Copy(클립보드 복사) */
function isCopyUrl(){ 							// URL 복사
	let href = window.location.href;

	if (location.protocol === 'https:') {
		navigator.clipboard.writeText(href)
		.then(() => alert('URL이 복사 되었습니다.'))
		.catch(err => alert('오류입니다.'));
	}else{
		let tempInput = document.createElement("input");
		tempInput.style = "position: absolute; left: -1000px; top: -1000px";
		tempInput.value = href;

		document.body.appendChild(tempInput);
		tempInput.select();
		document.execCommand("copy");
		alert("URL이 복사 되었습니다.");

		document.body.removeChild(tempInput);
	}
}
function isCopyTxt(item, alertTxt){ 			// 텍스트 복사
	let text = $(item).text();
	navigator.clipboard.writeText(text)
		.then(() => { alertTxt == "" ? alert('텍스트 복사 되었습니다.') : alert(`${alertTxt} 복사되었습니다.`) })
		.catch(err => alert('오류입니다.'));
}

/* [Event - Lib Selectric] 이벤트 - Lib Selectric(라이브러리 활용) */
function isSelectric(item, size){
	const sizes = ['xsmall', 'small', 'medium', 'large', 'xlarge'];
	$(item).selectric();
	if(sizes.includes(size)){
		$('.selectric').addClass(size);
	}
}

/* [Event - Scroll Top] 이벤트 - Scroll Top(스크롤 탑 버튼) */
function isTopBtn(target){
	const btn = document.getElementById(target);
	btn.addEventListener('click', function(e){
		e.preventDefault();
		window.scrollTo({top: 0, behavior: 'smooth'});
	});
}
/* () => [EVENT FUNCTION SETTING END] 이벤트 함수 종료 */




/* ========================================
= [GSAP & MOTIONS SETTING] GSAP & 모션 함수 세팅 
= Description: Gsap & Motions Script Function Settings
======================================== */

/* [GSAP & MOTIONS - GSAP Header Effect] GSAP & 모션 - GSAP Header Effect */
function headerGsap(){
	gsap.to('#header', {
		top: 0,
		duration: 1.8,
		ease: "power4.out",
	});
}


/* [GSAP & MOTIONS - GSAP Fade Up Effect]  GSAP & 모션 - GSAP Fade Up Effect */
function fadeUpGsap() {
	const fadeUp = document.querySelectorAll('[data-gsap="fade-up"]');

	fadeUp.forEach((item) => {
		// 초기 상태 세팅
		gsap.set(item, { y: 30, opacity: 0 });

		// 애니메이션
		gsap.to(item, {
			y: 0, opacity: 1,
			duration: 1.8, ease: "power4.out",
			scrollTrigger: {
				trigger: item,
				start: "top 90%",
				//toggleActions: "play none none reverse",
				//markers: true,
			},
		});
	});
}
function fadeUpMoGsap() {
	const fadeUp = document.querySelectorAll('[data-gsap="fade-up-mo"]');

	fadeUp.forEach((item) => {
		// 초기 상태 세팅
		gsap.set(item, { opacity: 0, y: 30 });

		// 애니메이션
		gsap.to(item, {
			opacity: 1,
			y: 0,
			duration: 1.8,
			ease: "power4.out",
			scrollTrigger: {
				trigger: item,
				start: "top 90%",
				//toggleActions: "play none none reverse",
				//markers: true,
			},
		});
	});
}


/* [GSAP & MOTIONS - GSAP Fade Up Effect]  GSAP & 모션 - GSAP Fade Up IMG Scale Effect */
function imgScaleGsap() {
	const fadeUp = document.querySelectorAll('[data-gsap="img-scale"]');

	fadeUp.forEach((item) => {
		// 초기 상태 세팅
		gsap.set(item, { scale: 1.2, });

		// 애니메이션
		gsap.to(item, {
			scale: 1,
			duration: 6, ease: "power4.out",
			scrollTrigger: {
				trigger: item,
				start: "top 90%",
				//toggleActions: "play none none reverse",
				//markers: true,
			},
		});
	});
}


/* 마퀴 */
function getMarqueeGap(el) {
    return parseFloat(
		getComputedStyle(el).getPropertyValue('--marquee-gap')
	) || 0;
}
function motionMarquee({ target, text, cnt, speed=6, }){

	let items = document.querySelector(target);
	if (!items) return; // 없으면 종료

	let count = cnt;
	for(let i = 0; i < count; i++){
		const marquee = document.createElement('span');
		marquee.className = 'text';
		marquee.innerText = text;
		items.appendChild(marquee);
	}

	let offset = 0;
	function isAnimate(){
		const inner = getMarqueeGap(items); // ✅ 여기서 항상 최신 값
		const limit = items.scrollWidth + inner;

		//offset ++;
		offset += speed;

		if (offset > limit / 2) {
			offset = 0;
			items.style.transform = 'translate3d(0,0,0)';
		} else {
			items.style.transform = `translate3d(${-offset}px,0,0)`;
		}
		requestAnimationFrame(isAnimate);
	}

	isAnimate();
}
function motionMarqueeDuo({ target, texts = [], cnt, speed = 6 }) {

    let items = document.querySelector(target);
    if (!items) return;

    // ✅ texts 배열로 교대로 삽입
    // ['텍스트A', '텍스트B'] → A B A B A B ...
    for (let i = 0; i < cnt; i++) {
        const marquee = document.createElement('span');
        marquee.className = 'text';
        marquee.innerText = texts[i % texts.length]; // ✅ 교대로 들어감
        items.appendChild(marquee);
    }

    let offset = 0;
    function isAnimate() {
        const inner = getMarqueeGap(items);
        const limit = items.scrollWidth + inner;

        offset += speed;

        if (offset > limit / 2) {
            offset = 0;
            items.style.transform = 'translate3d(0,0,0)';
        } else {
            items.style.transform = `translate3d(${-offset}px,0,0)`;
        }
        requestAnimationFrame(isAnimate);
    }

    isAnimate();
}



function motionImageMarquee({ container, speed = 1, autoFill = true, minClones = 2 }) {

	const wrap = document.querySelector(container);
	if (!wrap) return;

	const inner = wrap.querySelector('.img-inner');
	const mr = getMarqueeGap(inner);
	if (!inner) return;

	const items = [...inner.querySelectorAll('.maquee-img')];
	if (!items.length) return;

	const images = inner.querySelectorAll('img');

	Promise.all([...images].map(img => {
		if (img.complete) return Promise.resolve();
			return new Promise(resolve => {
			img.onload = resolve;
			img.onerror = resolve;
		});
	})).then(() => {

		// autoFill
		if (autoFill) {
		let cloneCount = 0;
			while (inner.scrollWidth < wrap.offsetWidth * minClones) {
				items.forEach(item => {
					inner.appendChild(item.cloneNode(true));
				});
				cloneCount++;
				if (cloneCount > 10) break;
			}
		}

		// 2세트 만들기
		const originalWidth = inner.scrollWidth + mr;
		inner.innerHTML += inner.innerHTML;

		let offset = 0;

		function animate() {

			offset += speed;

			if (offset >= originalWidth) {
				offset = 0;
			}

			inner.style.transform = `translate3d(${-offset}px,0,0)`;

			requestAnimationFrame(animate);
		}

		requestAnimationFrame(animate);

	});
}
/* // () => [GSAP & MOTION SETTING END] GSAP & 모션 함수 세팅 종료 */


//해상도 조절시 리사이즈
function initViewportReloadOnBreakpoint() {
	let resizeDelayId = null;
	let prevViewportWidth = window.innerWidth;

	const BREAKPOINTS = [375, 767, 1024, 1440];

	window.addEventListener('resize', () => {
		clearTimeout(resizeDelayId);

		resizeDelayId = setTimeout(() => {
			const currentViewportWidth = window.innerWidth;

			const isBreakpointChanged = BREAKPOINTS.some(bp =>
				(prevViewportWidth < bp && currentViewportWidth >= bp) ||
				(prevViewportWidth >= bp && currentViewportWidth < bp)
			);

			if (isBreakpointChanged) {
				window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
				window.location.reload();
			}

			prevViewportWidth = currentViewportWidth;
		}, 300);
	});
}

// 실행
initViewportReloadOnBreakpoint();