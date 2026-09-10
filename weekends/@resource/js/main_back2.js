/* {GSAP Lib} - GSAP 모션 실행 함수 */
gsap.registerPlugin(ScrollTrigger); 	// 라이브러리 실행
let mm = gsap.matchMedia(); 					// 미디어 쿼리

/* <Responsive Runtime> - 모든 섹션이 공유하는 반응형 기준과 resize 조정자 */
const responsiveState = (() => {
	const mobileQuery = window.matchMedia('(max-width: 767px)');
	const tabletQuery = window.matchMedia('(min-width: 768px) and (max-width: 1024px)');
	const touchQuery = window.matchMedia('(pointer: coarse)');

	function getTier() {
		if (mobileQuery.matches) return 'mobile';
		if (tabletQuery.matches) return 'tablet';
		return 'desktop';
	}

	function getViewport() {
		return { width: window.innerWidth, height: window.innerHeight, tier: getTier() };
	}

	return { getTier, getViewport, isTouch: () => touchQuery.matches };
})();

ScrollTrigger.config({
	limitCallbacks: true,
	ignoreMobileResize: true,
	autoRefreshEvents: 'visibilitychange,DOMContentLoaded,load',
});

window.__resizeScenes = window.__resizeScenes || {};
const resizeCoordinator = (() => {
	let resizeRaf = 0;
	let settleTimer = 0;
	let pendingTierChanged = false;
	let lastViewport = responsiveState.getViewport();

	function resizeLightweightScenes() {
		resizeRaf = 0;
		window.__resizeScenes.visual?.resize?.();
		window.__resizeScenes.matter?.resize?.();
	}

	function settleResize() {
		const tierChanged = pendingTierChanged;
		pendingTierChanged = false;
		const scenes = window.__resizeScenes;
		scenes.visual?.settle?.({ tierChanged });
		scenes.matter?.settle?.({ tierChanged });
		scenes.gallery?.settle?.({ tierChanged });
		scenes.collab?.settle?.({ tierChanged });

		window.lenis?.resize?.();
		ScrollTrigger.refresh();
	}

	function schedule() {
		const nextViewport = responsiveState.getViewport();
		const previousViewport = lastViewport;
		lastViewport = nextViewport;

		const widthChanged = nextViewport.width !== previousViewport.width;
		const heightChangeRatio = Math.abs(nextViewport.height - previousViewport.height) / Math.max(previousViewport.height, 1);
		const tierChanged = nextViewport.tier !== previousViewport.tier;
		pendingTierChanged ||= tierChanged;
		const needsHeavyRefresh = tierChanged || widthChanged || !responsiveState.isTouch() || heightChangeRatio >= 0.25;

		if (!resizeRaf) resizeRaf = requestAnimationFrame(resizeLightweightScenes);
		if (!needsHeavyRefresh) return;

		clearTimeout(settleTimer);
		settleTimer = window.setTimeout(settleResize, 220);
	}

	return { schedule };
})();

window.addEventListener('resize', resizeCoordinator.schedule, { passive: true });
window.addEventListener('orientationchange', resizeCoordinator.schedule, { passive: true });

/* {isLayoutReady} - 레이아웃(헤더/푸터)이 준비된 시점에 실행 */
function isLayoutReady(){
	isCurrent(0);
	headerGsap();
	footerGsap();
	headerBgGsap();

	const body = document.body;
	body.classList.remove('loaded');
	body.classList.add('loaded');

	window.lenis?.stop();
	if (window.lenis) {
		window.lenis.stop();
		window.lenis.start();
	}
}

typeof isLayoutPath === 'function'
	? isLayoutPath(isLayoutReady)
	: isLayoutReady();


