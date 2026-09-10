/* ========================================
	Motion JS
	@created : 2026
	@author  : HunHoon
	@desc    : Lenis / GSAP / 마키 / 스와이퍼 모션 함수 / 
	셀렉트 커스텀
========================================= */
function initBarba() {

    const COL_COUNT = 10;
    const COL_DUR   = 0.72;
    const COL_EASE  = 'power3.inOut';

    // ✅ ia 만 생성
    function buildCols(bg) {
        const root = document.createElement('div');
        root.id = 'barba-cols';
        root.style.cssText = 'position:fixed;inset:0;display:flex;pointer-events:none;z-index:9999';

        const cols = [];
        for (let i = 0; i < COL_COUNT; i++) {
            const col = document.createElement('div');
            col.style.cssText = 'flex:1;height:100%;overflow:hidden;position:relative';

            const ia = document.createElement('div');
            ia.style.cssText = 'position:absolute;inset:0;background:' + bg;

            col.appendChild(ia);
            root.appendChild(col);
            cols.push(ia);
        }
        document.body.appendChild(root);
        return cols;
    }

    function removeCols() {
        const el = document.getElementById('barba-cols');
        if (el) el.remove();
    }

    // ✅ 가운데서 퍼지며 화면 덮기
    function colClose(dur = COL_DUR) {
		return new Promise(resolve => {
			const cols = buildCols('#111');
			const mid  = COL_COUNT / 2;
			const order = [];
			for (let i = 0; i < mid; i++) {
				order.push(mid - 1 - i);
				order.push(mid + i);
			}

			cols.forEach((ia, i) => {
				gsap.set(ia, { y: i < mid ? '100%' : '-100%' });
			});

			const tl = gsap.timeline({ onComplete: resolve });
			order.forEach((idx, step) => {
				tl.to(cols[idx], { y: '0%', duration: dur, ease: COL_EASE }, step * 0.04);
			});
		});
	}

	function colOpen(dur = COL_DUR) {
		return new Promise(resolve => {
			const cols = Array.from(document.querySelectorAll('#barba-cols > div > div'));
			const mid  = COL_COUNT / 2;
			const order = [];
			for (let i = 0; i < mid; i++) {
				order.push(mid - 1 - i);
				order.push(mid + i);
			}

			const tl = gsap.timeline({ onComplete: resolve });
			order.forEach((idx, step) => {
				tl.to(cols[idx], {
					y: idx < mid ? '-100%' : '100%',
					duration: dur,
					ease: COL_EASE
				}, step * 0.04);
			});
		});
	}

    barba.init({
		debug: true,

		prevent: ({ el }) => {
			if (!el.href) return true;
			return el.getAttribute('target') === '_blank'
				|| el.href.includes('#')
				|| el.classList.contains('no-barba');
		},

		// ✅ 뒤로가기 대응
		requestError: (trigger, action, url, response) => {
			// 에러 시 강제 이동
			barba.force(url);
		},

		transitions: [{
			name: 'wave-center',

			// ✅ 뒤로가기 시에도 트랜지션 실행
			sync: false,

			async leave({ trigger }) {
				if (window.lenis) window.lenis.stop();

				// ✅ 뒤로가기면 빠르게 처리
				if (trigger === 'popstate') {
					await colClose(0.35); // duration 짧게
					return;
				}
				await colClose();
			},

			enter({ trigger }) {
				window.scrollTo(0, 0);
				if (window.lenis) window.lenis.scrollTo(0, { immediate: true });
			},

			async after({ trigger }) {
				if (trigger === 'popstate') {
					await colOpen(0.35); // duration 짧게
				} else {
					await colOpen();
				}

				removeCols();
				if (window.lenis) window.lenis.start();
				ScrollTrigger.refresh();
				fadeUpGsap();
    			footerGsap();
			}
		}]
	});
}
//initBarba();


