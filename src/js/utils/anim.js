import gsap from 'gsap';
import { offset } from 'html';

export function parallaxIt(e, target, parent, movement) {
	const relX = e.pageX - offset(parent).left;
	const relY = e.pageY - offset(parent).top;
	const x = (relX - parent.offsetWidth / 2) / parent.offsetWidth * movement;
	const y = (relY - parent.offsetHeight / 2) / parent.offsetHeight * movement;

	gsap.to(target, 1, { x, y, force3D: true });
}