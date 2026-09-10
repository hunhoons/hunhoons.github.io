/* {GSAP Lib} - 이 페이지에서 사용하는 GSAP 플러그인 */
gsap.registerPlugin(ScrollTrigger, SplitText);
let mm = gsap.matchMedia();

/* {isLayoutReady} - header/footer include 완료 뒤 실행 */
function isLayoutReady() {
	/* <Nav Current> */
	isCurrent(1);

	/* <Layout GSAP Motions> */
	headerGsap();
	footerGsap();

	headerBgGsap();
	/*
		include로 삽입된 header/footer의 실제 높이가 브라우저에 반영된 다음,
		Lenis와 ScrollTrigger의 최초 위치를 한 번만 측정한다.
	*/
	requestAnimationFrame(() => {
		window.lenis?.resize();
		ScrollTrigger.refresh();
		document.body.classList.add('loaded');
		window.lenis?.start();
	});
}

/* {Lenis} - 초기 멈춤 */
window.lenis?.stop();

/* {isLayoutReady} - 함수 실행 */
typeof isLayoutPath === 'function'
	? isLayoutPath(isLayoutReady)
	: isLayoutReady();

/* [Document Ready] (DOM) */
/* Description: DOM 로드 시 실행 함수 */
$(function(){
	
	const page = document.querySelector('.sub.about');
	const about = {};


	function initVisual(){
		about.visual = page.querySelector('.section.visual');
		if(!about.visual) return;

		const heros 		= {};
		heros.canvasWrap	= about.visual.querySelector('.canvas-wrap');
		heros.canvas 		= about.visual.querySelector('#hero');
		if(!heros.canvas || !heros.canvasWrap) return;

		// 중복 초기화 방지 (다른 경로에서 initVisual이 실수로 두 번 불려도 안전)
		if (heros.canvas.dataset.heroReady === 'true') return;
		heros.canvas.dataset.heroReady = 'true';

		const prefersReducedMotion = false;

		/* ---------- 텍스트 캔버스 텍스처 ---------- */
		function makeTextTexture(word, bgColor, textColor) {
			const c = document.createElement('canvas');
			c.width = 1024; c.height = 220;
			const ctx = c.getContext('2d');
			ctx.fillStyle = bgColor;
			ctx.fillRect(0, 0, c.width, c.height);
			ctx.fillStyle = textColor;
			ctx.textAlign = 'center';
			ctx.textBaseline = 'middle';

			let fontSize = 160;
			ctx.font = `900 ${fontSize}px Pretendard, sans-serif`;
			while (ctx.measureText(word).width > c.width * 0.92 && fontSize > 20) {
				fontSize -= 4;
				ctx.font = `900 ${fontSize}px Pretendard, sans-serif`;
			}
			ctx.fillText(word, c.width / 2, c.height / 2 + 8);

			const tex = new THREE.CanvasTexture(c);
			tex.colorSpace = THREE.SRGBColorSpace;
			tex.anisotropy = 8;
			return tex;
		}

		/* ---------- 막대(판) 생성 ---------- */
		// BoxGeometry 대신 텍스트 면 4장을 X축 둘레에 90도 간격 배치
		// → 4면 모두 같은 공식이라 회전 중 뒤집힘 없음
		function buildBar(word, crossSectionSize) {
			const width = 6.4;
			const size = crossSectionSize;
			const r = size / 2;

			const faceColors = [
				{ bg: '#515151', text: '#F9F9F9' },
				{ bg: '#F9F9F9', text: '#515151' },
				{ bg: '#515151', text: '#F9F9F9' },
				{ bg: '#F9F9F9', text: '#515151' },
			];

			const group = new THREE.Group();

			faceColors.forEach(({ bg, text }, i) => {
				const angle = (Math.PI / 2) * i;
				const pivot = new THREE.Object3D();
				pivot.rotation.x = angle;
				group.add(pivot);

				const tex = makeTextTexture(word, bg, text);
				const mat = new THREE.MeshBasicMaterial({ map: tex }); // 무광, 조명 불필요
				const face = new THREE.Mesh(new THREE.PlaneGeometry(width, size), mat);
				face.position.y = r;
				face.rotation.x = -Math.PI / 2;
				pivot.add(face);
			});

			// 좌우 끝면 마감
			const endMat = new THREE.MeshBasicMaterial({ color: '#1c1c1c' });
			const endGeo = new THREE.PlaneGeometry(size, size);
			const endRight = new THREE.Mesh(endGeo, endMat);
			endRight.position.x = width / 2;
			endRight.rotation.y = Math.PI / 2;
			group.add(endRight);
			const endLeft = new THREE.Mesh(endGeo, endMat);
			endLeft.position.x = -width / 2;
			endLeft.rotation.y = -Math.PI / 2;
			group.add(endLeft);

			return group;
		}

		/* ---------- 씬 세팅 ---------- */
		const scene = new THREE.Scene();
		// scene.background를 안 정하면 캔버스가 투명해서 CSS 배경색이 비쳐 보임
		// (섹션 배경색 그대로 쓰고 싶으면 이대로, 캔버스 자체를 불투명하게 하고 싶으면 색 지정)

		const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100); // aspect는 resizeVisual에서 갱신
		camera.position.set(1.4, 1.0, 9);
		camera.lookAt(0, 0, 0);

		const renderer = new THREE.WebGLRenderer({ canvas: heros.canvas, antialias: true, alpha: true });
		renderer.outputColorSpace = THREE.SRGBColorSpace;

		/* ---------- 막대 3개 배치 ---------- */
		const BAR_SCALE = 0.82;
		const barsConfig = [
			{ word: '우리는',  size: 1, y: 1.3,  speed: 0.5 },
			{ word: '생존자',  size: 1, y: 0,    speed: 0.5 },
			{ word: '입니다.', size: 1, y: -1.3, speed: 0.5 },
		];
		const RISE_DISTANCE = 3;

		const bars = barsConfig.map((cfg) => {
			const bar = buildBar(cfg.word, cfg.size);
			bar.scale.setScalar(BAR_SCALE);
			bar.position.set(0, cfg.y * BAR_SCALE, 0);
			return { group: bar, speed: cfg.speed, targetY: cfg.y * BAR_SCALE };
		});
		bars.forEach(({ group }) => scene.add(group));

		/* ---------- 인트로 / 흔들림 모션 (GSAP) ---------- */
		const INTRO_DURATION = 1.1;
		if (!prefersReducedMotion) {
			bars.forEach(({ group, targetY }, i) => {
				gsap.fromTo(
					group.position,
					{ y: targetY - RISE_DISTANCE },
					{ y: targetY, duration: INTRO_DURATION, ease: 'power3.out', delay: i * 0.12 }
				);
			});

			const ROCK_ANGLE = 0.08;
			bars.forEach(({ group }, i) => {
				gsap.fromTo(
					group.rotation,
					{ z: -ROCK_ANGLE },
					{
						z: ROCK_ANGLE,
						duration: 2,
						ease: 'sine.inOut',
						yoyo: true,
						repeat: -1,
						delay: INTRO_DURATION + i * 0.12,
					}
				);
			});
		} else {
			// 모션 축소 설정이면 애니메이션 없이 바로 최종 위치로 세팅
			bars.forEach(({ group, targetY }) => { group.position.y = targetY; });
		}

		/* ---------- 스크롤 반응 회전 ---------- */
		// 이 프로젝트는 Lenis를 쓰므로, 네이티브 scroll 델타 계산 대신
		// Lenis가 매 프레임 계산해주는 velocity 값을 그대로 받아씀 (더 정확 + 가벼움)
		let scrollBoost = 0;
		if (window.lenis) {
			window.lenis.on('scroll', (e) => {
				scrollBoost += e.velocity * 0.02;
			});
		} else {
			// Lenis가 아직 안 붙었을 때를 대비한 네이티브 폴백
			window.addEventListener('scroll', () => {
				const delta = window.scrollY - (heros._lastScrollY || 0);
				heros._lastScrollY = window.scrollY;
				scrollBoost += delta * 0.003;
			}, { passive: true });
		}

		/* ---------- 리사이즈 (컨테이너 기준) ---------- */
		// window가 아니라 .canvas-wrap 실제 크기 기준 → 히어로가 뷰포트 전체가 아니어도 정확
		function resizeVisual() {
			const w = heros.canvasWrap.clientWidth;
			const h = heros.canvasWrap.clientHeight;
			if (!w || !h) return;

			camera.aspect = w / h;

			// 모바일(좁은 화면)은 고해상도 디스플레이 픽셀비를 다 반영하면 부담 커서 상한 더 낮게
			const isMobile = w < 768;
			renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1.5 : 2));
			renderer.setSize(w, h, false); // false: 캔버스 CSS 크기는 그대로, 내부 해상도만 갱신

			// 좁은 화면에서 막대(가로폭 6.4 고정)가 안 잘리도록, 세로가 긴 비율일수록 카메라를 뒤로 뺌
			camera.position.z = camera.aspect < 1 ? 9 / camera.aspect * 0.85 : 9;
			camera.updateProjectionMatrix();
			camera.lookAt(0, 0, 0);
		}

		// ResizeObserver: window resize뿐 아니라 반응형 레이아웃 전환/폰트 로드로 인한
		// 컨테이너 자체 높이 변화에도 반응 (window resize 이벤트만으로는 못 잡는 케이스)
		new ResizeObserver(resizeVisual).observe(heros.canvasWrap);
		resizeVisual(); // 최초 1회

		/* ---------- 렌더 루프 (화면에 보일 때만 실행) ---------- */
		const clock = new THREE.Clock();
		let rafId = null;

		function animate() {
			rafId = requestAnimationFrame(animate);
			const delta = clock.getDelta();

			if (!prefersReducedMotion) {
				bars.forEach(({ group, speed }) => {
					group.rotation.x += delta * speed;
					group.rotation.x += scrollBoost * 0.03;
				});
				scrollBoost *= 0.88;
			}

			renderer.render(scene, camera);
		}

		// 히어로가 뷰포트에서 완전히 벗어나면 루프 자체를 멈춰서
		// 스크롤 내려간 뒤엔 불필요한 렌더링/GPU 사용을 안 하게 함
		new IntersectionObserver((entries) => {
			entries.forEach((entry) => {
				if (entry.isIntersecting) {
					if (!rafId) { clock.start(); animate(); }
				} else {
					if (rafId) cancelAnimationFrame(rafId);
					rafId = null;
				}
			});
		}, { threshold: 0 }).observe(heros.canvasWrap);

		animate(); // 최초 로드 시점은 대부분 화면 안이므로 바로 시작




		heros.textArea		= about.visual.querySelector('.text-area');
		heros.textWrap		= about.visual.querySelector('.text-wrap');
		heros.text			= about.visual.querySelectorAll('.text span');


		

		// gsap.to	(heros.textWrap, { 
		// 	autoAlpha: 1,
		// 	scrollTrigger: {
		// 		trigger: heros.textArea,
		// 		start: 'top top',
		// 		toggleActions: 'play none none reverse',
		// 	},
		// });


		gsap.set(heros.textWrap, { 
			autoAlpha: 0
		});
		gsap.set(heros.text, { 
			autoAlpha: 1, 
			backgroundPositionX: '100%',
		});

		heros.txtTl = gsap.timeline({
			scrollTrigger: {
				trigger: heros.textArea,
				pin: heros.textWrap,
				scrub: true,
				invalidateOnRefresh: true,
				start: 'top top',
				end: 'bottom bottom',
				//markers: true,
			}
		});


		heros.txtTl.to(heros.textWrap, { 
			autoAlpha: 1, 
			duration: 0.8,
		});
	
		heros.text.forEach(line => line.classList.add('fills'));
		heros.text.forEach( (line, idx) => {
			heros.txtTl.to(line, {
				backgroundPositionX: '0%',
				ease: 'none',
				duration: 1,   
			});
		});
	}
	initVisual();



	/* <Section Gradient Function> - 모션 함수 */
	function initGradient(){
		about.gradient = page.querySelector('.section.gradient');
		if(!about.gradient) return;

		const gradients = {};
		gradients.area = about.gradient.querySelector('.img-area');
		
		gsap.set( gradients.area, { transform: 'rotatex(90deg)', });
		gsap.to	( gradients.area, {
			transform: 'rotatex(0deg)',
			scrollTrigger: {
				trigger: about.gradient,
				start: 'top bottom',
				end: 'bottom 30%',
				scrub: true,
				invalidateOnRefresh: true,
			},
		});
	}
	initGradient();



	function initThought() {
		const section       = document.querySelector('.section.thought');
		if (!section) return;

		const thoughtArea  = section.querySelector('.thought-area');
		const thoughtInner = section.querySelector('.thought-inner');
		const wraps        = section.querySelectorAll('.thought-wrap');
		const [wrap01, wrap02, wrap03] = wraps;
		if (!thoughtArea || !thoughtInner || !wrap01 || !wrap02 || !wrap03) return;

		const prefersReducedMotion = false; 

		// 본문 텍스트(<p class="text">): 타이틀 노출이 끝난 뒤 통으로 autoAlpha 0→1,
		// 그 안의 줄(span)들은 fills 클래스로 배경이 오른쪽→왼쪽 채워지는 효과
		function getTextEl(wrapEl) {
			return wrapEl.querySelector('.text-wrap .text');
		}
		function getTextLines(textEl) {
			return textEl ? Array.from(textEl.querySelectorAll(':scope > span')) : [];
		}

		const text01 = getTextEl(wrap01);
		const text02 = getTextEl(wrap02);
		const text03 = getTextEl(wrap03); // ★ matter 낙하 뒤에 노출
		const lines01 = getTextLines(text01);
		const lines02 = getTextLines(text02);
		const lines03 = getTextLines(text03);

		gsap.set([text01, text02, text03], { autoAlpha: 0 });
		[...lines01, ...lines02, ...lines03].forEach(line => line.classList.add('fills'));
		gsap.set([...lines01, ...lines02, ...lines03], { backgroundPositionX: '100%' });

		/* ---------- title 전체를 SplitText로 단어 단위 분리 ---------- */
		// .svg-box(아이콘 <i class="ico">)는 텍스트가 아니라 그래픽 포인트라 따로 분리해서 다른 모션(pop)을 준다.
		// 아이콘은 텍스트 노드가 없어서 SplitText가 word로 잡아주지 않으므로 직접 찾고,
		// 문장 안에서의 순서(= 앞에 오는 단어 개수)로 stagger 위치를 계산한다.
		function splitTitleWords(titleEl) {
			if (!titleEl) return { text: [], star: null, starIndex: -1 };
			const words = new SplitText(titleEl, { type: 'words' }).words;
			const star = titleEl.querySelector('.svg-box');
			const starIndex = star
				? words.filter(w => w.compareDocumentPosition(star) & Node.DOCUMENT_POSITION_FOLLOWING).length
				: -1;
			return { text: words, star, starIndex };
		}

		const title01 = wrap01.querySelector('.title');
		const title02 = wrap02.querySelector('.title');
		const group01 = splitTitleWords(title01);
		const group02 = splitTitleWords(title02);
		const stars01 = [group01.star].filter(Boolean);
		const stars02 = [group02.star].filter(Boolean);

		gsap.set([wrap02, wrap03], { autoAlpha: 0 });
		gsap.set([...group01.text, ...group02.text], { filter: 'blur(12px)', autoAlpha: 0, y: 20, scale: 0.94 });
		gsap.set([...stars01, ...stars02], { autoAlpha: 0, scale: 0.4, rotation: -25 });

		if (prefersReducedMotion) {
			gsap.set([...group01.text, ...group02.text, ...stars01, ...stars02], {
				filter: 'blur(0px)', autoAlpha: 1, y: 0, scale: 1, rotation: 0,
			});
			gsap.set([text01, text02, text03], { autoAlpha: 1 });
			gsap.set([...lines01, ...lines02, ...lines03], { backgroundPositionX: '0%' });
			gsap.set(wrap01, { autoAlpha: 0 });
			gsap.set(wrap03, { autoAlpha: 1 });
		}

		// 문장 워드는 블러+살짝 스케일로 담백하게, ★는 스케일+회전 pop으로 포인트를 준다
		// (원래 그 자리에 있었을 시점 = starIndex * stagger 만큼 늦춰서 끼워 넣음)
		// 반환값 = 타이틀 등장이 끝나는 시점(초) → 텍스트를 그 뒤에 이어붙이기 위해 씀
		function revealTitle(group, label, stagger = 0.3) {
			const wordDuration = 0.7;
			tl.addLabel(label);
			tl.to(group.text, {
				filter: 'blur(0px)', autoAlpha: 1, y: 0, scale: 1,
				duration: wordDuration, stagger, ease: 'power2.out',
			}, label);

			let starEnd = 0;
			if (group.star) {
				const starDelay = group.starIndex * stagger;
				const starDuration = 0.8;
				tl.to(group.star, {
					autoAlpha: 1, scale: 1, rotation: 0,
					duration: starDuration, ease: 'back.out(2)',
				}, `${label}+=${starDelay}`);
				starEnd = starDelay + starDuration;
			}

			const textWordsEnd = group.text.length ? (group.text.length - 1) * stagger + wordDuration : 0;
			return Math.max(textWordsEnd, starEnd);
		}

		// visual 섹션과 동일하게, 줄이 stagger로 겹쳐서 한꺼번에 차오르지 않고
		// 한 줄이 다 채워진 뒤에 다음 줄이 시작되도록 순차 진행
		function revealLinesSequential(lines, duration = 1) {
			lines.forEach(line => {
				tl.to(line, { backgroundPositionX: '0%', ease: 'none', duration });
			});
		}


		/* ---------- 마스터 타임라인 (pin + scrub) ---------- */
		const tl = gsap.timeline({
			scrollTrigger: {
				trigger: thoughtArea,
				pin: thoughtInner,
				start: 'top top',
				end: 'bottom bottom',
				scrub: true,
				invalidateOnRefresh: true,
				//markers: true,
			},
		});

		if (!prefersReducedMotion) {
			// ── 01 등장: 타이틀이 빠르게 블러-인 된 다음, 본문 텍스트가 autoAlpha 0→1 + 줄별 fills ──
			const end01 = revealTitle(group01, 'title01In', 0.5); // "진짜를 ★ 보여드리죠" 조금 더 느리게 (0.3 → 0.42 → 0.5)
			tl.to(text01, { autoAlpha: 1, duration: 0.4, ease: 'none' }, `title01In+=${end01 + 0.15}`);
			revealLinesSequential(lines01, 0.6); // 이 앞쪽(01/02)이 스크럽 타임라인 비중을 너무 차지하면
			// matter 낙하 대기 구간의 실제 스크롤 거리가 줄어서 물리가 덜 끝난 채로 텍스트가 겹쳐 보임 → 라인 채우기 속도업
			tl.to({}, { duration: 1 }) // 노출 유지 구간
				.to(wrap01, { autoAlpha: 0, duration: 0.5, ease: 'none' })

				// ── 02 등장 ──
				.set(wrap02, { autoAlpha: 1 });
			const end02 = revealTitle(group02, 'title02In');
			tl.to(text02, { autoAlpha: 1, duration: 0.4, ease: 'none' }, `title02In+=${end02 + 0.15}`);
			revealLinesSequential(lines02, 0.6);
			tl.to({}, { duration: 1 })
				.to(wrap02, { autoAlpha: 0, duration: 0.5, ease: 'none' })

				// ── 03 등장: matter 낙하가 먼저, 어느 정도 떨어진 뒤 text-wrap 노출 ──
				// (이 지점보다 위로 다시 스크롤해서 벗어나면 물리를 정리 → 다음에 내려올 때 처음부터 재생)
				.set(wrap03, { autoAlpha: 1 })
				.call(() => {
					if (tl.scrollTrigger.direction === -1) teardownMatter();
					else releaseMatter();
				})
				.to({}, { duration: 2 }) // matter 낙하 대기 구간
				.to(text03, { autoAlpha: 1, duration: 0.8, ease: 'none' });
			revealLinesSequential(lines03);
		} else {
			tl.set(wrap01, { autoAlpha: 0 })
			.set(wrap02, { autoAlpha: 0 })
			.set(wrap03, { autoAlpha: 1 })
			.call(() => releaseMatter());
		}


		/* ---------- 여기서부터 Matter.js 낙하 (기존 코드 거의 동일, start() 호출부만 분리) ---------- */
		const matterArea = section.querySelector('.matter-area');
		const matterWrap = section.querySelector('#matterFall');
		if (!matterArea || !matterWrap || typeof Matter === 'undefined') return;
		if (matterWrap.dataset.matterReady === 'true') return;
		matterWrap.dataset.matterReady = 'true';

		const { Engine, World, Bodies, Body, Runner, Mouse, MouseConstraint, Events, Composite } = Matter;
		const chars = [...matterWrap.querySelectorAll('[data-char]')];

		let releaseMatter = () => {}; // 기본값 (chars 없으면 그냥 아무것도 안 함)
		let teardownMatter = () => {}; // 트리거 지점보다 위로 스크롤해서 벗어나면 물리 정리

		if (chars.length) {
			const WALL_SIZE = 160;
			const MAX_SPEED = 32;
			const MAX_ANGULAR_SPEED = 0.3;
			const bodyOptions = { friction: 0.7, frictionAir: 0.012, restitution: 0.18 };
			const wallOptions = { isStatic: true, friction: 1, restitution: 0 };

			let engine, runner, walls = [], items = [], resizeTimer;
			let resizeObserver, intersectionObserver, rafId = null, isVisible = true;
			let mouseRef = null, mouseConstraint = null;
			let started = false; // ★ 중복 start 방지
			let teardownTween = null; // 사라지는 중인 페이드 트윈 (빠르게 다시 내려올 때 처리용)

			function getSize() {
				return { width: matterArea.clientWidth, height: matterArea.clientHeight };
			}

			function makeWalls(width, height) {
				const top = -Math.max(height, 600) - WALL_SIZE / 2;
				return [
					Bodies.rectangle(width / 2, height + WALL_SIZE / 2, width + WALL_SIZE * 2, WALL_SIZE, wallOptions),
					Bodies.rectangle(-WALL_SIZE / 2, height / 2, WALL_SIZE, height * 3, wallOptions),
					Bodies.rectangle(width + WALL_SIZE / 2, height / 2, WALL_SIZE, height * 3, wallOptions),
					Bodies.rectangle(width / 2, top, width + WALL_SIZE * 2, WALL_SIZE, wallOptions),
				];
			}

			function createBodies(width) {
				return chars.map((char, index) => {
					const rect = char.getBoundingClientRect();
					const itemWidth = rect.width;
					const itemHeight = rect.height;
					const x = Math.random() * Math.max(1, width - itemWidth) + itemWidth / 2;
					const y = -itemHeight - index * 55;
					const body = Bodies.rectangle(x, y, itemWidth * 0.96, itemHeight * 0.96, bodyOptions);
					Body.setAngle(body, (Math.random() - 0.5) * 0.8);

					char.classList.add('is-matter');
					char.style.width = `${itemWidth}px`;
					char.style.height = `${itemHeight}px`;

					return { body, element: char, width: itemWidth, height: itemHeight };
				});
			}

			function syncDom() {
				if (!isVisible) { rafId = null; return; }
				rafId = requestAnimationFrame(syncDom);
				items.forEach(({ body, element, width, height }) => {
					element.style.transform =
						`translate3d(${body.position.x - width / 2}px, ${body.position.y - height / 2}px, 0) rotate(${body.angle}rad)`;
				});
			}

			function limitSpeed() {
				items.forEach(({ body }) => {
					if (body.speed > MAX_SPEED) {
						const scale = MAX_SPEED / body.speed;
						Body.setVelocity(body, { x: body.velocity.x * scale, y: body.velocity.y * scale });
					}
					if (Math.abs(body.angularVelocity) > MAX_ANGULAR_SPEED) {
						Body.setAngularVelocity(body, Math.sign(body.angularVelocity) * MAX_ANGULAR_SPEED);
					}
				});
			}

			function refreshWalls() {
				const { width, height } = getSize();
				if (!width || !height || !engine) return;
				World.remove(engine.world, walls);
				walls = makeWalls(width, height);
				World.add(engine.world, walls);
			}

			function rebuild() {
				clearTimeout(resizeTimer);
				resizeTimer = setTimeout(() => {
					const { width, height } = getSize();
					if (!width || !height || !engine) return;
					refreshWalls();
					items.forEach(({ body }, index) => {
						if (body.position.x > width) Body.setPosition(body, { x: width - 20, y: body.position.y });
						if (body.position.y > height + 100) {
							Body.setPosition(body, { x: Math.min(width - 20, body.position.x), y: height - 100 - index * 10 });
						}
					});
				}, 180);
			}

			function startMatter() {
				if (started) return; // ★ 스크롤 왔다갔다해서 call()이 여러 번 실행돼도 한 번만 시작
				started = true;

				if (teardownTween) {
					// 사라지는 페이드가 채 끝나기 전에 다시 내려온 경우 → 즉시 정리하고 새로 시작
					teardownTween.kill();
					teardownTween = null;
					chars.forEach((char) => {
						char.classList.remove('is-matter');
						char.style.transform = '';
						char.style.width = '';
						char.style.height = '';
					});
					gsap.set(chars, { autoAlpha: 1 });
				}

				const { width, height } = getSize();
				if (!width || !height) return;

				engine = Engine.create({ gravity: { x: 0, y: 1.15 }, enableSleeping: true });
				walls = makeWalls(width, height);
				items = createBodies(width);
				World.add(engine.world, [...walls, ...items.map(({ body }) => body)]);

				// 모바일/태블릿은 드래그 미사용 (main.js의 matter 섹션과 동일하게 데스크톱에서만 Mouse/MouseConstraint 구성)
				if (window.innerWidth > 1024) {
					matterWrap.style.touchAction = 'none';
					mouseRef = Mouse.create(matterWrap);
					mouseRef.element.removeEventListener('mousewheel', mouseRef.mousewheel);
					mouseRef.element.removeEventListener('DOMMouseScroll', mouseRef.mousewheel);
					mouseRef.element.removeEventListener('wheel', mouseRef.mousewheel);

					mouseConstraint = MouseConstraint.create(engine, {
						mouse: mouseRef,
						constraint: { stiffness: 0.2, damping: 0.5, render: { visible: false } },
					});
					World.add(engine.world, mouseConstraint);
				}

				Events.on(engine, 'beforeUpdate', limitSpeed);

				runner = Runner.create();
				Runner.run(runner, engine);

				resizeObserver = new ResizeObserver(rebuild);
				resizeObserver.observe(matterArea);
				window.addEventListener('resize', rebuild, { passive: true });

				intersectionObserver = new IntersectionObserver(([entry]) => {
					isVisible = entry.isIntersecting;
					if (isVisible && rafId === null) syncDom();
					if (!isVisible && rafId !== null) { cancelAnimationFrame(rafId); rafId = null; }
				}, { rootMargin: '200px 0px' });
				intersectionObserver.observe(matterArea);

				syncDom();
			}

			// 트리거 지점보다 위로 스크롤해서 다시 벗어나면 물리/리스너를 통째로 정리하고,
			// 캐릭터는 원래 정적 위치로 되돌려서 다음에 다시 내려올 때 처음부터 재생되게 함.
			// 갑자기 뚝 사라지면 어색하니, 지금 떨어져 있는 자리에서 살짝 페이드아웃한 뒤에 정리한다.
			function teardownMatterImpl() {
				if (!started) return;
				started = false;

				cancelAnimationFrame(rafId);
				rafId = null;

				resizeObserver?.disconnect();
				window.removeEventListener('resize', rebuild);
				intersectionObserver?.disconnect();

				Events.off(engine, 'beforeUpdate', limitSpeed);
				if (mouseRef) Mouse.clearSourceEvents(mouseRef);
				Runner.stop(runner);
				World.clear(engine.world, false);
				Engine.clear(engine);

				const els = items.map(({ element }) => element);
				teardownTween = gsap.to(els, {
					autoAlpha: 0, duration: 0.4, ease: 'power1.out',
					onComplete: () => {
						els.forEach((element) => {
							element.classList.remove('is-matter');
							element.style.transform = '';
							element.style.width = '';
							element.style.height = '';
						});
						gsap.set(els, { autoAlpha: 1 }); // 다음 낙하 때 다시 보이도록 원복
						teardownTween = null;
					},
				});

				items = [];
				walls = [];
			}

			releaseMatter = startMatter; // ★ 위 master timeline의 .call()이 이 함수를 부름
			teardownMatter = teardownMatterImpl;

			if (prefersReducedMotion) {
				// 모션 축소면 물리 없이 그냥 바로 정적 배치
				releaseMatter = () => {}; // 물리 시작 자체를 막음
				teardownMatter = () => {};
				chars.forEach((char) => char.classList.add('is-matter')); // 필요시 정적 스타일만 적용
			}
		}
	}


	initThought();







































	/* <Section Ours Function> - 모션 함수 */
	function initOurs(){
		about.ours = page.querySelector('.section.ours');
		if(!about.ours) return;

		const ours = {};
		ours.imagesArea = about.ours.querySelector('.img-area');
		ours.imagesWrap = ours.imagesArea.querySelector('.img-wrap');
		ours.images 	= ours.imagesArea.querySelectorAll('img');

		ours.tl = gsap.timeline({
			scrollTrigger:{
				trigger: about.ours,
				start: 'top top',
				end: 'bottom bottom',
				scrub : true,
				pin: ours.imagesArea,
				invalidateOnRefresh: true,
				//markers: true,
			}
		});
		ours.images.forEach((img, idx) => {
			if (idx === 0) return;

			gsap.set(img, { autoAlpha: 0, scale: 1.1, })
			ours.tl.to(img, {
				autoAlpha: 1,
				scale: 1,
				ease    : 'none',
				duration: 0.2,
			});
		});

		fadeUpGsap();
	}
	initOurs();
});