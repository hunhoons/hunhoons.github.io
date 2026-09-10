/*	[Main] - 진입 시
	jQuery Ready + 이벤트 등록
-------------------------------------- */
$(function(){
	HANBOM();
	
	/* [Init] - 초기화 */
	isInit();

	/* [Event] - 이벤트 */
	window.addEventListener("resize", isResize);  					// Resize (리사이즈)
	window.addEventListener("scroll", isScroll, { passive: true }); // Scroll (스크롤)
	window.addEventListener("orientationchange", insetViewPort);	// Orientationchange (방향전환)
});

const HANBOM = () => {
console.log(`
 _____ _____ _____ _____ _____ _____    _____ _____ _____ ____  _____ _____ 
|  |  |  _  |   | | __  |     |     |  |   __|_   _|  |  |    \|     |     |
|     |     | | | | __ -|  |  | | | |  |__   | | | |  |  |  |  |-   -|  |  |
|__|__|__|__|_|___|_____|_____|_|_|_|  |_____| |_| |_____|____/|_____|_____|

Created By ©HANBOM STUDIO
`);
}

/* [JS] (Layout Include Module) */
/* Description: 레이아웃 인클루드 */
async function isLayoutPath(callback) {
	const includeElements = [...document.querySelectorAll('[data-include-path]')];

	await Promise.all(includeElements.map(async (el) => {
		const includePath = el.dataset.includePath;
		if (!includePath) return;

		try {
			const response = await fetch(includePath);
			if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);

			el.outerHTML = await response.text();
		} catch (error) {
			console.error(`[include 실패] ${includePath}`, error);
		}
	}));

	// header/footer 요청이 모두 끝난 뒤 실행된다. setTimeout이 필요 없다.
	if (typeof callback === 'function') callback();
}

/* [JS] (Main Load Function) */
/* Description: 진입 시 이벤트 함수 */

