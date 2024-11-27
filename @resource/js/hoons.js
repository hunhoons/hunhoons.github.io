// viewPort
const resize = () => {
	hFixed();
	vh();
}

// header fixed
const hFixed = () => {
	let st = window.scrollY;
	let header = document.getElementById('header');
	let footer = document.getElementById('footer');
	if(header){
		let headerH = header.offsetHeight;
		st > headerH ? header.classList.add("fixed") : header.classList.remove("fixed");

		let footerY = footer.offsetHeight;

		//console.log(footerY);
		//console.log(headerH);

	}


};

// vh
const vh = () => {
	let vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
	
};

// scroll up && down
let sTop = 0;
let delta = 80;
const scrollUpDwon = () => {
	let st = window.scrollY;
	if(Math.abs(sTop - st) <= delta) return;
	if((st > sTop) && (sTop > 0)){
		document.body.classList.add('scroll-down');
		document.body.classList.remove('scroll-up');
	}else{
		document.body.classList.add('scroll-up');
		document.body.classList.remove('scroll-down');
	}
	sTop = st;
	resize();
};

// DOM Load
window.addEventListener('DOMContentLoaded', () => {
	resize();
});

// Resize
window.addEventListener('resize', () => {
	resize();
});

// Scroll
window.addEventListener('scroll', () => {
	scrollUpDwon();
});