/* [GSAP] - GSAP 모션
---------------------------------------- */
/* {Header Effect GSAP} - 헤더 등장 모션 */
// EX) headerGsap();
function headerGsap() {
	let mmHeader = gsap.matchMedia();

	const header = document.getElementById('header');
	if (!header) return;

	const headers = {};
	headers.logo  = header.querySelector('.logo');
	headers.depth = header.querySelectorAll('#nav .depth-1');


	const headerTl = gsap.timeline({});
	headerTl.set(headers.logo, {
		y: -40,
		autoAlpha: 0,
		transformOrigin: 'center bottom'
	})
	.to (headers.logo, {
		y: 0,
		autoAlpha: 1,
		duration: 0.75,
		ease: 'power2.in'
	} ,0)
	.to (headers.logo, {
		keyframes: {
			'0%'  : { scaleX: 1,    scaleY: 1    },
			'30%' : { scaleX: 0.7,  scaleY: 1.3  },
			'40%' : { scaleX: 1.25, scaleY: 0.8  },
			'50%' : { scaleX: 0.9,  scaleY: 1.12 },
			'65%' : { scaleX: 1.05, scaleY: 0.96 },
			'75%' : { scaleX: 0.97, scaleY: 1.03 },
			'100%': { scaleX: 1,    scaleY: 1    },
		},
		duration: 1,
		ease: 'power1.out',
		clearProps: 'scale',
	}, 0.6);



	
	mmHeader.add('(max-width: 1024px)', () => {
		headers.menu  = header.querySelector('.btn.menu');
		if (!headers.menu) return;

		gsap.timeline({})
		.set(headers.menu, {
			y: -40,
			autoAlpha: 0,
			transition: 'none', // .btn 전역 transition:all과 GSAP가 매 프레임 경쟁하며 트랜스폼이 잔상처럼 남는 문제 방지
			transformOrigin: 'center bottom'
		})
		.to (headers.menu, {
			y: 0,
			autoAlpha: 1,
			duration: 0.75,
			ease: 'power2.in'
		} ,0)
		.to (headers.menu, {
			keyframes: {
				'0%'  : { scaleX: 1,    scaleY: 1    },
				'30%' : { scaleX: 0.7,  scaleY: 1.3  },
				'40%' : { scaleX: 1.25, scaleY: 0.8  },
				'50%' : { scaleX: 0.9,  scaleY: 1.12 },
				'65%' : { scaleX: 1.05, scaleY: 0.96 },
				'75%' : { scaleX: 0.97, scaleY: 1.03 },
				'100%': { scaleX: 1,    scaleY: 1    },
			},
			duration: 1,
			ease: 'power1.out',
			clearProps: 'transform,transition',
		}, 0.6);
	});

	// Nav 메뉴 모션
	mmHeader.add('(min-width: 1025px)', () => {
		headers.depth.forEach((item, idx) => {
			gsap.set(item, { clipPath: 'inset(0 100% 0 0)' });

			const sweepOrange = document.createElement('div');
			sweepOrange.style.cssText = 'position:absolute; inset:0; z-index:6; background:var(--orange); transform-origin:right center;';
			const sweepWhite = document.createElement('div');
			sweepWhite.style.cssText = 'position:absolute; inset:0; z-index:5; background:var(--white); transform-origin:right center;';
			item.appendChild(sweepWhite);
			item.appendChild(sweepOrange);

			gsap.timeline({ delay: 1.1 + idx * 0.08, onComplete: () => { sweepOrange.remove(); sweepWhite.remove(); } })
				.to(item,        { clipPath: 'inset(0 0% 0 0)', duration: 0.5, ease: 'power3.out' }, 0)
				.to(sweepOrange, { scaleX: 0, duration: 0.45, ease: 'power2.inOut' }, 0.28)
				.to(sweepWhite,  { scaleX: 0, duration: 0.45, ease: 'power2.inOut' }, 0.38);
		});
	});

	

}