/* {Init} - 초기화 */
function isInit(){

	/* <Click Event> - 클릭 이벤트 */
	document.addEventListener('click', (e) => {
		const btnMenu 	= e.target.closest('#header .btn.menu');
		const btnTop 	= e.target.closest('#scrollTopBtn');

		if(btnMenu){ // Header Menu: Class Opened Nav로 On/Off
			e.preventDefault();

			document.body.classList.contains('opened-nav')
			? isNavClose() : isNavOpen();
		}

		if(btnTop){ // Scroll Top: 스크롤 탑
			e.preventDefault();

			if (window.lenis) {
				window.lenis.scrollTo(0, { 	// 1. Lenis scrollTo + onComplete 콜백
					duration  : 1.2,
					force     : true, 		// 2. stop 상태에서도 강제 실행!
					onComplete: () => window.lenis.start()
				});
			}else {
				window.scrollTo({ top: 0, behavior: 'smooth' });
			}
		}
	});

	/* <Nav Event> - 마우스 이벤트(초기화 중복 방지용) */
	$(document) 
	.off('mouseenter.navHover', '#nav')
	.on('mouseenter.navHover', '#nav', function () { 
    	$('#header').addClass('nav-open')
	})
	.off('mouseleave.navHover', '#nav')
  	.on('mouseleave.navHover', '#nav', function () {
    	$('#header').removeClass('nav-open');
  	});

	/* <Lenis Lib> - 스무스 스크롤 초기화 */
	initLenis();
	lenisScrollBarCustom();

	/* <Init Set Function> - 초기 세팅 함수 호출 */
	insetViewPort(); 				// 뷰포트 높이 + 디바이스 클래스
	insetBindDepth();				// 모바일 1뎁스 링크 방지

	isScroll();						// 스크롤 상태 초기화
	isScrollResetLenis(false); 		// 스크롤 최상단 초기화


	insetViewReloadBreakPoint();	// 브레이크포인트 리로드
	initOrientationLayer(100)		// 가로모드 체크

	//initElasticCursor();
};
/* {Lenis Init} - 스크롤 초기화 및 GSAP ticker 연동 */
function initLenis(){
	if (window.lenis) return;

	const isMobile = window.innerWidth <= 1024;
	window.lenis = new Lenis({
		lerp				: isMobile ? 0.065 : 0.08,
		syncTouch			: true,
		syncTouchLerp		: 0.09,					// 터치 관성 보간
		wheelMultiplier		: 0.7, 					// 휠 민감도 (0.6~0.8 실무 안정)
		touchMultiplier 	: 1,
		orientation			: 'vertical',
		autoToggle			: false,  				// 탭 전환 시 자동 stop/start
		allowNestedScroll	: true,  				// 모달/팝업 내부 스크롤 허용
		anchors				: true,  				// href="#id" 앵커 자동 스무딩
		stopInertiaOnNavigate: true,				// 페이지 이동 시 관성 멈춤
	});

	window.lenis.on('scroll', ScrollTrigger.update);
	gsap.ticker.add((time) => window.lenis.raf(time * 1000));
	gsap.ticker.lagSmoothing(0);
}
function lenisScrollBarCustom() {
	const isMobile = window.innerWidth <= 1024;
	if (isMobile) return;

	const existingScrollbar = document.querySelector('.lenis-scrollbar');
	if (existingScrollbar) return;

	const track = Object.assign(document.createElement('div'), {
		className: 'lenis-scrollbar',
	});
	const thumb = Object.assign(document.createElement('div'), {
		className: 'lenis-scrollbar-thumb',
	});

	track.appendChild(thumb);
	document.body.appendChild(track);

	let visibilityRafId = 0;
	let thumbTravel = 0;

	const updateThumbMetrics = () => {
		thumbTravel = Math.max(track.clientHeight - thumb.clientHeight, 0);
	};

	const toggleVisibility = () => {
		if (visibilityRafId) return;

		visibilityRafId = requestAnimationFrame(() => {
			visibilityRafId = 0;
			updateThumbMetrics();

			track.classList.toggle(
				'is-visible',
				document.documentElement.scrollHeight > window.innerHeight &&
				document.body.classList.contains('scroll-has')
			);
		});
	};

	updateThumbMetrics();
	toggleVisibility();

	window.addEventListener('resize', toggleVisibility);

	if ('ResizeObserver' in window) {
		new ResizeObserver(toggleVisibility).observe(document.documentElement);
	}

	window.lenis.on('scroll', ({ progress }) => {
		thumb.style.transform = `translate3d(0, ${progress * thumbTravel}px, 0)`;
	});

	track.addEventListener('pointerdown', (e) => {
		e.preventDefault();

		const ratio = (e.clientY - track.getBoundingClientRect().top) / track.clientHeight;
		const maxScroll = Math.max(document.documentElement.scrollHeight - window.innerHeight, 0);

		window.lenis.scrollTo(ratio * maxScroll);
	});

	let isDragging = false;
	let startY = 0;
	let startScroll = 0;

	thumb.addEventListener('pointerdown', (e) => {
		e.preventDefault();
		e.stopPropagation();

		isDragging = true;
		startY = e.clientY;
		startScroll = window.lenis.scroll;

		thumb.setPointerCapture(e.pointerId);
		track.classList.add('is-dragging');
	});

	window.addEventListener('pointermove', (e) => {
		if (!isDragging || !thumbTravel) return;

		const ratio = (e.clientY - startY) / thumbTravel;
		const maxScroll = Math.max(document.documentElement.scrollHeight - window.innerHeight, 0);

		window.lenis.scrollTo(startScroll + ratio * maxScroll, { immediate: true });
	});

	window.addEventListener('pointerup', () => {
		if (!isDragging) return;

		isDragging = false;
		track.classList.remove('is-dragging');
	});
}

function updateScrollbarThumb() {
	const track = document.querySelector('.lenis-scrollbar');
	const thumb = document.querySelector('.lenis-scrollbar-thumb');
	if (!track || !thumb || !window.lenis) return;

	const thumbTravel = Math.max(track.clientHeight - thumb.clientHeight, 0);
	thumb.style.transform = `translate3d(0, ${window.lenis.progress * thumbTravel}px, 0)`;
}

