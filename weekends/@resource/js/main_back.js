	/* {GSAP Lib} - GSAP 모션 실행 함수 */
		gsap.registerPlugin(ScrollTrigger, SplitText, ScrambleTextPlugin); 	// 라이브러리 실행
		let mm = gsap.matchMedia(); 					// 미디어 쿼리
		
		/* {isLayoutReady} - 레이아웃(헤더/푸터)이 준비된 시점에 실행 */
		function isLayoutReady(){

			/* <Nav Current> */
			isCurrent(0); 						// 현재 메뉴 위치

			/* <Layout GSAP Motions> */
			headerGsap();						// GSAP Header Motions
			footerGsap();						// GSAP Footer Motions
			headerBgGsap();						// GSAP Header BG Toggle Motions (data-gsap="bg-white")

		
			/* <Browser Event> */
			const body = document.body;
			body.classList.remove('loaded'); 	// 있다면 초기화 후
			body.classList.add('loaded'); 	 	// 초기화 이후 로드

			/* <Lenis Scroll> */
			window.lenis?.stop(); 				// 초기 무조건 정지

			if (window.lenis) {					// Lenis Scroll Load
				window.lenis.stop();		
				window.lenis.start();
			}
		}

		/* {isLayoutPath} - 레이아웃 불러오기 */
		typeof isLayoutPath === 'function'
			? isLayoutPath(isLayoutReady) 		// 있다면 로드 후 실행
			: isLayoutReady();					// 없다면 바로 실행


		/* [Document Ready] (DOM) */
		/* Description: DOM 로드 시 실행 함수 */
		$(function(){			
		
			/* {scrambleText} - 한글/영문 스크럼블(글자가 랜덤하게 돌다가 확정), 실시간 재생 타임라인 반환
   SplitText로 글자를 쪼개지 않고, 원본 텍스트 전체를 한 번에 스크럼블 -> 개별 등장 없이 통째로 흔들림 */
function scrambleText(el, opts = {}){
	const { spinCount = 14, duration = 0.4 } = opts;
	const FLIP_HANGUL = ['가','나','다','라','마','바','사','아','자','차','카','타','파','하'];
	const FLIP_LATIN  = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ!@#$%^&';
	const HANGUL_START = 0xAC00, HANGUL_END = 0xD7A3;

	const original = el.textContent;
	const counter = { v: 0 };
	const tl = gsap.timeline();

	tl.to(counter, {
		v: spinCount,
		duration, ease: 'none',
		onUpdate: () => {
			const step = Math.floor(counter.v);
			el.textContent = original.split('').map((ch, i) => {
				const code = ch.charCodeAt(0);
				const isHangul = code >= HANGUL_START && code <= HANGUL_END;
				const isLatin  = /[a-zA-Z]/.test(ch);
				if (!isHangul && !isLatin) return ch;

				const flipChars = isHangul ? FLIP_HANGUL : FLIP_LATIN;
				const c = flipChars[(step + i) % flipChars.length];
				return isHangul ? c : (ch === ch.toLowerCase() ? c.toLowerCase() : c);
			}).join('');
		},
		onComplete: () => { el.textContent = original; },
		onReverseComplete: () => { el.textContent = original; },
	});
	return tl;
}

/* <Section Visual Motion> - 모션 함수 */
function initVisual(){
	const visual = document.querySelector('.section.visual');
	if(!visual) return;

	const heros = {};

	// Canvas (도형)
	heros.canvaWrap = visual.querySelector('.canvas-wrap');
	heros.canva 	= heros.canvaWrap.querySelector('#heros');
	ScrollTrigger.create({
		trigger: visual,
		start: 'top top',
		pin: heros.canvaWrap,
		pinSpacing: false,
	});

	gsap.set(heros.canva, { scale: 1, autoAlpha: 1 });
	gsap.to(heros.canva, {
		scrollTrigger: {
			trigger: visual,
			start: '80% 95%',
			scrub: true,
			invalidateOnRefresh: true,
		},
		scale: 2,
		autoAlpha: 0,
	})

	// Weekends (로고)
	heros.logo = visual.querySelector('.img-wrap')
	gsap.set(heros.logo, { yPercent: 0, })
	gsap.to(heros.logo,{
		scrollTrigger: {
			trigger: visual,
			start: 'top top',
			scrub: true,
			invalidateOnRefresh: true,
		},
		yPercent: 65,
		duration: 1
	});

	// Shape Text (텍스트)
	heros.shape 		= visual.querySelector('.shape-area');
	heros.shapeInner 	= visual.querySelector('.shape-inner');
	ScrollTrigger.create({
		trigger: heros.shape,
		start: 'top top',
		end: 'bottom bottom',
		pin: heros.shapeInner,
	});

	heros.shapeWraps = heros.shape.querySelectorAll('.shape-wrap');
	gsap.set(heros.shapeWraps, { autoAlpha: 0 });

	const shapeTl = gsap.timeline({
		scrollTrigger: {
			trigger: heros.shape,
			start: 'top top',
			end: 'bottom bottom',
			scrub: true,
		},
	});

	const SHAPE_FADE = 0.1;
	const SHAPE_HOLD = 2;
	const SHAPE_SLOT = SHAPE_FADE + SHAPE_HOLD + SHAPE_FADE;

	heros.shapeWraps.forEach((wrap, i) => {
		const isLast = i === heros.shapeWraps.length - 1;
		const start = i * SHAPE_SLOT;

		shapeTl.to(wrap, { autoAlpha: 1, duration: SHAPE_FADE }, start);

		if (!isLast) {
			shapeTl.to(wrap, { autoAlpha: 0, duration: SHAPE_FADE }, start + SHAPE_SLOT - SHAPE_FADE);
		}
	});

	const shapeStart = wrap => Array.prototype.indexOf.call(heros.shapeWraps, wrap) * SHAPE_SLOT;

	const changesWraps = [...heros.shapeWraps].filter(wrap => wrap.classList.contains('changes'));

	function buildBlurEffect(wrap){
		const targets = wrap.querySelectorAll('.title, .desc');
		const tl = gsap.timeline({ paused: true });
		tl.fromTo(targets,
			{ filter: 'blur(24px)', autoAlpha: 0 },
			{ filter: 'blur(0px)', autoAlpha: 1, duration: 1.5, ease: 'power2.out', stagger: 0.12 }
		);
		return tl;
	}

	function buildScrambleEffect(wrap){
		const title = wrap.querySelector('.title strong') || wrap.querySelector('.title');
		const desc  = wrap.querySelector('.desc span') || wrap.querySelector('.desc');
		const tl = gsap.timeline({ paused: true });
		tl.add(scrambleText(title, { duration: 0.8 }));
		tl.add(scrambleText(desc,  { duration: 0.8 }), '<');
		return tl;
	}

	function buildRiseEffect(wrap){
		if (wrap._riseSplit) wrap._riseSplit.forEach(s => s.revert());

		const title = wrap.querySelector('.title');
		const desc  = wrap.querySelector('.desc');
		const splitTitle = new SplitText(title, { type: 'words' });
		const splitDesc  = new SplitText(desc,  { type: 'words' });
		wrap._riseSplit = [splitTitle, splitDesc];

		const tl = gsap.timeline({ paused: true });
		tl.fromTo([...splitTitle.words, ...splitDesc.words],
			{ clipPath: 'inset(100% 0% 0% 0%)', y: 24 },
			{ clipPath: 'inset(0% 0% 0% 0%)', y: 0, duration: 1.5, ease: 'power3.out', stagger: 0.1 }
		);
		return tl;
	}

	const CHANGES_EFFECTS = [buildBlurEffect, buildScrambleEffect, buildRiseEffect];
	const changesTls = new Array(changesWraps.length).fill(null);

	let activeChangesIndex = -1;
	shapeTl.eventCallback('onUpdate', () => {
		const t = shapeTl.time();
		const idx = changesWraps.findIndex(wrap => {
			const s = shapeStart(wrap);
			return t >= s && t < s + SHAPE_SLOT;
		});
		if (idx === activeChangesIndex) return;

		if (activeChangesIndex !== -1 && changesTls[activeChangesIndex]) {
			changesTls[activeChangesIndex].reverse();
		}
		activeChangesIndex = idx;

		if (idx !== -1) {
			if (changesTls[idx]) changesTls[idx].kill();
			changesTls[idx] = CHANGES_EFFECTS[idx](changesWraps[idx]);
			changesTls[idx].play();
		}
	});

	heros.shape.querySelectorAll('.shape-wrap.lines').forEach(wrap => {
		const lines = wrap.querySelectorAll('.text span');
		if (!lines.length) return;

		lines.forEach(line => line.classList.add('fills'));
		gsap.set(lines, { autoAlpha: 1, backgroundPositionX: '100%' });

		const start = shapeStart(wrap);
		const lineDuration = SHAPE_HOLD / lines.length;
		lines.forEach((line, li) => {
			shapeTl.to(line, {
				backgroundPositionX: '0%',
				duration: lineDuration,
			}, start + SHAPE_FADE + li * lineDuration);
		});
	});

	/* {Lazy Init} - Three.js 씬은 섹션이 뷰포트 근처에 올 때만 생성 (초기 로딩 부담 감소) */
	const lazyIO = new IntersectionObserver((entries) => {
		if (entries[0].isIntersecting) {
			initVisualShapes(visual);
			lazyIO.disconnect();
		}
	}, { rootMargin: '200px' });
	lazyIO.observe(visual);


	console.log(window.matchMedia('(prefers-reduced-motion: reduce)').matches);
}
initVisual();


/* Three.js 배경 Canvas */
function initVisualShapes(visual){
	if(!visual) return;

	if (typeof THREE === 'undefined') {
		window.addEventListener('three:ready', () => initVisualShapes(visual), { once: true });
		return;
	}

	const canvas = visual.querySelector('.canvas-wrap #heros');
	if (!canvas) return;

	const isCoarsePointer = window.matchMedia('(pointer: coarse)').matches;
	const SHAPE_COUNT = isCoarsePointer ? 8 : 16;
	const MAX_SIZE_PX = 160;
	const prefersReducedMotion = false;
	const SVG_NAMES = Array.from({ length: 10 }, (_, i) => `matter${i + 1}-w.svg`); // 흰색 SVG - 캔버스 재채색 연산 불필요

	function randomRange(min, max) { return min + Math.random() * (max - min); }

	const scene = new THREE.Scene();
	const wrap = canvas.parentElement;
	let width = wrap.clientWidth, height = wrap.clientHeight;

	const camera = new THREE.PerspectiveCamera(35, width / height, 0.1, 100);
	camera.position.set(0, 0, 9);

	const renderer = new THREE.WebGLRenderer({
		canvas,
		antialias: !isCoarsePointer,       // 모바일이면 끔
		alpha: true,
		powerPreference: 'high-performance',
	});
	renderer.setSize(width, height);
	renderer.setPixelRatio(isCoarsePointer ? 1 : Math.min(window.devicePixelRatio, 2));

	let visibleHalfHeight, visibleHalfWidth, SPAWN_X, SPAWN_Y;
	function updateVisibleBounds() {
		visibleHalfHeight = camera.position.z * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
		visibleHalfWidth = visibleHalfHeight * camera.aspect;
		SPAWN_Y = visibleHalfHeight + 2.5;
		SPAWN_X = visibleHalfWidth + 2.5;
	}
	updateVisibleBounds();

	function pxToWorldSize(px, distanceFromCamera) {
		const vFov = THREE.MathUtils.degToRad(camera.fov);
		const visibleHeightAtDist = 2 * Math.tan(vFov / 2) * distanceFromCamera;
		const pixelsPerWorldUnit = height / visibleHeightAtDist;
		return px / pixelsPerWorldUnit;
	}

	function randomSideX() {
		const side = Math.random() < 0.5 ? -1 : 1;
		return side * randomRange(visibleHalfWidth * 0.25, visibleHalfWidth * 0.95);
	}
	function randomSideY() {
		const side = Math.random() < 0.5 ? -1 : 1;
		return side * randomRange(visibleHalfHeight * 0.25, visibleHalfHeight * 0.95);
	}

	const FLIGHT_DIRS = [
		{ dx: 0, dy: -1 }, { dx: 0, dy: 1 }, { dx: 1, dy: 0 }, { dx: -1, dy: 0 },
		{ dx: 1, dy: -1 }, { dx: 1, dy: 1 }, { dx: -1, dy: -1 }, { dx: -1, dy: 1 },
	];
	function pickFlightPath() {
		const { dx, dy } = FLIGHT_DIRS[Math.floor(Math.random() * FLIGHT_DIRS.length)];
		const jitterX = dx !== 0 ? randomRange(-SPAWN_X * 0.4, SPAWN_X * 0.4) : 0;
		const jitterY = dy !== 0 ? randomRange(-SPAWN_Y * 0.4, SPAWN_Y * 0.4) : 0;
		const fromX = dx !== 0 ? -dx * SPAWN_X + jitterX : randomSideX();
		const fromY = dy !== 0 ? -dy * SPAWN_Y + jitterY : randomSideY();
		const toX   = dx !== 0 ?  dx * SPAWN_X + jitterX : null;
		const toY   = dy !== 0 ?  dy * SPAWN_Y + jitterY : null;
		return { fromX, fromY, toX, toY };
	}

	const parallaxGroup = new THREE.Group();
	scene.add(parallaxGroup);

	/* {Texture Load} - 흰색 SVG를 캔버스 재채색 없이 바로 텍스처로 사용 */
	const texturesReady = Promise.all(SVG_NAMES.map(name => new Promise((resolve) => {
		const img = new Image();
		img.onload = () => {
			const texture = new THREE.Texture(img);
			texture.needsUpdate = true;
			texture.userData = { aspect: img.naturalWidth / img.naturalHeight };
			resolve(texture);
		};
		img.onerror = () => resolve(null);
		img.src = `../@resource/images/main/${name}`;
	})));

	/* {Shared Geometry/Material} - 텍스처 10개당 geometry/material을 딱 1세트만 만들어 모든 그룹이 공유 */
	let sharedMeshDefs = [];

	function buildSharedDefs(textures) {
		return textures.map((texture) => {
			const material = new THREE.MeshBasicMaterial({
				map: texture, side: THREE.DoubleSide,
				alphaTest: 0.5,
				alphaToCoverage: !isCoarsePointer,
			});
			const aspect = texture.userData.aspect || 1;
			const geometry = new THREE.PlaneGeometry(aspect, 1);
			return { geometry, material };
		});
	}

	function buildMorphingShape(defs) {
		const group = new THREE.Group();
		const meshes = defs.map(({ geometry, material }) => new THREE.Mesh(geometry, material));
		const startIndex = Math.floor(Math.random() * meshes.length);
		meshes.forEach((mesh, i) => {
			const active = i === startIndex;
			mesh.scale.setScalar(active ? 1 : 0.001);
			mesh.visible = active;
			group.add(mesh);
		});
		group.userData.morphMeshes = meshes;
		group.userData.morphIndex = startIndex;
		return group;
	}

	function startPulse(obj, scaleFactor) {
		gsap.to(obj.scale, {
			x: scaleFactor * 1.25, y: scaleFactor * 1.25, z: scaleFactor * 1.25,
			duration: randomRange(2.5, 4.5),
			delay: randomRange(0, 2),
			ease: 'sine.inOut',
			yoyo: true,
			repeat: -1,
		});
	}

	function startMorphCycle(group) {
		const meshes = group.userData.morphMeshes;
		const morphDuration = 0.5;
		let current = group.userData.morphIndex;

		function scheduleNext() {
			group.userData.morphTimer = gsap.delayedCall(randomRange(4, 7), () => {
				let nextIndex = Math.floor(Math.random() * meshes.length);
				if (nextIndex === current) nextIndex = (nextIndex + 1) % meshes.length;

				const outgoing = meshes[current];
				const incoming = meshes[nextIndex];
				gsap.to(outgoing.scale, {
					x: 0.001, y: 0.001, z: 0.001, duration: morphDuration, ease: 'power2.in',
					onComplete: () => {
						outgoing.visible = false;
						incoming.visible = true;
						gsap.to(incoming.scale, { x: 1, y: 1, z: 1, duration: morphDuration, ease: 'back.out(1.6)' });
					},
				});
				current = nextIndex;
				scheduleNext();
			});
		}
		scheduleNext();
	}

	let shapeObjects = [];

	function spawnShapes() {
		shapeObjects.forEach((obj) => {
			gsap.killTweensOf(obj.position);
			gsap.killTweensOf(obj.rotation);
			gsap.killTweensOf(obj.scale);
			if (obj.userData.morphTimer) obj.userData.morphTimer.kill();
			obj.userData.morphMeshes.forEach((mesh) => gsap.killTweensOf(mesh.scale));
			parallaxGroup.remove(obj);
		});
		shapeObjects = [];

		for (let i = 0; i < SHAPE_COUNT; i++) {
			const obj = buildMorphingShape(sharedMeshDefs);

			const path = pickFlightPath();
			obj.position.set(path.fromX, path.fromY, randomRange(-3.5, 3.5));
			parallaxGroup.add(obj);

			const distanceFromCamera = camera.position.z - obj.position.z;
			const targetPx = randomRange(90, MAX_SIZE_PX);
			const targetWorldSize = pxToWorldSize(targetPx, distanceFromCamera);
			const scaleFactor = targetWorldSize;
			obj.scale.setScalar(scaleFactor);

			const duration = randomRange(14, 22);
			const delay = 0;
			const shouldPulse = !prefersReducedMotion;

			if (prefersReducedMotion) {
				obj.position.set(randomRange(-visibleHalfWidth * 0.9, visibleHalfWidth * 0.9), randomRange(-visibleHalfHeight * 0.9, visibleHalfHeight * 0.9), obj.position.z);
			} else {
				const tweenVars = { duration, delay, ease: 'none', repeat: -1 };
				if (path.toX !== null) tweenVars.x = path.toX;
				if (path.toY !== null) tweenVars.y = path.toY;
				gsap.to(obj.position, tweenVars);
				gsap.to(obj.rotation, { z: Math.PI * 2, duration: duration * 1.5, ease: 'none', repeat: -1 });
				startMorphCycle(obj);
				if (shouldPulse) startPulse(obj, scaleFactor);
			}
			shapeObjects.push(obj);
		}
	}

	let texturesLoaded = false;
	texturesReady.then((loaded) => {
		const validTextures = loaded.filter(Boolean);
		sharedMeshDefs = buildSharedDefs(validTextures);
		texturesLoaded = true;
		spawnShapes();
	});

	function setupParallax() {
		if (prefersReducedMotion) return;
		const quickX = gsap.quickTo(parallaxGroup.position, 'x', { duration: 0.8, ease: 'power3.out' });
		const quickY = gsap.quickTo(parallaxGroup.position, 'y', { duration: 0.8, ease: 'power3.out' });

		window.addEventListener('mousemove', (e) => {
			const nx = e.clientX / window.innerWidth - 0.5;
			const ny = e.clientY / window.innerHeight - 0.5;
			quickX(nx * 0.6);
			quickY(-ny * 0.4);
		});
	}
	setupParallax();

	/* {Visibility Check} - 섹션이 화면 밖이면 render() 자체를 스킵 (씬은 그대로, GSAP 트윈도 계속 갱신됨) */
	let isVisible = true;
	const visibilityIO = new IntersectionObserver(([entry]) => {
		isVisible = entry.isIntersecting;
	}, { threshold: 0 });
	visibilityIO.observe(visual);

	function animate() {
		requestAnimationFrame(animate);
		if (isVisible) renderer.render(scene, camera);
	}
	animate();

	/* {Resize} - 가로폭이 실제로 바뀔 때만 캔버스 리사이즈 + 씬 재생성
	   iOS Safari는 캔버스 width/height를 리사이즈할 때마다 메모리가 새는 고유 버그가 있어서,
	   주소창 접힘/펼침(세로만 변함)에도 매번 리사이즈되면 스크롤 누적 시 메모리가 계속 쌓임 -> 가로폭 변화에만 반응하도록 통째로 게이트 */
	let lastWidth = window.innerWidth;
	let resizeTimer;
	window.addEventListener('resize', () => {
		const newWidth = window.innerWidth;
		if (newWidth === lastWidth) return;
		lastWidth = newWidth;

		width = wrap.clientWidth;
		height = wrap.clientHeight;
		camera.aspect = width / height;
		camera.updateProjectionMatrix();
		renderer.setSize(width, height);
		updateVisibleBounds();

		clearTimeout(resizeTimer);
		resizeTimer = setTimeout(() => {
			if (texturesLoaded) spawnShapes();
		}, 300);
	});
}


			/* <GSAP Refresh> - 모션 초기화 */
			requestAnimationFrame(() => {
				ScrollTrigger.refresh(true);
			});
		});
		/* // [Document Ready] - DOM 로드 시 실행 함수 종료 */
			
			
		/* [Window Event] (Window) */
		/* Description: 이벤트 함수 */
		/* <Resizing> - 리사이징 */
		let resizeTimer;
		window.addEventListener('resize', function(){
			clearTimeout(resizeTimer);
			resizeTimer = setTimeout(() => {

				/* {GSAP Device Check} 디바이스 체크 */
					

				/* {GSAP Refresh} 모션 위치 감지,초기화 */
				requestAnimationFrame(() => {
					if(window.lenis){ 
						window.lenis.resize();
					}
					ScrollTrigger.refresh(true);
				});
			}, 120);
		});

		/* <Orientationchange> - 방향 전환 */
		window.addEventListener("orientationchange", () => {
			setTimeout(() => {
				if(window.lenis){ 
					window.lenis.resize();
				}
				window.ScrollTrigger?.refresh();
			}, 300);
		});
		/* // [Window Event] 이벤트 함수 종료 */