/* {Footer Effect GSAP} - 푸터 모션 */
// EX) footerGsap();
let footerTween = null;
function footerGsap(){
	const footer = document.querySelector('#footer');
	if (!footer) return;

	const foot = {};
	foot.inner = footer.querySelector('.footer-inner');
	foot.logo  = footer.querySelector('.img-wrap');
	if(!foot.inner) return
	
	footerTween?.scrollTrigger?.kill();
  	footerTween?.kill();

	gsap.set(foot.inner, { yPercent: -100 });
	gsap.set(foot.logo, 	{
		scaleY: 2.2, scaleX: 0.92,
		transformOrigin: 'bottom center', // 아래쪽 기준으로 늘어나게
    });

	footerTween = gsap.timeline({
		scrollTrigger: {
			trigger: footer,
			start  : () => 'top bottom+=' + window.innerHeight * 0.4,
			end    : 'bottom bottom+=1',
			scrub  : true,
			invalidateOnRefresh: true,
			//markers: true,
		},
	});

	footerTween.to(foot.inner, {
		yPercent: 0,
		ease: 'power1.out',
	}, 0)
	.to( foot.logo,  {
		scaleY: 1, scaleX: 1,
		ease: 'back.out(1.8)',
	}, 0);

}

/* {Header BG Toggle Effect GSAP} - 특정 섹션 통과 시 헤더 클래스 토글 */
// data-gsap="bg-white" 속성 요소에 적용
// 섹션 진입 시(top top~bottom top 구간) 헤더에 is-bg-white 클래스 삽입, 벗어나면 제거
// EX) headerBgGsap();
let headerBgTriggers = [];

function headerBgGsap() {
	const header = document.getElementById('header');
	if (!header) return;

	const whiteItems = document.querySelectorAll('[data-gsap="bg-white"]');
	const blackItems = document.querySelectorAll('[data-gsap="bg-black"]');
	if (!whiteItems.length && !blackItems.length) return;

	/* 재호출 시 이전 ScrollTrigger 중복 생성 방지 */
	headerBgTriggers.forEach((trigger) => trigger.kill());
	headerBgTriggers = [];

	const setHeaderBg = (bgClass) => {
		header.classList.remove('is-bg-white', 'is-bg-black');
		header.classList.add(bgClass);
	};

	const clearHeaderBg = () => {
		header.classList.remove('is-bg-white', 'is-bg-black');
	};

	/* white 영역: 요소 상단이 화면 중앙에 올 때부터 */
	whiteItems.forEach((item) => {
		const trigger = ScrollTrigger.create({
			trigger: item,
			start: 'top bottom',
			end: 'bottom top',
			onEnter: () => setHeaderBg('is-bg-white'),
			onLeave: clearHeaderBg,
			onEnterBack: () => setHeaderBg('is-bg-white'),
			onLeaveBack: clearHeaderBg,
			//markers: true,
		});

		headerBgTriggers.push(trigger);
	});

	/* black 영역: 요소 상단이 화면 상단에 닿을 때부터 */
	blackItems.forEach((item) => {
		const trigger = ScrollTrigger.create({
			trigger: item,
			start: 'top 10%',
			end: 'bottom 10%',
			onEnter: () => setHeaderBg('is-bg-black'),
			onLeave: clearHeaderBg,
			onEnterBack: () => setHeaderBg('is-bg-black'),
			onLeaveBack: clearHeaderBg,
			//markers: true,
		});

		headerBgTriggers.push(trigger);
	});
}


/* {Fade Up Effect GSAP} - 페이드 업 모션 */
// data-gsap="fade-up" 속성 요소에 적용
// EX) fadeUpGsap();
function fadeUpGsap(start = 90) {
	const items = document.querySelectorAll('[data-gsap="fade-up"]');
	if (!items.length) return;
 
	items.forEach((item) => {

		// 중복 트리거 / 트윈 방지
		if (item.dataset.fadeUpReady === 'true') return;
    	item.dataset.fadeUpReady = 'true';

		gsap.set(item, { y: 30, autoAlpha: 0 });
		gsap.to(item, {
			y        : 0,
			autoAlpha: 1,
			duration : 1.8,
			ease     : 'power4.out',
			scrollTrigger: {
				trigger: item,
				start  : `top ${start}%`,
				// toggleActions: 'play none none reverse',
				//markers: true,
			},
		});
	});
}