/* {Resizing} - 리사이징 이벤트 */
let resizeRafId = 0;
let wasMobileNav = window.innerWidth <= 1024;
function isResize() {
	if (resizeRafId) return;

	resizeRafId = requestAnimationFrame(() => {
		resizeRafId = 0;

		const isMobileNav = window.innerWidth <= 1024;

		// desktop에서 mobile/tablet으로 바뀌는 순간에만 menu 상태를 정리한다.
		if (isMobileNav && !wasMobileNav) {
		document.body.classList.remove('opened-nav');
		document.querySelectorAll('#nav .depth-1')
			.forEach(el => el.closest('li')?.classList.remove('current'));
		}

		wasMobileNav = isMobileNav;

		insetViewPort();
		insetBindDepth();
	});
}

/* {Scroll} - 스크롤 이벤트 */
let scrollRafId = 0;
function isScroll() {
	if (scrollRafId) return;
	
	scrollRafId = requestAnimationFrame(() => {
		scrollRafId = 0;

		insetHeadFixed();
		insetScrollState();
	});
}



/*	[Core] - 코어 함수
	브라우저 초기 세팅 (뷰포트, 헤더, 뎁스, 스크롤)
------------------------------------------------- */

/* {InsetViewPort} - 뷰 높이 & 디바이스 클래스 */
function insetViewPort() {
	const root 	= document.documentElement;
	const body 	= document.body;
	const wW 	= window.innerWidth;

	/* <VH 변수 주입> - 모바일 주소창 대응 */
	const vh = `${window.innerHeight * 0.01}px`;
	if(root.style.getPropertyValue('--vh') !== vh){
		root.style.setProperty('--vh', vh);
	}

	/* <Device Class> - 바이스 클래스 분기 */
	let device = 'is-desktop';
  	if (wW <= 767) device = 'is-mobile';
  	else if (wW <= 1024) device = 'is-tablet';
	
	if (!body.classList.contains(device)) {
		body.classList.remove('is-desktop', 'is-tablet', 'is-mobile');
		body.classList.add(device);
	}
}

/* {InsetBindDepth} - 모바일 1뎁스 링크 이동 방지 */
let isDepthMenuBound = null;
function insetBindDepth() {
	const isMobileMenu = window.innerWidth <= 1024;

	if(isDepthMenuBound === isMobileMenu) return;
	isDepthMenuBound = isMobileMenu;

	const $document = $(document);
	$document.off('click.depthMenu', '#nav .depth-1');

	if(!isMobileMenu) return;

	$document.on('click.depthMenu', '#nav .depth-1', function (e) {
		//e.preventDefault();

		const parentLi = $(this).closest('li');
		$('#nav .depth-1').closest('li').not(parentLi).removeClass('current');
		parentLi.toggleClass('current');
	});
}

/* {InsetHeadFixed} - 헤더 Fixed 처리 */
function insetHeadFixed() {
	const header  = document.getElementById('header');
	if(!header) return;
	
	const st      = window.scrollY;
	const hHeight = header?.offsetHeight ?? 0;
	header?.classList.toggle('fixed', st > hHeight);
}

/* {InsetScrollState} - 스크롤 방향 상태 클래스 */
let lastScrollTop = 0;
function insetScrollState() {
	const st    = window.scrollY;
	const delta = 80; 				// 방향 감지 최소 스크롤 높이
	const body  = document.body;
	const maxScroll = Math.max(document.documentElement.scrollHeight - window.innerHeight, 0 );
 
	body.classList.toggle('scroll-has', st > 0);
  	body.classList.toggle('scroll-end', st >= maxScroll);

	document.querySelector('.lenis-scrollbar') ?.classList.toggle('is-visible', maxScroll > 0 && st > 0);

	if (Math.abs(lastScrollTop - st) > delta) {
		if (st > lastScrollTop && lastScrollTop > 0) {
			body.classList.add('scroll-down');
			body.classList.remove('scroll-up');
		} else {
			body.classList.add('scroll-up');
			body.classList.remove('scroll-down');
		}

		lastScrollTop = st;
	}
}

