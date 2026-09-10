$(function(){
	// Const () => [JS Init] JS 초기화
	isInit();

	// Const () => [Resize & Scroll Event] 리사이즈 & 스크롤 이벤트
	window.addEventListener("resize", isResize);
	window.addEventListener("scroll", isScroll);
	window.addEventListener("orientationchange", setViewPort);

});


/* ========================================
[Init Script & Function] 즉시 실행 함수
======================================== */

/* [Layout Include] 레이아웃 인클루드 함수 */
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
// [Layout Include End] 레이아웃 인클루드 함수 종료


/* [Init] 초기 세팅 */
function isInit() {
	
	// Const () => [Init Common] 초기화 공통
	let $tablet = 1023; // 테블릿
	let $mobile = 767; // 모바일


	// Const () => [GNB On/Off Event] 메뉴 온/오프 이벤트
	$(document).on("click", "#header .btn.menu", function(){
		
		// opened-nav 로 네비 체크
		$("body").toggleClass("opened-nav"); 

		// Lenis Scroll Lib 사용으로 인한 체크
		$("body").hasClass('opened-nav') ? 
		window.lenis.stop() // Overflow : hidden
		: window.lenis.start(); // Overflow : auto
	});


	// Const () => [GNB Mouse In/Out Event] 메뉴 마우스인/아웃 이벤트
	$(document).on("mouseenter", "#nav", function(){ // 마우스인
		$("#header").addClass("nav-open");
	});
	$(document).on("mouseleave", "#nav", function(){ // 마우스아웃
		$("#header").removeClass("nav-open")
	});


	// Const () => [Global Click Event] 글로벌 클릭 이벤트
	$(document).on("click", '#header .btn.lang', function(){
		$(this).toggleClass('active');	
	});


	// Const () => [Lib & Function] 라이브러이 함수 모음
	// AOS Lib
	AOS.init({
		duration: 800,  // 애니메이션 지속 시간 (밀리초)
		easing: 'ease-out',  // 애니메이션의 이징 함수
		disableMutationObserver: false
	});
	AOS.refresh();

	// Leins Lib 전역 변수 사용
	function isMobileDevice() {
		return window.innerWidth <= 1024 || /Mobi|Android/i.test(navigator.userAgent);
	}
	window.lenis = new Lenis({
		duration: isMobileDevice() ? 1.05 : 1,
		easing: t => t*(2-t),
		smoothTouch: 0.2,
		touchMultiplier: 1.2,
	});
	window.lenis.on('scroll', ScrollTrigger.update);

	function raf(time) {
		window.lenis.raf(time);
		requestAnimationFrame(raf);
	}
	requestAnimationFrame(raf);

	
	// Set, is Funtion Ares
	setViewPort(); 		// 높이값
	setBindDepth(); 	// 모바일 A Tag 클릭 방지
	setrefreshOnOrientationChange(100);


	//isDeviceRotate(); // 모바일 가로모드 체크
	isScroll(); 		// 스크롤 함수

}
// [Init End] 초기 세팅 종료


/* [Resize] 리사이즈 */
function isResize(){
	let $tablet = 1023; // 테블릿

	// Const () => [Resizing Menu Current Close] 리사이즈 시 메뉴 및 Current 닫기
	if ($(window).outerWidth() <= $tablet) {
		$("body").removeClass("opened-nav");
		$("#gnb .depth-1").closest("li").removeClass("current");
	}


	// Const () => [Lib & Function] 라이브러이 함수 모음
	// AOS Lib Refresh
	AOS.refresh();

	// Set, is Funtion Ares
	setViewPort(); 		// 높이값
	setBindDepth(); 	// 모바일 A Tag 클릭 방지
	setrefreshOnOrientationChange(100)
}
// [Resize End] 리사이즈 종료


/* [Scroll] 스크롤 */
function isScroll(){

	// Const () => [Set Funtion Ares] Set 함수 모음
	setHeaderFixed();	// 헤더 fixed/sticky
	setScrollState();	// 스크롤 업/다운
}
// [Scroll End] 스크롤 종료
/* // [Init Script & Function End] 즉시 실행 함수 종료 */



/* ========================================
[Setting Function Area] 함수 세팅 모음 (내부 사용)
======================================== */

/* [Window Reload] 새로고침 시 상단 */
function setLenisScrollReset (stopAfter = false) {
	if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
	if (!window.lenis) return;

	window.lenis.start();
	window.scrollTo(0, 0);
	ScrollTrigger.addEventListener('refresh', () => {
		setTimeout(() => {
			window.lenis.scrollTo(0, { immediate: true });
			window.scrollTo(0, 0);
			
			if (stopAfter) window.lenis.stop();
		}, 150);
	});
	setTimeout(() => ScrollTrigger.refresh(), 400);
};
// [Window Reload End] 새로고침 시 상단 종료