/* {IMG Scale Effect GSAP} - 이미지 스켈일업 모션 */
// data-gsap="img-scale" 속성 요소에 적용
// EX) scaleGsap(); 
function scaleGsap() {
	const items = document.querySelectorAll('[data-gsap="img-scale"]');
	if (!items.length) return;
 
	items.forEach((item) => {

		// 중복 트리거 / 트윈 방지
		if (item.dataset.scaleReady === 'true') return;
  		item.dataset.scaleReady = 'true';

		gsap.set(item, { scale: 1.1, autoAlpha: 0 });
		gsap.to(item, {
			scale    : 1,
			autoAlpha: 1,
			duration : 1.8,
			ease     : 'power4.out',
			scrollTrigger: {
				trigger: item,
				start  : 'top 90%',
				// toggleActions: 'play none none reverse',
				// markers: true,
			},
		});
	});
}

function fadeUpScaleGsap(targets) {
	const items = gsap.utils.toArray(targets);
	if (!items.length) return;

	const images = items.flatMap((item) => {
		return gsap.utils.toArray(item.querySelectorAll('img'));
	});

	// 중복 실행 방지
	gsap.killTweensOf(items);
	gsap.killTweensOf(images);

	// 리스트 초기 상태
	gsap.set(items, {
		y: 30,
		autoAlpha: 0,
	});

	gsap.set(images, {
		scale: 1.06,
		transformOrigin: 'center center',
	});

	// 리스트 순차 노출
	gsap.to(items, {
		y: 0,
		autoAlpha: 1,
		duration: 1.2,
		stagger: 0.08,
		ease: 'power3.out',
	});

	// 이미지 스케일 복귀
	gsap.to(images, {
		scale: 1,
		duration: 1.2,
		stagger: 0.08,
		ease: 'power3.out',
	});
}

/* {IMG Reveal Effect GSAP} - 이미지 클리핑 모션 */
// data-gsap="img-reveal" 속성 요소에 적용
// data-reveal="left | right | top | bottom" 방향 설정 (기본: left)
/* 
	<div data-gsap="img-reveal"></div>
	<div data-gsap="img-reveal" data-reveal="right"></div>
	
	EX) revealGsap(); 
*/
function revealGsap() {
    const items = document.querySelectorAll('[data-gsap="img-reveal"]');
    if (!items.length) return;

    /* · 방향별 clipPath 정의 */
    const clipFrom = {
        left   : 'inset(0 100% 0 0)',
        right  : 'inset(0 0 0 100%)',
        top    : 'inset(0 0 100% 0)',
        bottom : 'inset(100% 0 0 0)',
    };

    items.forEach((item) => {

		// 중복 트리거 / 트윈 방지
		if (item.dataset.revealReady === 'true') return;
  		item.dataset.revealReady = 'true';

        const dir = item.dataset.reveal || 'left';

        gsap.fromTo(item,
            { clipPath: clipFrom[dir] || clipFrom.left },
            {
                clipPath : 'inset(0 0% 0 0)',
                duration : 1.4,
                ease     : 'power4.inOut',
                scrollTrigger: {
                    trigger: item,
                    start  : 'top 90%',
                    // markers: true,
                },
            }
        );
    });
}


/* [Marquee] - 무한 루프 마키
---------------------------------------- */
/* {getMarqueeGap} - 마키 gap 값 반환 (CSS 변수 --marquee-gap) */
function getMarqueeGap(el) {
	return parseFloat(getComputedStyle(el).getPropertyValue('--marquee-gap')) || 0;
}
/* {runMarquee} - 마키 공통 애니메이션 루프 (내부 함수) */
function runMarquee(items, speed) {
	let offset = 0;
	let gap   = getMarqueeGap(items);
	let limit = items.scrollWidth + gap;
 
	const ro = new ResizeObserver(() => {
        gap = getMarqueeGap(items);
        limit = items.scrollWidth + gap;
    });
    ro.observe(items);

	function animate() {
    	offset += speed;

        if (offset > limit / 2) {
            offset = 0;
            items.style.transform = 'translate3d(0,0,0)';
        } else {
            items.style.transform = `translate3d(${-offset}px,0,0)`;
        }
        requestAnimationFrame(animate);
    }
    animate();
}

