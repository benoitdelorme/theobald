import Components from './components';
import { Config } from './utils/config';
import { defaults } from './utils/global';


class App {
    constructor() {
        this.config = new Config(
			{
				DEBUG: {
					BREAKPOINT: false,
					LOG: LOG,
					STATS: false
				}
			}
        ); 
        
        this.components = new Components();
        
    }

    init() {

    }
}
 
let app = new App();