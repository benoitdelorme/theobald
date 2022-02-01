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
    }
}

export default Components;