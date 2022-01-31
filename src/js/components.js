import { Config } from './utils/config';
import Playground from './components/Playground';
import Loader from './components/Loader';

const components = {
	'playground' : Playground,
	'loader' : Loader,
};

class Components {

	constructor(params) {
		if(params !== undefined) this.params = params;
		this.$cache = {};
		this.instances = [];
 
		this.initCache();
		this.init();
	}

	initCache() {
        this.body = document.querySelector('body');
		this.components = this.body.querySelectorAll('[data-component]');
	}
	
	init(){
		this.components.forEach((el) => {
			let comp = el.getAttribute('data-component')

			if(typeof components[comp] !== 'function') return;
			
			let obj = new components[comp]({target : el});

			this.instances.push(obj);
        });

        console.log(this.instances);
    }
    

	resize() {
		$.each(this.instances, function() {
			let comp = this;
			let cond = (typeof comp.resize === 'function');
			if(cond) comp.resize();
		});
	}
}

export default Components;