/* {motionMarquee} - 단일 텍스트 무한 루프 */
// EX) motionMarquee({
// 	target : '.marquee .inner',
// 	text   : 'TEXT',
// 	speed  : 2,
// 	cnt    : 20,
// }); 
function motionMarquee({ target, text, cnt, speed = 2 }) {
	const items = document.querySelector(target);
	if (!items) return;
 
	if (items.dataset.marqueeReady === 'true') return;
  	items.dataset.marqueeReady = 'true';

  	const fragment = document.createDocumentFragment();

	for (let i = 0; i < cnt; i++) {
		const span = document.createElement('span');
		span.className = 'text';
		span.textContent = text;
		fragment.appendChild(span);
	}

	items.appendChild(fragment);
	runMarquee(items, speed);
}

/* {motionMarqueeDuo} - 두 텍스트 교대 무한 루프 */
// EX) motionMarqueeDuo({
// 	target : '.marquee .inner',
// 	texts  : ['NEXT LEVEL', 'TECHNOLOGY'],
// 	speed  : 6,
// 	cnt    : 20,
// });
function motionMarqueeDuo({ target, texts = [], cnt, speed = 6 }) {
	const items = document.querySelector(target);
	if (!items || !texts.length) return;

	if (items.dataset.marqueeReady === 'true') return;
	items.dataset.marqueeReady = 'true';

	const fragment = document.createDocumentFragment();

	for (let i = 0; i < cnt; i++) {
		const span = document.createElement('span');
		span.className = 'text';
		span.textContent = texts[i % texts.length];
		fragment.appendChild(span);
	}

	items.appendChild(fragment);
	runMarquee(items, speed);
}

/* {motionImageMarquee} - 이미지 무한 루프 */
// EX) motionImageMarquee({
// 	container: '.marquee-images',
// 	speed    : 1.5,
// 	autoFill : true,
// 	minClones: 2,
// });
/* {motionImageMarquee} - 이미지 무한 루프 */
// EX) motionImageMarquee({
//   container: '.marquee-images',
//   speed: 1.5,
//   autoFill: true,
//   minClones: 2,
// });
function motionImageMarquee({ container, speed = 1, autoFill = true, minClones = 2 }) {
	const wrap = document.querySelector(container);
	if (!wrap) return;

	const inner = wrap.querySelector('.img-inner');
	if (!inner) return;

	/* 같은 image marquee에 clone·observer·rAF를 중복 생성하지 않는다. */
	if (inner.dataset.imageMarqueeReady === 'true') return;
	inner.dataset.imageMarqueeReady = 'true';

	const items = [...inner.querySelectorAll('.marquee-img')];
	if (!items.length) return;

	const images = inner.querySelectorAll('img');

	/* 모든 원본 이미지의 load/error 완료 뒤에 폭을 측정하고 clone한다. */
	Promise.all([...images].map((img) => {
		if (img.complete) return Promise.resolve();

		return new Promise((resolve) => {
			img.addEventListener('load', resolve, { once: true });
			img.addEventListener('error', resolve, { once: true });
		});
	})).then(() => {
		/* 컨테이너 폭을 충분히 채울 때까지 원본 item을 안전하게 복제한다. */
		if (autoFill) {
			let cloneCount = 0;

			while (inner.scrollWidth < wrap.offsetWidth * minClones) {
				const fragment = document.createDocumentFragment();

				items.forEach((item) => {
					fragment.appendChild(item.cloneNode(true));
				});

				inner.appendChild(fragment);

				if (++cloneCount > 10) break;
			}
		}

		/* 현재까지의 item 묶음을 한 세트로 보고, 뒤에 동일한 세트를 붙인다. */
		const loopItemCount = inner.children.length;
		const loopFragment = document.createDocumentFragment();

		[...inner.children].forEach((item) => {
			loopFragment.appendChild(item.cloneNode(true));
		});

		inner.appendChild(loopFragment);

		let offset = 0;
		let originalWidth = 0;
		let metricsRafId = 0;

		/* 첫 clone의 시작 x 좌표가 한 세트가 이동해야 할 정확한 거리다. */
		const updateMetrics = () => {
			const firstClone = inner.children[loopItemCount];
			originalWidth = firstClone?.offsetLeft || 0;
		};

		const scheduleMetricsUpdate = () => {
			if (metricsRafId) return;

			metricsRafId = requestAnimationFrame(() => {
				metricsRafId = 0;
				updateMetrics();
			});
		};

		updateMetrics();

		if ('ResizeObserver' in window) {
			const ro = new ResizeObserver(scheduleMetricsUpdate);
			ro.observe(wrap);
		} else {
			window.addEventListener('resize', scheduleMetricsUpdate);
		}

		function animate() {
			if (originalWidth > 0) {
				offset += speed;

				if (offset >= originalWidth) offset = 0;

				inner.style.transform = `translate3d(${-offset}px, 0, 0)`;
			}

			requestAnimationFrame(animate);
		}

		requestAnimationFrame(animate);
	});
}

