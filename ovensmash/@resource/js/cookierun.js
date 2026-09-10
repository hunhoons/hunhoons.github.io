$(function(){
	/* [Init] - 초기화 */
	isInit();

	/* [Event] - 이벤트 */
	window.addEventListener("resize", isResize);  					// Resize (리사이즈)
	window.addEventListener("scroll", isScroll);  					// Scroll (스크롤)
	window.addEventListener("orientationchange", insetViewPort);	// Orientationchange (방향전환)
});

/* [JS] (Layout Include Module) */
/* Description: 레이아웃 인클루드 */
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
/* // [JS] 레이아웃 인클루드 종료 */



/* [JS] (Function Module) */
/* Description: 초기 실행 함수 */

/* {Initial} - 로드 */
function isInit(){

	/* <Header Event> - 헤더 이벤트 */
	$(document).on("click", "#header .btn.menu", function(){ 	// Class Opened Nav로 On/Off
		$("body").toggleClass("opened-nav");
	});
	$(document).on("click", "#header .btn.global", function(){ 	// Class Opened Nav로 On/Off
		$("#header .btn.global").closest('.lang-wrap').toggleClass("active");
	});

	/* <Nav Event> - 네비 이벤트 */
	$(document).on("mouseenter", "#nav ul", function(){ 			// 마우스 인
		$("#header").addClass("nav-open");
	});
	$(document).on("mouseleave", "#nav ul", function(){ 			// 마우스 아웃
		$("#header").removeClass("nav-open")
	});

	$(document).on("click", "#btnTop", function(e){ // 마우스 아웃
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


	/* <AOS Lib> - 모션 라이브러리 */
	// AOS.init({
	// 	duration: 800,  						// 애니메이션 지속 시간 (밀리초)
	// 	easing: 'ease-out',  					// 애니메이션의 이징 함수
	// 	disableMutationObserver: false,
	// });
	// AOS.refresh(); 								// 재계산

	/* <Lenis Scroll Lib> - Lenis Scroll 라이브러리  */
	function isMobileDevice() {
		return (
			window.innerWidth <= 1024 || 
			/Mobi|Android/i.test(navigator.userAgent)
		);
	}
	const isMobile = isMobileDevice();

	window.lenis = new Lenis({
		lerp: isMobile ? 1 : 0.09,
		smoothTouch: isMobile ? false : true,
		syncTouchLerp: 0.075,       // 터치 관성 보간
		wheelMultiplier: 0.7,       // 휠 민감도 (0.6~0.8 실무 안정)
		touchMultiplier: 1,
		gestureOrientation: "vertical",
		autoResize: true,	
	});

	window.lenis.on('scroll', ScrollTrigger.update);

	gsap.ticker.add((time) => {
		window.lenis.raf(time * 1000);
	});

	gsap.ticker.lagSmoothing(0);

	/* <Setting Function> - 초기 세팅 */
	insetViewPort(); 							// 뷰 사이즈(높이, 디바이스 체크)
	insetBindDepth();							// 모바일 A Tag 클릭 방지
	insetRefreshOrientation(100); 				// 가로모드 체크

	isScroll(); 								// 스크롤 함수
	insetViewportReloadOnBreakpoint(); 			// 페이지 리로드
	
	//initElasticCursor({ speed: 0.15 }); 		// 커서


}
/* // {Initial} 로드 종료 */

/* {Resize} - 리사이징 */
function isResize(){

	let $tablet = 1023; // 테블릿 

	// 리사이즈: GNB On/Off Evnet
	if ($(window).outerWidth() <= $tablet) {
		$("body").removeClass("opened-nav");
		$("#nav .depth-1").closest("li").removeClass("current");
	}

	// 기본세팅: AOS Lib
	//AOS.refresh(); 					// 재계산

	// 기본세팅: Set Event Function
	insetViewPort(); 				// 뷰 사이즈(높이, 디바이스 체크)
	insetBindDepth();				// 모바일 A Tag 클릭 방지
}
/* // {Resize} 리사이징 종료 */

/* {Scroll } - 스크롤 */
function isScroll(){

	// 기본세팅: Set Event Function
	insetHeadFixed(); 				// 헤더 Fixed
	insetScrollState(); 			// 스크롤 상태 값
}
/* // {Scroll} 스크롤 종료 */
/* // [JS] 초기 실행 함수 종료 */



/* [JS - Initial] (Private) */
/* Description: 브라우저 실행 초기 함수 */

/* <View Port> - 뷰 포트 */
function insetViewPort() {

	// 뷰사이즈: View Port Height(높이값 구하기)
	const vh = window.innerHeight * 0.01;
	document.documentElement.style.setProperty("--vh", `${vh}px`);

	// 뷰사이즈: Device Check ClassList Add/Remove
	const userAgent = navigator.userAgent.toLowerCase();
	const body 		= document.body.classList;
	const wW 		= window.innerWidth;

	const isTouchDevice =
		/(tablet|ipad|playbook|silk)|(android(?!.*mobile))/i.test(userAgent) ||
		/Mobile/i.test(userAgent) ||
		navigator.maxTouchPoints > 0;

	body.remove("is-desktop", "is-tablet", "is-mobile", "is-touch");
	if (wW <= 767){ 						// 모바일
		body.add("is-mobile", "is-touch");
	}else if (wW <= 1024){		// 테블릿
		body.add("is-tablet", "is-touch");
	}else{									// 데스크탑
		body.add("is-desktop")
	}
}

/* <Header Fixed> - 헤더 고정 */
function insetHeadFixed(){
	const st 		= $(window).scrollTop();

	const header 	= $("#header");
	const hHeight 	= header.outerHeight();
	if (st > hHeight) {
		header.addClass("fixed");
	} else {
		header.removeClass("fixed");
	}
}

/* <Mobile Depth Block>  모바일 1뎁스 링크 이동 막기 */
function insetBindDepth(){

	function isMobileDeviceDepth() {
		return (
			window.innerWidth <= 1024
		);
	}
	const isMobileDepth = isMobileDeviceDepth();

	

	// 기존 이벤트 해제
	$(document).off("click.depthMenu", "#nav .depth-1");
	if (isMobileDepth) {
		// 모바일일 때만 .depth-1 링크 막고 토글
		$(document).on("click.depthMenu", "#nav .depth-1", function (e) {
			e.preventDefault(); // depth-1 링크 이동 막음

			const parentLi = $(this).closest("li");
			$("#nav .depth-1").closest("li").not(parentLi).removeClass("current");
			parentLi.toggleClass("current");
		});
	}

	$(document).off('click.noteBtn', '#header .btn.note');
	$(document).on('click.noteBtn', '#header .btn.note', function (e) {
		if (!isMobileDepth) {
			// ✅ PC : 링크 이동 막고 메시지 토글
			e.preventDefault();
			$(this).siblings('.message-wrap').toggleClass('active');
		}
		// 모바일 : href 그대로 이동 (preventDefault 안 함)
	});

}

/* <Scroll State> - 현재 스크롤 상태 */
let lastScrollTop = 0;
function insetScrollState(){
	const st 	= $(window).scrollTop();
	const delta = 80; // 스크롤된 높이값

	$("body").toggleClass("scroll-has", st > 0);
	$("body").toggleClass( "scroll-end", st >= $(document).height() - $(window).height());

	if (Math.abs(lastScrollTop - st) > delta) {
		if (st > lastScrollTop && lastScrollTop > 0) {
			$("body").addClass("scroll-down").removeClass("scroll-up");
		} else {
			$("body").addClass("scroll-up").removeClass("scroll-down");
		}
		lastScrollTop = st;
	}

	
	const scrollBottom = $(document).height() - $(window).height() - $(window).scrollTop();
	const foot = $('#footer').outerHeight(); // 더 안전

	if (scrollBottom <= foot) {
		$('.button-area.scrolltop').css('bottom', `${foot + 28}px`)
	} else {
		$('.button-area.scrolltop').css('bottom', `28px`)
	}

}

/* <Viewport Reload> - 페이지 리로드 */
function insetViewportReloadOnBreakpoint() {
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

/* <Orientation> - 가로모드 체크 */
function isLandscapeBlocked() {
	return (
		window.matchMedia('(orientation: landscape)').matches &&
		window.innerWidth <= 1024 &&
		window.matchMedia('(pointer: coarse)').matches
	);
}
function insetRefreshOrientation(delay = 200) {
	let timer;

	const body = document.body;
	const month = new Date().getMonth() + 1;
	const seasonIndex = getSeasonIndex(month);

	const showLayer = () => {
		if (document.getElementById('deviceMode')) return;

		const wrapper = document.createElement('div');
		wrapper.id = 'deviceMode';
		wrapper.className = 'device-mode';
		wrapper.innerHTML = `
			<ul>
				<li>
					<div class="device-box">
						<i class="ico"></i>
						<p>
							<span>쾌적한 환경을 위해 <br> 세로로 봐주세요.</span>
						</p>
					</div>
				</li>
				<li class="device-bg device-0${seasonIndex}"></li>
			</ul>
		`;

		body.appendChild(wrapper);

		requestAnimationFrame(() => {
			wrapper.classList.add('active');
		});

		window.lenis?.stop();
	};

	const hideLayer = () => {
		document.getElementById('deviceMode')?.remove();
		window.lenis?.start();
	};

	const check = () => {
		isLandscapeBlocked() ? showLayer() : hideLayer();
	};

	window.addEventListener('resize', () => {
		clearTimeout(timer);
		timer = setTimeout(check, delay);
	});

	window.addEventListener('orientationchange', check);

	check();
}
function getSeasonIndex(month) {
	if (month >= 3 && month <= 5) return 0;
	if (month >= 6 && month <= 8) return 1;
	if (month >= 9 && month <= 11) return 2;
	return 3;
}

/* <Cursor> - 커서 */
function initElasticCursor(options = {}) {

	// 모바일(터치)에서는 실행 안 함 (선택)
	if (!window.matchMedia('(pointer: fine)').matches) return;

	const speed = options.speed ?? 0.17;

	// 1️⃣ 기존 요소 확인
	let circleElement = document.querySelector('.cursor');

	// 2️⃣ 없으면 생성
	if (!circleElement) {
		circleElement = document.createElement('div');
		circleElement.className = 'cursor';
		document.body.appendChild(circleElement);
	}

	// 그래도 없으면 종료 (안전 처리)
	if (!circleElement) return;

	const mouse = { x: 0, y: 0 };
	const previousMouse = { x: 0, y: 0 };
	const circle = { x: 0, y: 0 };

	let currentScale = 0;
	let currentAngle = 0;
	let rafId;

	const handleMouseMove = (e) => {
		mouse.x = e.clientX;
		mouse.y = e.clientY;
	};

	window.addEventListener('mousemove', handleMouseMove);

	const tick = () => {

		circle.x += (mouse.x - circle.x) * speed;
		circle.y += (mouse.y - circle.y) * speed;

		const translateTransform = `translate3d(${circle.x}px, ${circle.y}px, 0)`;

		const deltaMouseX = mouse.x - previousMouse.x;
		const deltaMouseY = mouse.y - previousMouse.y;

		previousMouse.x = mouse.x;
		previousMouse.y = mouse.y;

		const mouseVelocity = Math.min(
		Math.sqrt(deltaMouseX ** 2 + deltaMouseY ** 2) * 4,
		150
		);

		const scaleValue = (mouseVelocity / 150) * 0.5;
		currentScale += (scaleValue - currentScale) * speed;

		const scaleTransform = `scale(${1 + currentScale}, ${1 - currentScale})`;

		const angle = Math.atan2(deltaMouseY, deltaMouseX) * 180 / Math.PI;
		if (mouseVelocity > 20) currentAngle = angle;

		const rotateTransform = `rotate(${currentAngle}deg)`;

		circleElement.style.transform =
		`${translateTransform} ${rotateTransform} ${scaleTransform}`;

		rafId = requestAnimationFrame(tick);
	};

	tick();

	// 🔥 필요 시 제거 가능하도록 반환
	return {
		destroy() {
		cancelAnimationFrame(rafId);
			window.removeEventListener('mousemove', handleMouseMove);
		}
	};
}
/* // [JS - Initial] 브라우저 실행 초기 함수 종료 */



/* [JS - Public] (Public) */
/* Description: 페이지 내 사용 함수 */

/* <Device> - 디바이스에 따른 변환 값 */
function isByDevice({ tablet, mobile, desktop }) {
	const $body = $('body');

	if ($body.hasClass('is-mobile')) return mobile;
	if ($body.hasClass('is-tablet')) return tablet;

	return desktop;
}


/* <Scroll Reset> - 스크롤 초기화 */
function isScrollReset(){
	if ('scrollRestoration' in history) {
		history.scrollRestoration = 'manual';
	}
	window.scrollTo(0, 0);
}

/* <Scroll Reset> - 스크롤 새로고침(Leins Lib) */
function isScrollResetLenis(stopAfter = false){
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

/* <Nav Current> - 메뉴 뎁스 */
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

/* <Navi On/Off> - 메뉴 온/오프 */
function isNavOpen(){ // 메뉴 열기
	if(window.lenis) window.lenis.stop();
	$('body').addClass("opened-nav");	
}
function isNavClose(){ // 메뉴 닫기
	if(window.lenis) window.lenis.start();
	$('body').removeClass("opened-nav");
}

/* <Popup On/Off> - 팝업 온/오프 */
function isPopupOpen(item){ // 팝업 열기
	if(window.lenis) window.lenis.stop();

	$(item).addClass('active');
	$('body').addClass("modal-opened");
}
function isPopupClose(item){ // 팝업 닫기
	if(window.lenis) window.lenis.start();

	$(item).removeClass('active');
	$('body').removeClass("modal-opened");
}

/* <Accordion> - 아코디언 */
function isAccordion(event){ 				// 아코디언
	let accBtn = $('.accordion-header');
	accBtn.on('click', function(e){
		e.preventDefault();
		const current = $(this).parents('.accordion-area');
		if(event == 1){ // 1개씩 노출 될 때
			accBtn.parents('.accordion-area')
			.not(current)
			.removeClass('active')
			.find('.accordion-content')
			.stop(true,true)
			.slideUp();

			current.toggleClass('active');
			current.find('.accordion-content')
			.stop(true,true)
			.slideToggle();
		}
		// if(event == 2){ // 1개 이상 노출 될 때
		// 	$(this).parents('.accordion-area').toggleClass('active');
		// }
	});
}

/* <TAB> - 탭 */
function isTab(){ 							// 탭
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

/* <Maxlength> - 인풋 최대 길이 */
function isMaxlength(target, length){
	target.value = target.value.slice('0', length);
}


/* <Clipboard> - 클립보드 복사 */
function isCopyUrl(){ 					// URL 복사
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
function isCopyTxt(item, alertTxt){ 	// 텍스트 복사
	let text = $(item).text().trim();
	navigator.clipboard.writeText(text)
		.then(() => { alertTxt == "" ? alert('텍스트 복사 되었습니다.') : alert(`${alertTxt} 복사되었습니다.`) })
		.catch(err => alert('오류입니다.'));
}

/* <Selectric Lib> - Selectric Lib(라이브러리) */
function isSelectric(item, size){
	const sizes = ['xsmall', 'small', 'medium', 'large', 'xlarge'];
	$(item).selectric();
	if(sizes.includes(size)){
		$('.selectric').addClass(size);
	}
}
function isSelect2(item, size, search){
	const sizes = ['xsmall', 'small', 'medium', 'large', 'xlarge'];
	if(search == 'on'){
		$(item).select2({
			dropdownParent: $(item).closest('.select-wrap'),
			dropdownCssClass: 'custom-dropdown-style',
			language: {
				noResults: function() {
				return '검색 결과가 없습니다.';
			}
		}
		});
		$(item).on('select2:open', function() {
			// 검색 input에 placeholder 적용
			$('.select2-search__field').attr('placeholder', 'Search');
		});
	}else{
		$(item).select2({
			dropdownParent: $(item).closest('.select-wrap'),
			dropdownCssClass: 'custom-dropdown-style',
			minimumResultsForSearch: Infinity,
		});
	}

	if(sizes.includes(size)){
		$('.select2').addClass(size);
	}
	
}

/* <Scroll Top> - 스크롤 탑 버튼 */
function isTopBtn(target){
	
}
/* // [JS - Public] 페이지 내 사용 함수 종료 */



/* [JS - Motions] (Interaction) */
/* Description: 모션 함수 */

/* <Header Effect GSAP> - 헤더 등장 모션 */
function headerGsap(){
	gsap.to('#header', {
		top: 0,
		duration: 1.5, ease: "power4.out",
	});
}

/* <Fade Up Effect GSAP> - 페이드 업 모션 */
function fadeUpGsap() {
	const fadeUp = document.querySelectorAll('[data-gsap="fade-up"]');
	fadeUp.forEach((item) => {
		// 초기 상태 세팅
		gsap.set(item, { y: 30, autoAlpha: 0 });

		// 애니메이션
		gsap.to(item, {
			y: 0, 
			autoAlpha: 1,
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

/* <IMG Scale Effect GSAP> - 이미지 스켈일업 모션 */
function scaleGsap() {
	const imgScale = document.querySelectorAll('[data-gsap="img-scale"]');
	imgScale.forEach((item) => {
		// 초기 상태 세팅
		gsap.set(item, { scale: 1.2,});

		// 애니메이션
		gsap.to(item, {
			scale: 1, 
			duration: 6, 
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

function scaleGsap2() {
	const imgScale = document.querySelectorAll('[data-gsap="img-scale2"]');
	imgScale.forEach((item) => {
		// 초기 상태 세팅
		gsap.set(item, { y: 10, scale: 0,});
		const tl = gsap.timeline({
			scrollTrigger:{
				trigger: item,
				start: "top 90%",
				//toggleActions: "play none none reverse",
				//markers: true,
			},
		});
		// 애니메이션
		tl.to(item, {
			scale: 1,
			y: 0,
			duration: 0.8,
			ease: "back.out(1.7)",
		});

		// 미세 바운스 반복
		tl.to(item, {
			y: -10,
			repeat: -1, // 무한 반복
			yoyo: true,
			duration: 1.2,
			ease: "sine.inOut",
			delay: item * 0.15
		});
	});
}

/* <Marquee> - 무한 루프 텍스트 */
function getMarqueeGap(el) {
    return parseFloat(
		getComputedStyle(el).getPropertyValue('--marquee-gap')
	) || 0;
}
function motionMarquee({ target, text, cnt, speed=2, }){

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

	// EX) 예시
	/* 
		motionMarquee({
			target      : '.marquee .inner',
			text        : 'TEXT',
			speed       : 2,
			cnt         : 20,
		}); 
	*/
}

/* <Marquee> - 무한 루프 이미지 */
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

	// EX) 예시
	/* 
		otionImageMarquee({
			container: '.maquee-images',
			speed: 1.5,
			autoFill: true,
			minClones: 2
		});
	*/
}

/* <Swiper Clone> - 스와이퍼 루프 복제 */
function cloneSwiperSlides(swiperEl) {
	const wrapper = swiperEl.querySelector('.swiper-wrapper');
	// ✅ loop 복제본 제외하고 원본만 가져오기
	const originalSlides = Array.from(
		wrapper.querySelectorAll('.swiper-slide:not(.swiper-slide-duplicate)')
	);
	const count = originalSlides.length;

	// 목표 개수 설정
	let targetCount;
	if (count === 1)      targetCount = 8;
	else if (count === 2) targetCount = 7;
	else if (count === 3) targetCount = 6; // 3개도 loop 안정화를 위해 권장
	else return; // 4개 이상은 복제 불필요

	// 목표 개수까지 순환 복제
	let i = 0;
	while (wrapper.querySelectorAll('.swiper-slide').length < targetCount) {
		const clone = originalSlides[i % count].cloneNode(true);
		clone.setAttribute('aria-hidden', 'true'); // ✅ 접근성 처리
		clone.classList.add('is-cloned');          // ✅ 복제본 식별용 클래스
		wrapper.appendChild(clone);
		i++;
	}

  	//console.log(`슬라이드 복제 완료 : ${count}개 → ${targetCount}개`);
}
/* // [JS - Motions] 모션 함수 종료 */

// 바이트 체크
function fn_checkByte(obj, byte){
	const maxByte = byte;
	const text_val = obj.value;
	const text_len = text_val.length;

	let totalByte = 0;

	for(let i = 0; i < text_len; i++){
		const charCode = text_val.charCodeAt(i);

		// 한글 / 유니코드
		if(charCode > 128){
			totalByte += 2;
		}else{
			totalByte += 1;
		}
	}

	document.getElementById("nowByte").innerText = totalByte;

	if(totalByte > maxByte){
		alert(`최대 ${byte}Byte까지만 입력가능합니다.`);
	}
}

function fn_loadByte(target,byte){
	const textarea = document.querySelector(target);

	if(!textarea) return;

	// 최초 로드 시 바이트 계산
	fn_checkByte(textarea, byte);

	// 입력할 때마다 체크
	textarea.addEventListener("input", function(){
		fn_checkByte(this, byte);
	});
}