/* {InsetViewReloadBreakPoint} - 브레이크포인트 변경 시 페이지 리로드 */
function insetViewReloadBreakPoint() {
	const BREAKPOINTS = (width) => {
		if (width <= 767) return 'mobile';
		if (width <= 1024) return 'tablet';
		return 'desktop';
	};

	let prevDevice = BREAKPOINTS(window.innerWidth);
  	let delayId = null;
 
	window.addEventListener('resize', () => {
		clearTimeout(delayId);

		delayId = setTimeout(() => {
			const currentDevice = BREAKPOINTS(window.innerWidth);

			// mobile ↔ tablet ↔ desktop이 실제로 바뀔 때만 reload
			if (prevDevice !== currentDevice) {
				window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
				window.location.reload();
				
				return;
			}

			prevDevice = currentDevice;
		}, 300);
	});
}




/* <Orientation> - 가로모드 체크 */
// 계절 인덱스 반환 (0:봄 1:여름 2:가을 3:겨울)
function getSeasonIndex() {
  const month = new Date().getMonth() + 1;
  if (month >= 3 && month <= 5) return 0;
  if (month >= 6 && month <= 8) return 1;
  if (month >= 9 && month <= 11) return 2;
  return 3;
}

// 가로모드 차단 여부 체크
function isLandscapeBlocked() {
  return (
    window.matchMedia('(orientation: landscape)').matches &&
    window.matchMedia('(pointer: coarse)').matches &&
    window.innerWidth <= 1024
  );
}

// 가로모드 레이어 초기화
function initOrientationLayer(delay = 200) {
  const LAYER_ID = 'deviceMode';
  let timer;

  // lenis 존재 여부 체크 후 제어
  const toggleLenis = (stop) => {
    if (!window.lenis) return;
    stop ? window.lenis.stop() : window.lenis.start();
  };

  const showLayer = () => {
    if (document.getElementById(LAYER_ID)) return;

    const wrap = document.createElement('div');
    wrap.id = LAYER_ID;
    wrap.className = 'device-mode';
    wrap.innerHTML = `
      <ul>
        <li>
          <div class="device-box">
            <i class="ico"></i>
            <p><span>쾌적한 환경을 위해<br>세로로 봐주세요.</span></p>
          </div>
        </li>
        <li class="device-bg device-0${getSeasonIndex()}"></li>
      </ul>
    `;

    document.body.appendChild(wrap);
    requestAnimationFrame(() => wrap.classList.add('active'));
    toggleLenis(true);
  };

  const hideLayer = () => {
    document.getElementById(LAYER_ID)?.remove();
    toggleLenis(false);
  };

  const check = () => isLandscapeBlocked() ? showLayer() : hideLayer();

  window.addEventListener('orientationchange', check);
  window.addEventListener('resize', () => {
    clearTimeout(timer);
    timer = setTimeout(check, delay);
  });

  check();
}