/* {motionHoverMarquee} - 리스트 항목별 hover marquee */
// EX)
// motionHoverMarquee({
// 	trigger: '.grid-wrap li',
// 	target : '.marquee .inner',
// 	cnt    : 20,
// 	speed  : 2,
// });
function motionHoverMarquee({ trigger, target, text, cnt = 20, speed = 2,}) {
	const triggers = document.querySelectorAll(trigger);
	if (!triggers.length) return;

	const destroyers = [];

	triggers.forEach((triggerEl) => {
		const items = triggerEl.querySelector(target);
		if (!items) return;

		

		/* text를 직접 전달하지 않으면 해당 항목의 data-text를 사용 */
		const marquee = items.closest('.marquee');
		const itemText = text || marquee?.dataset.text?.trim();
		if (!itemText) return;

		/* 기존 span이 없을 때만 텍스트를 한 번 생성 */
		if (!items.querySelector('.text')) {
			const fragment = document.createDocumentFragment();

			for (let i = 0; i < cnt; i++) {
				const span = document.createElement('span');
				span.className = 'text';
				span.textContent = itemText;
				fragment.appendChild(span);
			}

			items.appendChild(fragment);
		}

		let offset = 0;
		let gap = getMarqueeGap(items);
		let limit = items.scrollWidth + gap;
		let rafId = 0;
		let isHovered = false;
		let isInView = false;
		let isRunning = false;

		const updateMetrics = () => {
			gap = getMarqueeGap(items);
			limit = items.scrollWidth + gap;
		};

		const animate = () => {
			if (!isRunning) return;

			offset += speed;

			if (offset > limit / 2) {
				offset = 0;
				items.style.transform = 'translate3d(0, 0, 0)';
			} else {
				items.style.transform = `translate3d(${-offset}px, 0, 0)`;
			}

			rafId = requestAnimationFrame(animate);
		};

		const start = () => {
			if (isRunning || !isHovered || !isInView) return;
			isRunning = true;
			rafId = requestAnimationFrame(animate);
		};

		const stop = () => {
			if (!isRunning) return;
			isRunning = false;
			cancelAnimationFrame(rafId);
			rafId = 0;
		};

		const onEnter = () => {
			updateMetrics();
			isHovered = true;
			start();
		};

		const onLeave = () => {
			isHovered = false;
			stop();
		};

		triggerEl.addEventListener('mouseenter', onEnter);
		triggerEl.addEventListener('mouseleave', onLeave);

		let ro = null;
		if ('ResizeObserver' in window) {
			ro = new ResizeObserver(updateMetrics);
			ro.observe(items);
		} else {
			window.addEventListener('resize', updateMetrics);
		}

		let io = null;
		if ('IntersectionObserver' in window) {
			io = new IntersectionObserver(([entry]) => {
				isInView = entry.isIntersecting;
				isInView ? start() : stop();
			}, { threshold: 0 });
			io.observe(triggerEl);
		} else {
			/* 구형 브라우저에서는 hover 상태만으로 실행 */
			isInView = true;
		}

		destroyers.push(() => {
			stop();
			triggerEl.removeEventListener('mouseenter', onEnter);
			triggerEl.removeEventListener('mouseleave', onLeave);
			ro?.disconnect();
			io?.disconnect();

			if (!('ResizeObserver' in window)) {
				window.removeEventListener('resize', updateMetrics);
			}

			delete items.dataset.hoverMarqueeReady;
		});
	});

	return () => destroyers.forEach((destroy) => destroy());
}



