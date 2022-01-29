import { stats } from './stats';

export class Config {

	constructor(CONFIG = {}) {
		Object.assign(this, CONFIG);

		if (this.DEBUG.STATS)
			this.setStats();

		if (this.DEBUG.BREAKPOINT)
			this.breakpoint();

		if (!this.DEBUG.LOG)
			this.log();

	}

	setStats() {
		stats();
	}

	setBreakpoint() {
		document.documentElement.classList.add('debug');
	}

	setLog() {
		console.log = console.error = console.info = console.debug = console.warn = console.trace = console.dir = console.dirxml = console.group = console.groupEnd = console.time =    console.timeEnd = console.assert = console.profile = function() {};
	}

}