/* {InitElasticCursor} - 탄성 커서 모션 */
// EX) initElasticCursor({ speed: 0.15 });
function initElasticCursor(options = {}) {
	/* 터치 디바이스에서는 생성·listener·rAF를 모두 만들지 않는다. */
	if (!window.matchMedia('(pointer: fine)').matches) return;

	let cursor = document.getElementById('cursor');

	if (!cursor) {
		cursor = document.createElement('div');
		cursor.id = 'cursor';
		document.body.appendChild(cursor);
	}

	/* 같은 cursor에 mousemove listener와 rAF loop를 중복 등록하지 않는다. */
	if (cursor.dataset.elasticCursorReady === 'true') {
		return cursor._elasticCursorDestroy;
	}
	cursor.dataset.elasticCursorReady = 'true';

	const sizes = cursor.offsetWidth / 2; // 최초 1회만 layout 크기 확인
	const speed = options.speed ?? 0.15;

	const mouse  = { x: 0, y: 0 };
	const circle = { x: 0, y: 0 };
	const prev   = { x: 0, y: 0 };
	const delta  = { x: 0, y: 0 };

	let rafId = 0;
	let hasPointerPosition = false;

	function render(angle = 0, scaleX = 1, scaleY = 1) {
		const x = circle.x - sizes;
		const y = circle.y - sizes;

		cursor.style.transform =
			`translate3d(${x}px, ${y}px, 0) rotate(${angle}deg) scale(${scaleX}, ${scaleY})`;
	}

	function tick() {
		rafId = 0;

		prev.x = circle.x;
		prev.y = circle.y;

		circle.x += (mouse.x - circle.x) * speed;
		circle.y += (mouse.y - circle.y) * speed;

		delta.x = circle.x - prev.x;
		delta.y = circle.y - prev.y;

		const velocity = Math.sqrt(delta.x * delta.x + delta.y * delta.y);
		const angle = Math.atan2(delta.y, delta.x) * (180 / Math.PI);
		const stretch = Math.min(velocity * 0.01, 0.6);

		render(angle, 1 + stretch, 1 - stretch * 0.5);

		/* 목표 위치에 거의 도착하면 loop를 종료한다.
		   다음 mousemove가 오면 다시 requestAnimationFrame을 시작한다. */
		const distanceX = Math.abs(mouse.x - circle.x);
		const distanceY = Math.abs(mouse.y - circle.y);
		if (distanceX > 0.1 || distanceY > 0.1 || velocity > 0.1) {
			rafId = requestAnimationFrame(tick);
		}
	}

	function startTick() {
		if (!rafId) rafId = requestAnimationFrame(tick);
	}

	function onMove(e) {
		mouse.x = e.clientX;
		mouse.y = e.clientY;

		/* 첫 mousemove는 pointer 위치에서 즉시 시작해 좌상단 출발을 막는다. */
		if (!hasPointerPosition) {
			circle.x = mouse.x;
			circle.y = mouse.y;
			prev.x = mouse.x;
			prev.y = mouse.y;
			hasPointerPosition = true;
			render();
			return;
		}

		startTick();
	}

	window.addEventListener('mousemove', onMove, { passive: true });

	/* 지금은 반환값을 사용하지 않아도 되지만, 나중에 페이지별 cleanup이 필요할 때 쓸 수 있다. */
	const destroy = () => {
		if (rafId) cancelAnimationFrame(rafId);
		window.removeEventListener('mousemove', onMove);
		delete cursor.dataset.elasticCursorReady;
		delete cursor._elasticCursorDestroy;
	};

	cursor._elasticCursorDestroy = destroy;
	return destroy;
}



/* 	[Public] - 공용 함수
  	페이지에서 직접 호출하는 함수 모음
---------------------------------------- */

/* {IsByDevice} - 디바이스별 반환값 분기 */
// EX) isByDevice({ desktop: 80, tablet: 48, mobile: 24 })
function isByDevice({ desktop, tablet, mobile }) {
	const body = document.body;
	if (body.classList.contains('is-mobile')) return mobile;
	if (body.classList.contains('is-tablet')) return tablet;
	return desktop;
}

/* {IsScrollResct} 스크롤 초기화 */
/* <Basic> */
function forceScrollTop() 	{
	window.scrollTo(0, 0);
	document.documentElement.scrollTop	= 0;
	document.body.scrollTop				= 0;
}
function lockBody() 		{
	document.documentElement.style.overflow	= 'hidden';
	document.body.style.overflow			= 'hidden';
}
function unlockBody() 		{
	document.documentElement.style.overflow = '';
	document.body.style.overflow			= '';
}
function isScrollReset() 	{
	if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
 
	window.addEventListener('load', () => {
		requestAnimationFrame(forceScrollTop);
	}, { once: true });
}

/* <Lenis> */
function isScrollResetLenis(stopAfter = false) {
	if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
	if (!window.lenis) { isScrollReset(); return; }
 
	forceScrollTop();
	window.lenis.scrollTo(0, { immediate: true });
 
	window.addEventListener('load', () => {
		window.lenis.resize();
		window.lenis.start();
 
		requestAnimationFrame(() => {
			forceScrollTop();
			window.lenis.scrollTo(0, { immediate: true });
 
			requestAnimationFrame(() => {
				forceScrollTop();
				window.lenis.scrollTo(0, { immediate: true });
				if (stopAfter) window.lenis.stop();
			});
		});
	}, { once: true });
}