/* [Swiper] - 스와이퍼
---------------------------------------- */
/* {cloneSwiperSlides} - 슬라이드 루프 복제 */
// 슬라이드 개수 부족 시 loop 안정화를 위해 복제
// EX) cloneSwiperSlides(swiperEl);
function cloneSwiperSlides(swiperEl) {
	if (!swiperEl) return;

	const wrapper = swiperEl.querySelector('.swiper-wrapper');
	if (!wrapper) return;

	/* · loop 복제본 제외하고 원본만 */
	const originals = Array.from(
		wrapper.querySelectorAll('.swiper-slide:not(.swiper-slide-duplicate)')
	);

	/* · 목표 슬라이드 개수
	   1개 → 6 / 2개 → 4 / 3개 → 6 / 4개 이상 → 복제 불필요 */
	const count = originals.length;
	const targetMap = { 1: 8, 2: 7, 3: 6 };
	const targetCount = targetMap[count];
	if (!targetCount) return;

	const currentCount = wrapper.querySelectorAll('.swiper-slide').length;
	const cloneNeeded = targetCount - currentCount;
	if (cloneNeeded <= 0) return;

	const fragment = document.createDocumentFragment();

	/* · 목표 개수까지 순환 복제 */
	for (let i = 0; i < cloneNeeded; i++) {
		const clone = originals[i % count].cloneNode(true);
		clone.setAttribute('aria-hidden', 'true');		/* 웹 접근성 */
		clone.classList.add('is-cloned');			 	/* 복제본 식별 */
		fragment.appendChild(clone);
	}

	wrapper.appendChild(fragment);
}