/* [View Port Size Event] 뷰 포트 사이즈 이벤트 */
function setViewPort() {

	// () => [View Port Height] 높이값 설정
	const vh = window.innerHeight * 0.01;
	document.documentElement.style.setProperty("--vh", `${vh}px`);


	// () => [View Port Width Deivce Class] 가로 사이즈에 따른 디바이스 클래스
	const userAgent = navigator.userAgent.toLowerCase();
	const body = document.body.classList;
	const w = window.innerWidth;
	body.remove("is-pc", "is-tablet", "is-mobile");

	// 터치 기반
	const isTouchDevice =
		/(tablet|ipad|playbook|silk)|(android(?!.*mobile))/i.test(userAgent) ||
		/Mobile/i.test(userAgent) ||
		navigator.maxTouchPoints > 0;

	if (w <= 767){
		body.add("is-mobile");
	}else if (isTouchDevice || w <= 1023){
		body.add("is-tablet");
	}else{
		body.add("is-pc")
	}
}
// [View Port Size Event End] 뷰 포트 사이즈 이벤트 종료


/* [Header Fixed/Sticky Event] 헤더 고정 이벤트 */
function setHeaderFixed(type = 1) { // 

	const st = $(window).scrollTop();
	const header = $("#header");
	const headerHeight = header.outerHeight();

	if (st > headerHeight) {
		if (type === 1) header.addClass("fixed");
		if (type === 2) header.addClass("sticky");
	} else {
		header.removeClass("fixed sticky");
	}
}
// [Header Fixed/Sticky Event End] 헤더 고정 이벤트 종료


/* [Mobile Depth On/Off & A Tag Link Block] 모바일 뎁스 온/오프 & A 태그 링크 방지 */
function setBindDepth(){ 
	const wW = $(window).outerWidth();
	let $tablet = 1023; // 테블릿

	// 기존 이벤트 해제
	$(document).off("click.depthMenu", "#nav .depth-1:not(.contact)");
	if (wW <= $tablet) {
		// 모바일일 때만 .depth-1 링크 막고 토글
		$(document).on("click.depthMenu", "#nav .depth-1:not(.contact)", function (e) {
			e.preventDefault(); // depth-1 링크 이동 막음

			const parentLi = $(this).closest("li");
			$("#nav .depth-1:not(.contact)").closest("li").not(parentLi).removeClass("current");
			parentLi.toggleClass("current");
		});
	}
}
// [Mobile Depth On/Off & A Tag Link Block End] 모바일 뎁스 온/오프 & A 태그 링크 방지 종료


/* [Scroll State Class] 스크롤 상태 클래스 */
let lastScrollTop = 0;
function setScrollState(){
	
	const st = $(window).scrollTop();
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
}
// [Scroll State Class End] 스크롤 상태 클래스 종료