/* {IsCurrent} - GNB 현재 메뉴 활성화 */
// EX) isCurrent(1, 2); → 1뎁스 1번, 2뎁스 2번
function isCurrent(dep1, dep2) {
	const gnb = document.querySelectorAll('#nav > ul > li');
	if(!gnb.length) return;

	gnb.forEach( (li) => li.classList.remove('current')); 	// 1뎁스 클래스 전체 삭제
	if(!dep1) return; 										// 선택된 뎁스가 없는 경우 종료

	const depth01 = gnb[dep1 - 1];
	if (!depth01) return;

	depth01.classList.add('current'); 						// 1뎁스 활성화
 

	/* 2뎁스 */
	if(dep2){ 													
		const dpeth = depth01.querySelectorAll('li');
		dpeth.forEach( (li) => li.classList.remove('current'))	// 2뎁스 클래스 전체 삭제
		dpeth[dep - 1]?.classList.add('current');				// 2뎁스 활성화
	}
}

/* {IsNavOpen / IsNavClose} - 메뉴 열기/닫기 */
function isNavOpen() {
	window.lenis?.stop();
	document.body.classList.add('opened-nav');
}
function isNavClose() {
	document.body.classList.remove('opened-nav');
	window.lenis?.start();

	requestAnimationFrame(() => {
      	updateScrollbarThumb();
	});
}

/* {IsPopupOpen / IsPopupClose} - 팝업 열기/닫기 */
// EX) isPopupOpen('#popup01');
function isPopupOpen(item) {
	window.lenis?.stop();

	$(item).addClass('active');
	document.body.classList.add("modal-opened");
}
function isPopupClose(item) {
	$(item).removeClass('active');
	document.body.classList.remove("modal-opened");

	window.lenis?.start();
	requestAnimationFrame(() => {
      	updateScrollbarThumb();
	});
}

/* {IsAccordion} - 아코디언 */
// event 1: 1개씩 노출 / event 2: 다중 노출
// EX) isAccordion(1);
function isAccordion(event){
	const accordion = $('.accordion-header');

	accordion
	.off('click.accordion')
	.on('click.accordion', function(e) {
		e.preventDefault();

		if(event == 1){ // 1개씩 노출 될 때
			accordion.parent('.accordion-area').removeClass('active');
			$(this).parent('.accordion-area').addClass('active');
		}
		if(event == 2){ // 1개 이상 노출 될 때
			$(this).parent('.accordion-area').toggleClass('active');
		}
	});
}

/* {IsTab} - 탭 */
/*	EX) isTab();
	<div data-tab>
		<ul class="tabs">
			<li><a href="#tab1-1">메뉴1</a></li>
			<li><a href="#tab1-2">메뉴2</a></li>
		</ul>
		<div id="tab1-1" class="tab-content">
        	<!-- 2뎁스 탭 (중첩) -->
        	<div data-tab>
			</div>
		</div>
	</div>
*/
function isTab() {
	const tabWraps = document.querySelectorAll('[data-tab]');
    if (!tabWraps.length) return;

    tabWraps.forEach((wrap) => {

		if (wrap.dataset.tabReady === 'true') return;
    	wrap.dataset.tabReady = 'true';

        /* · :scope → 직계 자식만 잡음 — 하위 뎁스 침범 방지 */
        const tabs     = wrap.querySelectorAll(':scope > .tabs li a');
        const contents = wrap.querySelectorAll(':scope > .tab-content');
        if (!tabs.length) return;

        /* · 첫 번째 탭 기본 활성화 */
        tabs[0]?.closest('li').classList.add('current');
        contents[0]?.classList.add('active');

        tabs.forEach((tab) => {
            tab.addEventListener('click', (e) => {
                e.preventDefault();
                const target = tab.getAttribute('href');

                /* · 콘텐츠 전환 */
                contents.forEach(c => c.classList.remove('active'));
                wrap.querySelector(target)?.classList.add('active');

                /* · 탭 버튼 전환 */
                tabs.forEach(t => t.closest('li').classList.remove('current'));
                tab.closest('li').classList.add('current');
            });
        });
    });
}

/* {isMaxlength} - 인풋 최대 길이 제한 */
// EX) isMaxlength(this, 10);
function isMaxlength(target, length) {
	target.value = target.value.slice(0, length);
}