/* [Document Ready] (DOM) */
$(function(){			
	
	fadeUpGsap();

	/* <Section Visual Motion> - 모션 함수 */
	function initVisual(){
		const visual = document.querySelector('.section.visual');
		if(!visual) return;

		const heros = {};

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

		const SHAPE_FADE = 0.4;
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

		const changesTls = new Array(changesWraps.length).fill(null);
		const totalDuration = heros.shapeWraps.length * SHAPE_SLOT;

		const playChanges = (idx) => {
			if (changesTls[idx]) changesTls[idx].kill();
			changesTls[idx] = buildBlurEffect(changesWraps[idx]);
			changesTls[idx].play();
		};
		const reverseChanges = (idx) => {
			if (changesTls[idx]) changesTls[idx].reverse();
		};

		changesWraps.forEach((wrap, idx) => {
			const s = shapeStart(wrap);
			const range = () => {
				const st = shapeTl.scrollTrigger;
				return st.end - st.start;
			};

			ScrollTrigger.create({
				trigger: heros.shape,
				start: () => `top+=${(s / totalDuration) * range()} top`,
				end:   () => `top+=${((s + SHAPE_SLOT) / totalDuration) * range()} top`,
				onEnter:     () => playChanges(idx),
				onEnterBack: () => playChanges(idx),
				onLeave:     () => reverseChanges(idx),
				onLeaveBack: () => reverseChanges(idx),
			});
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
			const prefersReducedMotion = false;
			const SVG_NAMES = Array.from({ length: 10 }, (_, i) => `matter${i + 1}.svg`);

			const SIZE_MULTIPLIERS = [1, 2, 3, 5];
			const SIZE_WEIGHTS = [2, 2, 1, 1];

			function randomRange(min, max) {
				return min + Math.random() * (max - min);
			}

			function resolveCssLength(value, fallback) {
				const el = document.createElement('div');
				el.style.cssText = `position:absolute; visibility:hidden; width:${value};`;
				visual.appendChild(el);
				const px = parseFloat(getComputedStyle(el).width);
				el.remove();
				return px || fallback;
			}

			function buildSizeSequence(count) {
				const totalWeight = SIZE_WEIGHTS.reduce((a, b) => a + b, 0);
				const seq = [];
				SIZE_MULTIPLIERS.forEach((mult, i) => {
					const n = Math.round(count * SIZE_WEIGHTS[i] / totalWeight);
					for (let k = 0; k < n; k++) seq.push(mult);
				});
				while (seq.length < count) seq.push(SIZE_MULTIPLIERS[0]);
				while (seq.length > count) seq.pop();
				for (let i = seq.length - 1; i > 0; i--) {
					const j = Math.floor(Math.random() * (i + 1));
					[seq[i], seq[j]] = [seq[j], seq[i]];
				}
				return seq;
			}

			const scene = new THREE.Scene();

			const wrap = canvas.parentElement;
			let width = wrap.clientWidth, height = wrap.clientHeight;

			const camera = new THREE.PerspectiveCamera(35, width / height, 0.1, 100);
			camera.position.set(0, 0, 9);

			const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
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

			const RASTER_SCALE = 4;
			const ORANGE_RGB = [255, 103, 29];
			const WHITE_RGB = [255, 255, 255];
			function recolorSilhouette(img) {
				const c = document.createElement('canvas');
				c.width = (img.naturalWidth || img.width) * RASTER_SCALE;
				c.height = (img.naturalHeight || img.height) * RASTER_SCALE;
				const ctx = c.getContext('2d');
				ctx.drawImage(img, 0, 0, c.width, c.height);

				const imgData = ctx.getImageData(0, 0, c.width, c.height);
				const data = imgData.data;
				for (let i = 0; i < data.length; i += 4) {
					if (data[i + 3] <= 32) { data[i + 3] = 0; continue; }

					const distToOrange = (data[i] - ORANGE_RGB[0]) ** 2 + (data[i + 1] - ORANGE_RGB[1]) ** 2 + (data[i + 2] - ORANGE_RGB[2]) ** 2;
					const distToWhite  = (data[i] - WHITE_RGB[0]) ** 2 + (data[i + 1] - WHITE_RGB[1]) ** 2 + (data[i + 2] - WHITE_RGB[2]) ** 2;
					const rgb = distToOrange < distToWhite ? ORANGE_RGB : WHITE_RGB;

					data[i] = rgb[0]; data[i + 1] = rgb[1]; data[i + 2] = rgb[2]; data[i + 3] = 255;
				}
				ctx.putImageData(imgData, 0, 0);
				return c;
			}

			const texturesReady = Promise.all(SVG_NAMES.map(name => new Promise((resolve) => {
				const img = new Image();
				img.onload = () => {
					const canvasEl = recolorSilhouette(img);
					const texture = new THREE.CanvasTexture(canvasEl);
					texture.colorSpace = THREE.SRGBColorSpace;
					texture.userData = { aspect: canvasEl.width / canvasEl.height };
					resolve(texture);
				};
				img.onerror = () => resolve(null);
				img.src = `../@resource/images/main/${name}`;
			})));

			let shapeObjects = [];

			function startPulse(obj, scaleFactor) {
				obj.userData.pulseTween = gsap.to(obj.scale, {
					x: scaleFactor * 1.25, y: scaleFactor * 1.25, z: scaleFactor * 1.25,
					duration: randomRange(2.5, 4.5),
					delay: randomRange(0, 2),
					ease: 'sine.inOut',
					yoyo: true,
					repeat: -1,
				});
			}

			function buildMorphingShape(textures) {
				const group = new THREE.Group();
				const meshes = textures.map((texture) => {
					const material = new THREE.MeshBasicMaterial({
						map: texture, side: THREE.DoubleSide,
						alphaTest: 0.5,
					});
					const aspect = texture.userData.aspect || 1;
					const geometry = new THREE.PlaneGeometry(aspect, 1);
					return new THREE.Mesh(geometry, material);
				});
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

			function startMorphCycle(group) {
				const meshes = group.userData.morphMeshes;
				const morphDuration = 0.9;
				let current = group.userData.morphIndex;

				function scheduleNext() {
					group.userData.morphTimer = gsap.delayedCall(randomRange(4, 7), () => {
						let nextIndex = Math.floor(Math.random() * meshes.length);
						if (nextIndex === current) nextIndex = (nextIndex + 1) % meshes.length;

						const outgoing = meshes[current];
						const incoming = meshes[nextIndex];
						group.userData.pulseTween?.pause();
						gsap.to(outgoing.scale, {
							x: 0.001, y: 0.001, z: 0.001, duration: morphDuration, ease: 'sine.inOut',
							onComplete: () => {
								outgoing.visible = false;
								incoming.visible = true;
								gsap.to(incoming.scale, {
									x: 1, y: 1, z: 1, duration: morphDuration, ease: 'sine.inOut',
									onComplete: () => group.userData.pulseTween?.resume(),
								});
							},
						});
						current = nextIndex;
						scheduleNext();
					});
				}
				scheduleNext();
			}

			function spawnShapes(textures) {
				shapeObjects.forEach((obj) => {
					gsap.killTweensOf(obj.position);
					gsap.killTweensOf(obj.rotation);
					gsap.killTweensOf(obj.scale);
					if (obj.userData.morphTimer) obj.userData.morphTimer.kill();
					obj.userData.morphMeshes.forEach((mesh) => {
						gsap.killTweensOf(mesh.scale);
						mesh.geometry.dispose();
						mesh.material.dispose();
					});
					parallaxGroup.remove(obj);
				});
				shapeObjects = [];

				const visualTier = responsiveState.getTier();
				const SHAPE_COUNT = visualTier === 'mobile' ? 15 : visualTier === 'tablet' ? 30 : 60;
				const baseSizePx = resolveCssLength('var(--shape-size)', 22);
				const sizeSeq = buildSizeSequence(SHAPE_COUNT);

				for (let i = 0; i < SHAPE_COUNT; i++) {
					const obj = buildMorphingShape(textures);

					const path = pickFlightPath();
					obj.position.set(path.fromX, path.fromY, randomRange(-3.5, 3.5));
					parallaxGroup.add(obj);

					const distanceFromCamera = camera.position.z - obj.position.z;
					const targetPx = baseSizePx * sizeSeq[i] * randomRange(0.9, 1.1);
					const targetWorldSize = pxToWorldSize(targetPx, distanceFromCamera);
					const scaleFactor = targetWorldSize;
					obj.scale.setScalar(scaleFactor);

					const duration = randomRange(14, 22);
					const delay = -randomRange(0, 20);

					startMorphCycle(obj);
					startPulse(obj, scaleFactor);

					if (prefersReducedMotion) {
						obj.position.set(randomRange(-visibleHalfWidth * 0.9, visibleHalfWidth * 0.9), randomRange(-visibleHalfHeight * 0.9, visibleHalfHeight * 0.9), obj.position.z);
					} else {
						const tweenVars = { duration, delay, ease: 'none', repeat: -1 };
						if (path.toX !== null) tweenVars.x = path.toX;
						if (path.toY !== null) tweenVars.y = path.toY;
						obj.userData.flightTween = gsap.to(obj.position, tweenVars);
						obj.userData.spinTween = gsap.to(obj.rotation, { z: Math.PI * 2, duration: duration * 1.5, ease: 'none', repeat: -1 });
					}
					shapeObjects.push(obj);
				}

				setAnimationsPaused(!isSectionVisible);
			}

			let isSectionVisible = false;
			function setAnimationsPaused(paused) {
				shapeObjects.forEach((obj) => {
					const ud = obj.userData;
					[ud.pulseTween, ud.flightTween, ud.spinTween, ud.morphTimer].forEach((tween) => {
						if (!tween) return;
						paused ? tween.pause() : tween.resume();
					});
				});
			}

			let loadedTextures = [];
			texturesReady.then((loaded) => {
				loadedTextures = loaded.filter(Boolean);
				spawnShapes(loadedTextures);
			});

			function setupParallax() {
				if (prefersReducedMotion || isCoarsePointer) return;
				const quickX = gsap.quickTo(parallaxGroup.position, 'x', { duration: 0.8, ease: 'power3.out' });
				const quickY = gsap.quickTo(parallaxGroup.position, 'y', { duration: 0.8, ease: 'power3.out' });

				window.addEventListener('mousemove', (e) => {
					if (!isSectionVisible) return;
					const nx = e.clientX / window.innerWidth - 0.5;
					const ny = e.clientY / window.innerHeight - 0.5;
					quickX(nx * 0.6);
					quickY(-ny * 0.4);
				});
			}
			setupParallax();

			let rafId = null;
			function animate() {
				rafId = requestAnimationFrame(animate);
				renderer.render(scene, camera);
			}
			new IntersectionObserver((entries) => {
				const visible = entries[entries.length - 1].isIntersecting;
				if (visible === isSectionVisible) return;
				isSectionVisible = visible;
				setAnimationsPaused(!visible);
				if (visible && rafId === null) {
					animate();
				} else if (!visible && rafId !== null) {
					cancelAnimationFrame(rafId);
					rafId = null;
				}
			}, { threshold: 0 }).observe(visual);

			function resizeVisualCanvas() {
				const nextWidth = wrap.clientWidth;
				const nextHeight = wrap.clientHeight;
				if (!nextWidth || !nextHeight || (nextWidth === width && nextHeight === height)) return false;

				width = nextWidth;
				height = nextHeight;
				camera.aspect = width / height;
				camera.updateProjectionMatrix();
				renderer.setPixelRatio(isCoarsePointer ? 1 : Math.min(window.devicePixelRatio, 2));
				renderer.setSize(width, height, false);
				updateVisibleBounds();
				return true;
			}

			window.__resizeScenes.visual = {
				resize: resizeVisualCanvas,
				settle: ({ tierChanged }) => {
					if (tierChanged && loadedTextures.length) spawnShapes(loadedTextures);
				},
			};
		}
		initVisualShapes(visual);
	}
	initVisual();



	/* <Section Gradient Function> - 모션 함수 */
	function initGradient(){
		const gradient = document.querySelector('.section.gradient');
		if(!gradient) return;

		const gradients = {};
		gradients.area = gradient.querySelector('.img-area');
		
		gsap.set( gradients.area, { transform: 'rotatex(90deg)', });
		gsap.to	( gradients.area, {
			transform: 'rotatex(0deg)',
			scrollTrigger: {
				trigger: gradient,
				start: 'top bottom',
				end: 'bottom 30%',
				scrub: true,
				invalidateOnRefresh: true,
			},
		});
	}
	initGradient();



	/* <Section Matters Function> - 모션 함수 */
	function initMatters(){
		const matter = document.querySelector('.section.matters');
		if(!matter) return;

		const matters = {};
		matters.area = matter.querySelector('.matter-area');
		matters.wrap = matter.querySelector('.matter-wrap');
		if(!matters.wrap) return;

		const { 
			Engine, World, Bodies, Body, Runner, Mouse, MouseConstraint, Events, Common
		} = Matter;

		function getTier() {
			return responsiveState.getTier();
		}

		let currentTier, cleanup, resizeWalls, resizeMatterBodies;

		function build() {
			cleanup?.();
			currentTier = getTier();
			const isMobile = currentTier === 'mobile';
			const isTablet = currentTier === 'tablet';

			function resolveCssLength(value, fallback) {
				const el = document.createElement('div');
				el.style.cssText = `position:absolute; visibility:hidden; width:${value};`;
				matter.appendChild(el);
				const px = parseFloat(getComputedStyle(el).width);
				el.remove();
				return px || fallback;
			}
			let sizeFix = resolveCssLength('var(--matter-size)', 40);

			const SHAPE_VERTS = {
				triangle: [[-0.5, 0.5], [0, -0.5], [0.5, 0.5]],
				hexagon: Array.from({ length: 6 }, (_, i) => {
					const a = Math.PI / 6 + i * (Math.PI / 3);
					return [Math.cos(a) * 0.5, Math.sin(a) * 0.5];
				}),
				ellipse: Array.from({ length: 64 }, (_, i) => {
					const a = (i / 64) * Math.PI * 2;
					return [Math.cos(a) * 0.5, Math.sin(a) * 0.5];
				}),
			};
			const SHAPE_NAMES = ['circle', 'triangle', 'square', 'hexagon'];
			const SIZE_MULTIPLIERS = [1.5, 2, 2.5, 3];

			function clipPathOf(verts) {
				const xs = verts.map((v) => v[0]), ys = verts.map((v) => v[1]);
				const minX = Math.min(...xs), maxX = Math.max(...xs);
				const minY = Math.min(...ys), maxY = Math.max(...ys);
				const w = maxX - minX, h = maxY - minY;
				const pts = verts.map(([x, y]) => `${((x - minX) / w * 100).toFixed(2)}% ${((y - minY) / h * 100).toFixed(2)}%`);

				return { clipPath: `polygon(${pts.join(', ')})`, w, h };
			}

			const REPEAT = isMobile ? 1 : isTablet ? 2 : 3;
			const backgroundDefs = [];
			SHAPE_NAMES.forEach((shape) => {
				SIZE_MULTIPLIERS.forEach((mult) => {
					for (let i = 0; i < REPEAT; i++) backgroundDefs.push({ shape, mult });
				});
			});

			const TEXT_DEFS_ORDER = [
				{
					shape: 'circle',
					title:	'Off-line <br class="only-mo"> Experience+',
					text:	`<span class="first">
								팝업 익스피리언스를 필두로 모든 <br class="only-mo"> 
								오프라인 경험을 제공합니다.
							 </span>
							 <span>기획부터 실행까지, 한 창구에서 모두 가능합니다.</span>
							 <span>OOH, 페이드 미디어 등을 더해 더 넓은 접근까지 가능합니다.</span>`
				},
				{
					shape:	'triangle',
					title:	'Design',
					text:	`<span class="first">
								평면에서 공간에 이르는 디자인 <br class="only-mo"> 
								일체를 제공합니다.
							 </span>
							 <span>
							 	결과물의 핵심이 되는 디자인. 모든 아이디어를 시각화하고 <br> 
								제작, 감리, 실행까지 주도하여 직접 완성합니다.
							 </span>`
				},
				{
					shape:	'square',
					title:	'PR, Viral',
					text:	`<span class="first">
								좋은 이벤트를 꾸리는 것 만큼 <br> 
								알리는 활동의 중요도가 높아지고 <br class="only-mo"> 있습니다.
							 </span>
							 <span>최적화된 스피커를 통해 멀리, 많이 알려드립니다.</span>`
				},
			];
			const TEXT_DEFS = isMobile ? [...TEXT_DEFS_ORDER].reverse() : TEXT_DEFS_ORDER;

			function createItemEl(def) {
				const defEl = document.createElement('div');
				const isText = !!def.title;
				const sizeClass = isText ? '' : ` matter-size-${def.mult}x`;

				defEl.className = `matter-item ${def.shape}-matter${sizeClass} pack-center${isText ? ` text-area text-${def.shape} ` : ''}`;
				if (isText) {
					defEl.innerHTML = `
					<div class="text-wrap pack-down">
						<h3 class="title"> ${def.title} </h3>
						<p class="text"> ${def.text} </p>
					</div>`;
				}
				matters.wrap.appendChild(defEl);
				return defEl;
			}

			const bodyOpts = { restitution: 0.3, friction: 0.5 };

			function makeBody(def, x, y, cssW, cssH) {
				const isText = !!def.title;
				const refW = isText ? cssW : sizeFix * def.mult;
				const refH = isText ? cssH : sizeFix * def.mult;
				let body, w, h, clipPath = null;

				if (def.shape === 'circle' && !isText) {
					w = h = refW;
					body = Bodies.circle(x, y, refW / 2 * 0.98, bodyOpts);
				} else if (def.shape === 'square') {
					w = refW; h = refH;
					body = Bodies.rectangle(x, y, refW * 0.98, refH * 0.98, bodyOpts);
				} else {
					const shapeKey = def.shape === 'circle' ? 'ellipse' : def.shape;
					const shape = clipPathOf(SHAPE_VERTS[shapeKey]);
					w = shape.w * refW; h = shape.h * refH; clipPath = shape.clipPath;
					const verts = SHAPE_VERTS[shapeKey].map(([vx, vy]) => ({ x: vx * refW, y: vy * refH }));
					body = Bodies.fromVertices(x, y, [verts], bodyOpts, true);
				}

				const xs = body.vertices.map((v) => v.x - body.position.x);
				const ys = body.vertices.map((v) => v.y - body.position.y);
				const centerOffset = {
					x: (Math.min(...xs) + Math.max(...xs)) / 2,
					y: (Math.min(...ys) + Math.max(...ys)) / 2,
				};

				Body.setAngle(body, Common.random(-0.4, 0.4));
				Body.setVelocity(body, { x: Common.random(-1, 1), y: 10 });

				return { body, w, h, clipPath, centerOffset };
			}

			function getInitialPosition(isLabeled, labeledIndex, labeledCount, index, height) {
				const goldenRatio = 0.61803398875;
				let x;
				if (isLabeled) {
					const clusterWidth = STAGE_WIDTH * 0.55;
					const clusterMin = (STAGE_WIDTH - clusterWidth) / 2;
					const ratio = labeledCount > 1 ? labeledIndex / (labeledCount - 1) : 0.5;
					x = clusterMin + clusterWidth * ratio;
				} else {
					const padding = 8;
					const ratio = (index * goldenRatio + 0.19) % 1;
					x = padding + (STAGE_WIDTH - padding * 2) * ratio;
				}
				const spawnY = -height / 2 - Common.random(0, dropZone - height / 2);
				return { x, y: spawnY };
			}

			let maxRef = Math.max(sizeFix * SIZE_MULTIPLIERS[SIZE_MULTIPLIERS.length - 1], 500);
			const wallThickness = 200;
			let dropZone = maxRef + 160;
			const wallOpts = { isStatic: true, restitution: 0, friction: 1 };

			let STAGE_WIDTH = matters.area.clientWidth;
			let STAGE_HEIGHT = matters.area.clientHeight;

			const engine = Engine.create({ gravity: { x: 0, y: 1.2 }, enableSleeping: true });
			const world = engine.world;

			function buildWalls() {
				return [
					Bodies.rectangle(STAGE_WIDTH / 2, STAGE_HEIGHT + wallThickness / 2, STAGE_WIDTH, wallThickness, wallOpts),
					Bodies.rectangle(-wallThickness / 2, STAGE_HEIGHT / 2, wallThickness, STAGE_HEIGHT * 3, wallOpts),
					Bodies.rectangle(STAGE_WIDTH + wallThickness / 2, STAGE_HEIGHT / 2, wallThickness, STAGE_HEIGHT * 3, wallOpts),
					Bodies.rectangle(STAGE_WIDTH / 2, -(dropZone + wallThickness / 2), STAGE_WIDTH, wallThickness, wallOpts),
				];
			}
			let walls = buildWalls();
			World.add(world, walls);

			let allItems = [];
			let mouseRef = null;
			if (!isMobile && !isTablet) {
				matters.area.style.touchAction = 'none';
				const mouse = Mouse.create(matters.area);
				mouseRef = mouse;
				mouse.element.removeEventListener('mousewheel', mouse.mousewheel);
				mouse.element.removeEventListener('DOMMouseScroll', mouse.mousewheel);
				mouse.element.removeEventListener('wheel', mouse.mousewheel);
				const mouseConstraint = MouseConstraint.create(engine, {
					mouse,
					constraint: { stiffness: 0.2, damping: 0.5, render: { visible: false } },
				});
				World.add(world, mouseConstraint);

				Events.on(mouseConstraint, 'startdrag', (e) => {
					const item = allItems.find((i) => i.body === e.body);
					item?.element.classList.add('is-dragging');
				});
				Events.on(mouseConstraint, 'enddrag', (e) => {
					const item = allItems.find((i) => i.body === e.body);
					item?.element.classList.remove('is-dragging');
				});
			}

			const MAX_LINEAR_SPEED = 40, MAX_ANGULAR_SPEED = 0.3;
			Events.on(engine, 'beforeUpdate', () => {
				allItems.forEach(({ body }) => {
					if (!body) return;
					if (body.speed > MAX_LINEAR_SPEED) {
						const scale = MAX_LINEAR_SPEED / body.speed;
						Body.setVelocity(body, { x: body.velocity.x * scale, y: body.velocity.y * scale });
					}
					if (Math.abs(body.angularVelocity) > MAX_ANGULAR_SPEED) {
						Body.setAngularVelocity(body, Math.sign(body.angularVelocity) * MAX_ANGULAR_SPEED);
					}
				});
			});

			const runner = Runner.create();
			runner.enabled = false;
			Runner.run(runner, engine);

			let rafId = null;
			let isMatterVisible = false;
			let matterObserver = null;

			function syncDom() {
				if (!isMatterVisible) {
					rafId = null;
					return;
				}
				rafId = requestAnimationFrame(syncDom);
				allItems.forEach((item) => {
					if (!item.spawned || !item.body) return;
					const angle = item.body.angle;
					const offset = item.centerOffset;
					const cos = Math.cos(angle), sin = Math.sin(angle);
					const offsetX = offset.x * cos - offset.y * sin;
					const offsetY = offset.x * sin + offset.y * cos;
					const x = item.body.position.x + offsetX - item.width / 2;
					const y = item.body.position.y + offsetY - item.height / 2;
					item.element.style.transform = `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0) rotate(${angle}rad)`;
				});
			}

			function resumeMatter() {
				if (isMatterVisible) return;
				isMatterVisible = true;
				runner.enabled = true;
				if (rafId === null) syncDom();
			}

			function pauseMatter() {
				if (!isMatterVisible) return;
				isMatterVisible = false;
				runner.enabled = false;
				if (rafId !== null) cancelAnimationFrame(rafId);
				rafId = null;
			}

			matterObserver = new IntersectionObserver(([entry]) => {
				entry.isIntersecting ? resumeMatter() : pauseMatter();
			}, { rootMargin: '240px 0px' });
			matterObserver.observe(matter);

			let dropStarted = false;
			let dropTimerIds = [];
			function scheduleMatterTimer(callback, delay) {
				const id = window.setTimeout(() => {
					dropTimerIds = dropTimerIds.filter((timerId) => timerId !== id);
					callback();
				}, delay);
				dropTimerIds.push(id);
			}
			function startDrop() {
				if (dropStarted) return;
				dropStarted = true;

				const decorative = allItems.filter((i) => !i.isText);
				const labeled = allItems.filter((i) => i.isText);

				const spawnGroup = (group) => {
					group.forEach((item, i) => {
						const pos = getInitialPosition(item.isText, labeled.indexOf(item), labeled.length, i, item.height);
						Body.setPosition(item.body, pos);
						World.add(world, item.body);
						item.spawned = true;
						item.element.classList.add('is-spawned');
					});
				};

				spawnGroup(decorative);

				if (isMobile) {
					const DROP_ORDER = ['triangle', 'square', 'circle'];
					const DROP_STAGGER = 300;
					DROP_ORDER.forEach((shape, i) => {
						const item = labeled.find((it) => it.shape === shape);
						if (!item) return;
						scheduleMatterTimer(() => spawnGroup([item]), 400 + i * DROP_STAGGER);
					});
				} else {
					scheduleMatterTimer(() => spawnGroup(labeled), 400);
				}
			}

			function buildItems() {
				const defs = [...backgroundDefs, ...TEXT_DEFS];
				allItems = defs.map((def) => {
					const isText = !!def.title;
					const element = createItemEl(def);

					let cssW, cssH;
					if (isText) {
						const rect = element.getBoundingClientRect();
						cssW = rect.width; cssH = rect.height;
					}

					const { body, w, h, clipPath, centerOffset } = makeBody(def, STAGE_WIDTH / 2, -9999, cssW, cssH);
					if (!isText) {
						element.style.width = `${w}px`;
						element.style.height = `${h}px`;
					}
					if (clipPath) element.style.clipPath = clipPath;

					element.addEventListener('pointerenter', () => element.classList.add('is-hover'));
					element.addEventListener('pointerleave', () => element.classList.remove('is-hover'));

					return { element, body, width: w, height: h, centerOffset, isText, shape: def.shape, mult: def.mult || 1, spawned: false };
				});
			}
			buildItems();

			resizeWalls = function (force = false) {
				const nextWidth = matters.area.clientWidth;
				const nextHeight = matters.area.clientHeight;
				if (!nextWidth || !nextHeight || (!force && nextWidth === STAGE_WIDTH && nextHeight === STAGE_HEIGHT)) return false;

				STAGE_WIDTH = nextWidth;
				STAGE_HEIGHT = nextHeight;
				World.remove(world, walls);
				walls = buildWalls();
				World.add(world, walls);
				return true;
			};

			resizeMatterBodies = function () {
				const nextSizeFix = resolveCssLength('var(--matter-size)', sizeFix);
				const decorativeRatio = nextSizeFix / Math.max(sizeFix, 1);

				allItems.forEach((item) => {
					let nextWidth = item.width;
					let nextHeight = item.height;

					if (item.isText) {
						const style = getComputedStyle(item.element);
						nextWidth = parseFloat(style.width) || item.width;
						nextHeight = parseFloat(style.height) || item.height;
					} else if (Math.abs(decorativeRatio - 1) > 0.002) {
						nextWidth *= decorativeRatio;
						nextHeight *= decorativeRatio;
						item.element.style.width = `${nextWidth}px`;
						item.element.style.height = `${nextHeight}px`;
					}

					const scaleX = nextWidth / Math.max(item.width, 1);
					const scaleY = nextHeight / Math.max(item.height, 1);
					if (Math.abs(scaleX - 1) > 0.002 || Math.abs(scaleY - 1) > 0.002) {
						Body.scale(item.body, scaleX, scaleY);
						item.centerOffset.x *= scaleX;
						item.centerOffset.y *= scaleY;
						item.width = nextWidth;
						item.height = nextHeight;
					}
				});

				sizeFix = nextSizeFix;
				maxRef = Math.max(sizeFix * SIZE_MULTIPLIERS[SIZE_MULTIPLIERS.length - 1], 500);
				dropZone = maxRef + 160;
			};

			const st1 = ScrollTrigger.create({
				trigger: matter,
				start: 'top center',
				once: true,
				onEnter: startDrop,
			});
			const st2 = ScrollTrigger.create({
				trigger: matter,
				pin: matters.area,
				pinSpacing: true,
				start: 'top top',
				end: 'bottom bottom',
			});

			cleanup = function () {
				dropTimerIds.forEach((id) => clearTimeout(id));
				dropTimerIds = [];
				matterObserver?.disconnect();
				pauseMatter();
				cancelAnimationFrame(rafId);
				Runner.stop(runner);
				if (mouseRef) Mouse.clearSourceEvents(mouseRef);
				st1.kill();
				st2.kill();
				matters.wrap.innerHTML = '';
			};
		}
		function registerMatterResizeScene() {
			window.__resizeScenes.matter = {
				resize: () => resizeWalls?.(),
				settle: ({ tierChanged }) => {
					if (tierChanged || getTier() !== currentTier) {
						build();
						registerMatterResizeScene();
						return;
					}
					resizeMatterBodies?.();
					resizeWalls?.(true);
				},
			};
		}

		build();
		registerMatterResizeScene();
	}
	initMatters();



	/* <Section Collaboration Function> - 모션 함수 */
	function initCollab(){
		const collaboration = document.querySelector('.section.collab');				
		if(!collaboration) return;
		
		const collab = {};

		collab.mm 	= gsap.matchMedia();
		collab.wrap = collaboration.querySelectorAll('.collab-wrap');
		collab.wrap.forEach( (item, idx) => {
			collab.max = item.querySelector('.max-wrap');
			collab.bg	 = item.querySelector('.collab-bg');
			collab.dim	 = item.querySelector('.collab-dim');
			collab.line	 = item.querySelector('.collab-line');

			collab.tl = gsap.timeline({
				scrollTrigger:{
					trigger: item,
					start: "top top",
					pin: true,
					pinSpacing: false,
					scrub: true,
					invalidateOnRefresh: true,
				}
			});

			item._collabTimeline = collab.tl;

			gsap.set(collab.max, { yPercent: 70, });
			gsap.set(collab.bg	 , { scale: 1.2, });
			gsap.set(collab.dim	 , { autoAlpha: 0.4, });
			gsap.set(collab.line , { yPercent: 0, });

			collab.tl.to(collab.max, { yPercent: -60, })
			.to(collab.bg,	 { yPercent: -70, scale: 1, }, "<")
			.to(collab.dim,	 { autoAlpha: 1, }, "<")
			.to(collab.line, { yPercent: -40, }, "<");


			collab.titArea	= item.querySelector('.collab-inner');
			collab.imgArea 	= item.querySelector('.img-area');
			collab.vodArea 	= item.querySelector('.video-area');

			collab.tit 		= item.querySelector('.title');
			collab.sub 		= item.querySelector('.sub-title');
			collab.txt 		= item.querySelector('.text');
		
			const revealDirections = [
				{ from: 'inset(100% 0% 0% 0%)', to: 'inset(0% 0% 0% 0%)' },
				{ from: 'inset(0% 0% 100% 0%)', to: 'inset(0% 0% 0% 0%)' },
				{ from: 'inset(0% 100% 0% 0%)', to: 'inset(0% 0% 0% 0%)' },
				{ from: 'inset(0% 0% 0% 100%)', to: 'inset(0% 0% 0% 0%)' },
				{ from: 'polygon(0% 100%, 0% 100%, 0% 100%, 0% 100%)',   
					to: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)' },
				{ from: 'polygon(100% 100%, 100% 100%, 100% 100%, 100% 100%)', 
					to: 'polygon(100% 0%, 0% 0%, 0% 100%, 100% 100%)' },
				{ from: 'polygon(0% 0%, 0% 0%, 0% 0%, 0% 0%)',   
					to: 'polygon(0% 100%, 100% 100%, 100% 0%, 0% 0%)' },
				{ from: 'polygon(100% 0%, 100% 0%, 100% 0%, 100% 0%)', 
					to: 'polygon(100% 100%, 0% 100%, 0% 0%, 100% 0%)' },
			];
			const picked = gsap.utils.random(revealDirections);

			gsap.set([
				collab.tit, collab.sub, 
				collab.txt, collab.imgArea,
			],{
				y:  60,
				autoAlpha: 0,
			});
			gsap.set(collab.vodArea, { clipPath: picked.from, });

			/* ✅ collab.tl2를 mm.add "밖"이 아니라 "안"에서 매번 새로 생성
			   -> breakpoint(768px) 전환마다 matchMedia가 이전 tl2를 자동으로 정리하고 새로 만들어서
			   트윈이 중복 누적되는 걸 방지 (achieveTl과 동일한 원리, 이 파일에서 유일하게 남아있던 버그) */
			collab.mm.add({
				isDesktop: '(min-width: 768px)',
				isMobile:  '(max-width: 767px)',
			}, (context) => {
				const { isMobile } = context.conditions;

				collab.tl2 = gsap.timeline({
					scrollTrigger:{
						trigger: collab.titArea,
						start: 'top center',
						toggleActions: 'play none none reverse',
						invalidateOnRefresh: true,
					}
				});

				if(!isMobile){
					collab.tl2.to([
						collab.tit, collab.sub, 
						collab.txt, collab.imgArea,
					],{
						y: 0,
						autoAlpha: 1,
						duration: 1.5,
						ease: "power4.out",
						stagger: 0.3,
					})
					.to(collab.vodArea, {
						clipPath: picked.to,
						duration: 0.8,
						ease: "power3.out",
					}, "<");
				}else{
					gsap.set(collab.vodArea, { y: 60, autoAlpha: 0 });

					collab.tl2.to([
						collab.tit, collab.sub, 
						collab.txt, collab.imgArea,
					],{
						y: 0,
						autoAlpha: 1,
						duration: 1.5,
						ease: "power4.out",
						stagger: 0.3,
					})
					.to(collab.vodArea, {
						y: 0, autoAlpha: 1, 
						duration: 1.2, ease: "power4.out",
					}, "<0.4")
					.to(collab.vodArea, {
						clipPath: picked.to,
						duration: 0.8,
						ease: "power3.out",
					}, "<0.8");
				}
			});

		});
		let collabMarqueeCleanup = initCollabLineMarquee(collaboration);
		window.__resizeScenes.collab = {
			settle: ({ tierChanged }) => {
				if (!tierChanged) return;
				collabMarqueeCleanup?.();
				collabMarqueeCleanup = initCollabLineMarquee(collaboration);
			},
		};
	}
	function initCollabLineMarquee(collab) {
		const isMobile = responsiveState.getTier() === 'mobile';
		const tickerCallbacks = [];
		let cancelled = false;

		(document.fonts?.ready || Promise.resolve()).then(() => {
			if (cancelled) return;
			requestAnimationFrame(() => {
				if (cancelled) return;
				const textPaths = [...collab.querySelectorAll('.collab-line-text textPath')]
					.filter((tp) => !tp.dataset.marqueeReady && tp.textContent.trim());

				const measurements = textPaths.map((textPath) => {
					const originalText = textPath.dataset.originalText || textPath.textContent.trim();
					textPath.dataset.originalText = originalText;
					const phrase = originalText + ' ';
					const path = textPath.closest('svg')?.querySelector('.collab-path');
					const phraseWidth = textPath.parentElement.getComputedTextLength();
					const pathLength = path ? path.getTotalLength() : 0;
					const wrap = textPath.closest('.collab-wrap');
					return { textPath, phrase, phraseWidth, pathLength, wrap };
				});

				measurements.forEach(({ textPath, phrase, phraseWidth, pathLength, wrap }) => {
					const repeatCount = (!phraseWidth || !isFinite(phraseWidth) || !pathLength)
						? 30
						: Math.ceil(pathLength / phraseWidth) + 2;
					textPath.textContent = phrase.repeat(repeatCount);

					if (!isMobile) {
						const state = { offset: 0 };
						const ticker = () => {
							const st = wrap?._collabTimeline?.scrollTrigger;
							if (!st || !st.isActive) return;
							state.offset = (state.offset + 0.02) % 100;
							textPath.setAttribute('startOffset', state.offset + '%');
						};
						gsap.ticker.add(ticker);
						tickerCallbacks.push(ticker);
					}
					textPath.dataset.marqueeReady = 'true';
				});
			});
		});

		return () => {
			cancelled = true;
			tickerCallbacks.forEach((ticker) => gsap.ticker.remove(ticker));
			collab.querySelectorAll('.collab-line-text textPath').forEach((textPath) => {
				if (textPath.dataset.originalText) textPath.textContent = textPath.dataset.originalText;
				delete textPath.dataset.marqueeReady;
			});
		};
	}
	initCollab();


	
	/* <Section Gallery Function> - 모션 함수 */
	let flipGallery;
	function initGallery(){
		const gallery = document.querySelector('.section.gallery');
		if(!gallery) return;

		const galleries = {};
		galleries.area		= gallery.querySelector('.gallery-area');
		galleries.wraps		= gallery.querySelectorAll('.gallery-wrap:not(.gallery)');
		galleries.image		= gallery.querySelector('.img-wrap.gallery .img');

		galleries.allWraps	= gallery.querySelectorAll('.gallery-wrap');
		galleries.imgWraps	= gallery.querySelectorAll('.img-wrap');

		galleries.marqueeWrap 	= gallery.querySelector('.marquee-wrap');
		galleries.marquee 		= gallery.querySelector('.marquee');

		flipGallery && flipGallery.revert();
		galleries.area.classList.remove("flips");
		galleries.allWraps.forEach(el => el.classList.remove("flips"));

		flipGallery = gsap.context(() => {
			galleries.area.classList.add("flips");
			galleries.allWraps.forEach(el => el.classList.add("flips"));

			const flipState = Flip.getState(galleries.imgWraps);

			galleries.area.classList.remove("flips");
			galleries.allWraps.forEach(el => el.classList.remove("flips"));

			const flip = Flip.to(flipState, {
				simple: true,
				ease: "expoScale(1, 5)",
				duration: 1,
			});

			gsap.set(galleries.marqueeWrap, {
				clipPath: 'inset(0% 100% 0% 0%)',
				yPercent: 0,
			});
			
			const flipTl = gsap.timeline({
				scrollTrigger: {
					trigger: gallery,
					start: 'top top',
					end: 'bottom bottom',
					pin: galleries.area,
					pinSpacing: false,
					scrub: true,
					invalidateOnRefresh: true,
					onUpdate: (self) => {
						const yTranslate = self.progress * 500;
						const centerImg  = 1.5 - self.progress * 0.5;
						const positions  = 1 - self.progress * 0.005;

						galleries.wraps.forEach((item, idx) => {
							gsap.set(item, { y: idx % 2 === 0 ? yTranslate : -yTranslate });
						});

						gsap.set(galleries.image, {
							backgroundPosition: `center ${positions * 30}%`,
							scale: centerImg,
						});
					}
				}
			});

			if (!galleries.marquee.dataset.motionMarqueeReady) {
				motionMarquee({
					target : '.section.gallery .marquee .inner',
					text   : 'THE PEOPLE BEHIND WEEKENDS',
					speed  : 2,
					cnt    : 10,
				});
				galleries.marquee.dataset.motionMarqueeReady = 'true';
			}

			flipTl
			.add(flip)
			.to({}, { duration: 0.5 })
			.to(galleries.marqueeWrap, {
				clipPath: 'inset(0% 0% 0% 0%)',
				duration: 1.5,
				ease: 'power1.inOut',
			});
			return () => gsap.set(galleries.imgWraps, { clearProps: "all" });
		});
	}
	initGallery();
	window.__resizeScenes.gallery = {
		settle: ({ tierChanged }) => {
			if (tierChanged) initGallery();
		},
	};



	/* <Section Achieve Motion> - 모션 함수 */
	function initAchieve(){
		const achieveMm = gsap.matchMedia();

		const achieve = document.querySelector('.section.achieve');
		if(!achieve) return;

		const achieved = {};
		achieved.inner 	= achieve.querySelector('.achieve-inner');	
		achieved.tit 	= achieve.querySelectorAll('.title .split span');

		achieved.wrap 	= achieve.querySelectorAll('.achieve-wrap');
		
		gsap.set(achieved.tit, { yPercent: 102, autoAlpha: 0 });
		gsap.to	(achieved.tit,{
			scrollTrigger:{
				trigger: achieve,
				start: 'top top',
				toggleActions: 'play none none reverse',
			},
			yPercent: 0,
			autoAlpha: 1,
			duration: 1.2,
			ease: "power4.out",
			stagger: 0.1,
		});

		achieveMm.add({
			isDesktop: '(min-width: 768px)',
			isMobile:  '(max-width: 767px)',
		}, (context) => {
			const { isMobile } = context.conditions;
			const mid = (achieved.wrap.length - 1) / 2;

			const achieveTl = gsap.timeline({
				scrollTrigger: {
					trigger: achieve,
					start: 'top top',
					end: 'bottom bottom',
					scrub: 1,
					pin: achieved.inner,
					invalidateOnRefresh: true,
				}
			});

			achieved.wrap.forEach((item, idx) => {
				const distance = idx - mid;

				if (isMobile) {
					gsap.set(item, {
						y: '102vh',
						yPercent: -distance * 120,
						rotate: distance * 14,
					});
				} else {
					gsap.set(item, {
						y: '102vh',
						xPercent: -distance * 120,
						rotate: distance * 14,
					});
				}

				achieveTl.to(item, {
					y: 0,
					ease: 'power3.out',
					duration: 1.1,
				}, idx * 0.8);
			});

			achieveTl.to(achieved.wrap, {
				xPercent: 0,
				yPercent: 0,
				rotate: 0,
				ease: 'power3.out',
				duration: 2,
			}, '>');
		});
	}
	initAchieve();


	/* <GSAP Refresh> - 모션 초기화 */
	requestAnimationFrame(() => {
		ScrollTrigger.refresh();
	});
});
/* // [Document Ready] - DOM 로드 시 실행 함수 종료 */
/* [Window Event]는 상단 resizeCoordinator가 단일 책임으로 처리한다. */