/* [Mobile Orientation Leload] 모바일 회전 감지 후 새로고침 함수 */
function setrefreshOnOrientationChange(delay = 200) {

	// === 실제 모바일/태블릿 + 터치 디바이스만 필터링 ===
	function isRealTouchMobileDevice() {
		const ua = navigator.userAgent;

		// 일반 모바일 / 태블릿 UA 체크
		const isMobileUA = /Android|iPhone|iPad|iPod|Tablet|Mobile/i.test(ua);

		// iPadOS 13+ (맥처럼 UA지만 터치 포인트가 존재)
		const isIPadOS = /Macintosh/.test(ua) && navigator.maxTouchPoints > 1;

		// 터치 지원
		const isTouch = navigator.maxTouchPoints > 0;

		return (isMobileUA && isTouch) || isIPadOS;
	}

	const isTouchDevice = isRealTouchMobileDevice();

	// 💡 모바일·태블릿 터치 디바이스가 아니면 차단
	if (!isTouchDevice) {
		$('.device-area').remove();
		return;
	}

	let lastOrientation = window.innerWidth > window.innerHeight ? 'landscape' : 'portrait';
	let resizeTimer;

	const checkOrientation = () => {
		const currentOrientation = window.innerWidth > window.innerHeight ? 'landscape' : 'portrait';
		if (currentOrientation !== lastOrientation) {
			lastOrientation = currentOrientation;

			location.reload();

			if (window.lenis) {
				window.lenis.stop();
				window.lenis.start();
			}
		}
	};

	// === 화면 회전 감지 ===
	$(window).on('resize', function () {
		clearTimeout(resizeTimer);
		resizeTimer = setTimeout(checkOrientation, delay);
	});

	// === 가로 모드일 때만 오버레이 노출 ===
	if (window.innerWidth > window.innerHeight) {
		let html = `
			<div class='device-area'>
				<div id="deviceRotate" class="device-rotate glass-box">
					<span>
						<i class="ico"></i>	
						<span> 더 쾌적한 환경을 위해 휴대폰/테블릿을 세로로 봐주세요. </span>
					</span>
					<div class="img-wrap">
						<img src="../@resource/images/@common/logo.svg" alt="IDEA Pharmaceutical">
					</div>
					<div class="liquid-effect"></div>
					<div class="liquid-tint"></div>
					<div class="liquid-shine"></div>
				</div>

				<svg style="display: none">
					<filter id="glass-distortion" filterUnits="objectBoundingBox" 
						x="0%" y="0%" width="100%" height="100%" >
						<feTurbulence type="fractalNoise" baseFrequency="0.01 0.01" 
							numOctaves="1" seed="5" result="turbulence" />
						<feComponentTransfer in="turbulence" result="mapped">
							<feFuncR type="gamma" amplitude="1" exponent="10" offset="0.5" />
							<feFuncG type="gamma" amplitude="0" exponent="1" offset="0" />
							<feFuncB type="gamma" amplitude="0" exponent="1" offset="0.5" />
						</feComponentTransfer>
						<feGaussianBlur in="turbulence" stdDeviation="3" result="softMap" />
						<feSpecularLighting in="softMap" surfaceScale="5" specularConstant="1"
							specularExponent="100" lighting-color="white" result="specLight" >
							<fePointLight x="-200" y="-200" z="300" />
						</feSpecularLighting>
						<feComposite in="specLight" operator="arithmetic"
							k1="0" k2="1" k3="1" k4="0" result="litImage" />
						<feDisplacementMap in="SourceGraphic" in2="softMap" scale="150"
							xChannelSelector="R" yChannelSelector="G" />
					</filter>
				</svg>
			</div>
		`;

		$('body').append(html);

		setTimeout(() => {
			$('.device-area').addClass('device-landscape');
		}, 100);
	}
}
// [Mobile Orientation Leload End] 모바일 회전 감지 후 새로고침 함수 종료
/* // [Setting Function Area End] 함수 세팅 모음 (내부사용) 종료 */



/* ========================================
[Common Function Script] 공통 함수 세팅 (외/내부 사용)
======================================== */

/* [GNB Current] 뎁스 Current */
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
// [GNB Current End] 뎁스 Current 종료


/* [Nav Open & Close] 메뉴 열기/닫기 */
function isNavOpen(){ // 메뉴 열기
	$('body').addClass("opened-nav");
	window.lenis.stop();
}

function isNavClose(){ // 메뉴 닫기
	$('body').removeClass("opened-nav");
	window.lenis.start();
}
// [Nav Open & Close End] 메뉴 열기/닫기 종료


/* [POPUP Open & Close] 팝업 열기/닫기 */
function isPopupOpen(item){ // 팝업 열기
	$(item).addClass('active');
	$('body').addClass("modal-opened");
	window.lenis.stop();
}
function isPopupClose(item){ // 팝업 닫기
	$(item).removeClass('active');
	$('body').removeClass("modal-opened");
	window.lenis.start();
}
// [POPUP Open & Close End] 팝업 열기/닫기 종료


/* [Accordion & Tabs] 아코디언 & 탭 온/오프 ***/
// function isAccordion(event){ // 아코디언
// 	let accBtn = $('.acc-btn');
// 	accBtn.on('click', function(e){
// 		e.preventDefault();
// 		if(event == 1){ // 1개씩 노출 될 때
// 			accBtn.parent('.acc-box').removeClass('active');
// 			$(this).parent('.acc-box').addClass('active');
// 		}
// 		if(event == 2){ // 1개 이상 노출 될 때
// 			$(this).parent('.acc-box').toggleClass('active');
// 		}
// 	});
// }
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
// [Accordion & Tabs End] 아코디언 & 탭 온/오프 종료


/* [Input MaxLength] 인풋 입력 길이 제어 */
function isMaxlength(target, length){
	target.value = target.value.slice('0', length);
}
// [Input MaxLength End] 인풋 입력 길이 제어 종료