/* {isInputTel} - 전화번호 인풋 숫자만 입력 + 자동 하이픈 */
// EX) isInputTel('#phone');
function isInputTel(target) {
	const tel = document.querySelector(target);
    if (!tel) return;

	tel.addEventListener('input', () => {
		const val = tel.value.replace(/[^0-9]/g, ''); // 숫자 외 전부 제거

		if (val.length <= 3) {
			tel.value = val;
		} else if (val.length <= 7) {
			tel.value = `${val.slice(0, 3)}${val.slice(3)}`;
		} else {
			tel.value = `${val.slice(0, 3)}${val.slice(3, 7)}${val.slice(7, 11)}`;
		}
	});
}

/* {isValidForm} - 순서 기반 폼 유효성 검사 */
/*	1. 위에서 아래 순서로 체크
	2. 첫 번째 실패한 항목에서 멈추고 포커스 이동
   	type: 'empty' | 'email' | 'phone' | 'number' | 'minLength'
   	EX) isValidForm([
   		{ target: '#name',  type: 'empty', msg: '이름을 입력해주세요.' },
		{ target: '#email', type: 'email', msg: '이메일을 확인해주세요.' },
	]);
*/
function isValidForm(rules = []) {
	const checker = {
		empty: (value) => value.trim() !== '',
		email: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim()),
		phone: (value) =>
			/^(01[016789])[0-9]{3,4}[0-9]{4}$/.test(
				value.replace(/-/g, '').trim()
			),
		number: (value) => /^[0-9]+$/.test(value.trim()),
		minLength: (value, option = 2) => value.trim().length >= option,
	};

	for (const rule of rules) {
		const element = document.querySelector(rule.target);

		if (!element) {
			console.warn(`유효성 검사 대상이 없습니다: ${rule.target}`);
			continue;
		}

		const validate = checker[rule.type];

		if (typeof validate !== 'function') {
			console.warn(`존재하지 않는 유효성 검사 타입입니다: ${rule.type}`);
			continue;
		}

		const value = element.value ?? '';
		const isValid = validate(value, rule.option);

		if (isValid) continue;

		alert(rule.msg);

		const headerHeight =
			parseInt(
				getComputedStyle(document.documentElement)
					.getPropertyValue('--header'),
				10
			) || 100;

		if (window.lenis) {
			window.lenis.scrollTo(element, {
				offset: -headerHeight,
				duration: 0.8,
				onComplete: () => element.focus(),
			});
		} else {
			element.scrollIntoView({
				behavior: 'smooth',
				block: 'center',
			});
			element.focus();
		}

		return false;
	}

	return true;
}


/* {Clipboard} - 클립보드 복사 */
function isCopyArea(item){
	if (navigator.clipboard && window.isSecureContext) {
		return navigator.clipboard.writeText(text);
	}

	return new Promise((resolve, reject) => {
		const tempInput = document.createElement('textarea');
		tempInput.value = text;
		tempInput.style.cssText = 'position:fixed;left:-9999px;top:0;opacity:0;';

		document.body.appendChild(tempInput);
		tempInput.select();

		const copied = document.execCommand('copy');
		tempInput.remove();

		copied ? resolve() : reject(new Error('copy failed'));
	});
}
function isCopyUrl(){ 					// URL 복사
	isCopyArea(window.location.href)
    .then(() 	=> alert('URL이 복사 되었습니다.'))
    .catch(() 	=> alert('복사에 실패했습니다.'));
}
function isCopyTxt(item, alertTxt){ 	// 텍스트 복사
	isCopyArea($(item).text())
    .then(() 	=> alert(alertTxt ? `${alertTxt} 복사되었습니다.` : '텍스트가 복사되었습니다.'))
    .catch(() 	=> alert('복사에 실패했습니다.'));
}

/* {isSelectric} - Selectric 셀렉트 라이브러리  */
// EX) isSelectric('#select', 'medium');
function isSelectric(item, size) {
	const sizes = ['xsmall', 'small', 'medium', 'large', 'xlarge'];
	const $select = $(item);

  	$select.selectric();
	if (sizes.includes(size)) {
		$select
		.closest('.selectric-wrapper')
		.find('.selectric')
		.addClass(size);
	}
}