/* [Select Customer] - 셀렉트 커스텀
---------------------------------------- */
/* // EX) customSelect(target, {});
	customSelect('#mySelect',{
		size: 'medium'
	});
	customSelect(
		'#mySelect2', {
		size: 'medium',
		type: 'search', or check
	});
*/
function customSelect(target, settings={}){

	const config = {
		size	: '',
		type:   'basic',
		...settings,	
	}

	// 1. 타겟 확인
	const select = document.querySelector(target);
	if (!select || select.tagName !== 'SELECT') { // Select가 없거나 아닌 경우
		console.warn('[CustomSelect] <select> 엘리먼트가 필요합니다.');
		return null;
	}

	// 2. <option> 파싱
	const allOpts 	= [...select.options]; // 옵션을 배열로 구성
	const phOpts 	= allOpts.find(item => !item.value || item.value === "all")?.text || "선택해주세요."; // item(Option) 체크, 버튼 값
	const dataOpts 	= allOpts.map(item => ({
		value: item.value, 			// item(Option) value 값
		text: item.text.trim(), 	// item(Option) text 값
		disabled: item.disabled,	// item(Option) status 
		selected: item.selected,	// item(Option) Selected
	}));

	// 3. 커스텀 마크업 생성
	const wrap = document.createElement('div');
	wrap.classList.add('sel-custom');
	wrap.innerHTML = `
		<button type="button" class="sel-btn select ${config.size}">
			<span class="sel-val">${phOpts}</span>
		</button>

		<div class="sel-list">
			${config.type === "search" ? `
				<div class="sel-search">
					<input type="search" class="sel-inp" placeholder="검색어를 입력해주세요." />
				</div>
			` : "" }

			<ul>
				${dataOpts.map(item => `
					 <li>
						${config.type === 'check' ? `
						<label class="sel-chk">
							<input type="checkbox" class="checkbox" value="${item.value}">
							<span>${item.text}</span>
						</label>
						` : `
						<button type="button" data-value="${item.value}"
							class="sel-opts ${item.selected && item.value && item.value !== 'all' ? 'is-sel' : ''}">
							<span>${item.text}</span>
						</button>
						`}
					</li>
				`).join('')}
			</ul>

			${config.type === "check" ? `
				<button type="button"
					class="sel-check-btn">
					<span>Search</span>
				</button>
			` : ""}
		</div>
	`;

	// 4. 원본 <select> 숨기고 커스텀 UI 삽입
	select.style.display = "none";
	select.insertAdjacentElement('afterend', wrap);
	//console.log('[CustomSelect] 생성 완료', { phOpts, dataOpts });

	const selectedOpt = dataOpts.find(item => item.selected);
	if (selectedOpt) {
		wrap.querySelector('.sel-val').textContent = selectedOpt.text;
	}
	
	// 5. Click 클릭 이벤트
	const btn = wrap.querySelector('.sel-btn'); // 메인 Select
	btn.addEventListener("click", function(){
		wrap.classList.toggle('is-open');
	});

	const opts = wrap.querySelectorAll('.sel-opts'); // 옵션 클릭 시
	opts.forEach(opt => {
		opt.addEventListener('click', () => {
			const val 	= opt.dataset.value;
			const text 	= opt.querySelector('span').textContent;

			wrap.classList.remove('is-open');
			wrap.querySelector('.sel-val').textContent = text;

			// 원본 <select> options 중 value가 같은 것을 selected
			select.value = val;
			//console.log('[CustomSelect] 선택된 값:', select.value);
		});
	});

	// 외부 클릭 시
	document.addEventListener('click', (e) => {
		if (!wrap.contains(e.target)) {
			wrap.classList.remove('is-open');
		}
	});

	// 6. 검색 이벤트
	if (config.type === 'search') {
		const inp = wrap.querySelector('.sel-inp');

		inp.addEventListener('input', () => {
			const q = inp.value.toLowerCase();

			opts.forEach(opt => {
				const text = opt.querySelector('span').textContent.toLowerCase();
				opt.closest('li').hidden = !text.includes(q);
			});
		});
	}

	// 7. 체크박스 이벤트
	if (config.type === 'check') {
		const checks   = wrap.querySelectorAll('input[type="checkbox"]');
		const checkBtn = wrap.querySelector('.sel-check-btn');

		// URL 파라미터로 초기 체크 세팅
		const params   = new URLSearchParams(window.location.search);
		const paramVals = params.getAll(select.name); // 같은 name으로 여러 값 가져오기

		if (paramVals.length) {
			checks.forEach(chk => {
				chk.checked = paramVals.includes(chk.value);
			});

			// sel-val 초기값 세팅
			const checkedCount = [...checks].filter(c => c.checked).length;
			wrap.querySelector('.sel-val').textContent =  checkedCount ? `${checkedCount} Selected` : '체크해주세요.';
		}

		// 체크 시마다 sel-val 업데이트
		checks.forEach(chk => {
			chk.addEventListener('change', () => {
			const selected = [...checks].filter(c => c.checked);
			wrap.querySelector('.sel-val').textContent = selected.length
				? `${selected.length} Selected`
				: phOpts;
			});
		});

		// 검색 버튼 클릭 시 닫기 + 원본 <select> 동기화
		checkBtn.addEventListener('click', () => {
			const selected = [...checks]
			.filter(c => c.checked)
			.map(c => ({
				value: c.value,
				text:  c.closest('label').querySelector('span').textContent,
			}));

			[...select.options].forEach(o => {
				o.selected = selected.some(s => s.value === o.value);
			});

			wrap.classList.remove('is-open');
		});
	}

}