/* [Clipboard Copy] 클립보드 복사 */
function isCopyUrl(){ 	// URL 복사
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
function isCopyTxt(item, alertTxt){ // 텍스트 복사
	let text = $(item).text();
	navigator.clipboard.writeText(text)
		.then(() => { alertTxt == "" ? alert('텍스트 복사 되었습니다.') : alert(`${alertTxt} 복사되었습니다.`) })
		.catch(err => alert('오류입니다.'));
}
// [Clipboard Copy End] 클립보드 복사 종료


/* [Selectric] 커스텀 셀렉트 박스 UI (Selectric 라이브러리 활용) */
// function isSelectric(item, size){
// 	const sizes = ['xsmall', 'small', 'medium', 'large', 'xlarge'];
// 	$(item).selectric();
// 	if(sizes.includes(size)){
// 		$('.selectric').addClass(size);
// 	}
// }
// [Selectric End] 커스텀 셀렉트 박스 UI (Selectric 라이브러리 활용) 종료


/* [Scroll Top Button] 스크롤 탑 버튼 */
// function isTopBtn(target){
// 	const btn = document.getElementById(target);
// 	btn.addEventListener('click', function(e){
// 		e.preventDefault();
// 		window.scrollTo({top: 0, behavior: 'smooth'});
// 	});
// }
// [Scroll Top Button End] 스크롤 탑 버튼 종료

function isGlassSvg(){
	const glass = `
		<div class="liquid-effect"></div>
		<div class="liquid-tint"></div>
		<div class="liquid-shine"></div>
	`;

	// 버튼
	const btnGlass = $('.btn.glass');
	if(btnGlass.length > 0){
		btnGlass.each( (idx, item) => {		
			$(item).append(glass);
		});
	}

	// 글라스 박스
	const boxGlass = $('.glass-boxed');
	if(boxGlass.length > 0){
		boxGlass.each( (idx, item) => {		
			$(item).append(glass);
		});
	}

	const glassSvg = `
		<!-- [Button Glass Svg] 글라스 효과를 위한 Svg 파일 -->
		<svg style="display: none">
				<filter id="glass-distortion" filterUnits="objectBoundingBox" 
						x="0%" y="0%" width="100%" height="100%" >
				<feTurbulence	type="fractalNoise" baseFrequency="0.01 0.01" 
								numOctaves="1"seed="5" result="turbulence" />
				<feComponentTransfer in="turbulence" result="mapped">
						<feFuncR type="gamma" amplitude="1" exponent="10" offset="0.5" />
						<feFuncG type="gamma" amplitude="0" exponent="1" offset="0" />
						<feFuncB type="gamma" amplitude="0" exponent="1" offset="0.5" />
				</feComponentTransfer>
				<feGaussianBlur in="turbulence" stdDeviation="3" result="softMap" />
				<feSpecularLighting in="softMap" surfaceScale="5" specularConstant="1"
									specularExponent="100" lighting-color="white" result="specLight" >
					<fePointLight x="-200" y="-200" z="300" />
				</feSpecularLighting>
				<feComposite	in="specLight" operator="arithmetic"
								k1="0" k2="1" k3="1" k4="0" result="litImage" />
				<feDisplacementMap	in="SourceGraphic" in2="softMap" scale="60"
									xChannelSelector="R" yChannelSelector="G" />
			</filter>
		</svg>
		<!-- // [Button Glass Svg] 글라스 효과를 위한 Svg 파일 -->
	`;
	if (document.getElementById('glass-distortion')) return;
	$('body').append(glassSvg);
}
/* // [Common Function Script End] 공통 함수 세팅 (외/내부 사용) 종료 */



/* ========================================
[GSAP & Motion Script] GSAP & 모션 함수
======================================== */

/* [Loop Marquee] 텍스트 무한 루프 */
// function loopMarquee({ target, text, cnt, speed=6, inner }){

// 	let items = document.querySelector(target);
// 	if (!items) return; // 없으면 종료

// 	let count = cnt;
// 	for(let i = 0; i < count; i++){
// 		const marquee = document.createElement('span');
// 		marquee.className = 'marquee-text';
// 		marquee.innerText = text;
// 		items.appendChild(marquee);
// 	}

// 	let offset = 0;
// 	function isAnimate(){
// 		//offset ++;
// 		offset += speed;
// 		let itemST = items.scrollWidth + inner;
// 		if(offset  > itemST / 2){
// 			items.style.transform = 'translate3d(0, 0, 0)';
// 			offset = 0;
// 		}else{
// 			items.style.transform = `translate3d(${-offset}px, 0, 0)`;
// 		}

// 		requestAnimationFrame(isAnimate);

// 	}

// 	isAnimate();
// }
// [Loop Marquee End] 텍스트 무한 루프 종료


/* [GSAP Header Effect] GSAP 헤더 효과 */
function headerGsap(){
	gsap.to('#header', {
		top: 0,
		duration: 2,
		ease: "power4.out",
	});
}
// [GSAP Header Effect End] GSAP Header 효과 종료


/* [GSAP Fade Up Effect] GSAP 페이드 업 효과 */
function fadeUpGsap() {
	const fadeUp = document.querySelectorAll('[data-gsap="fade-up"]');

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

// [GSAP Fade Up Effect End] GSAP 페이드 업 효과 종료
/* // [GSAP & Motion Script End] GSAP & 모션 함수 종료 */