import * as io from 'socket.io-client';
import Experience from './Experience/Experience.js'
import Scroller from './Scroller.js';

class App {
    constructor() {
        // DOM
        this.DOM = {}
        this.DOM.experience = document.querySelector('.experience')

        // VARS
        this.url = window.location.origin
        this.toUpdate = [] 
        this.toResize = []

        // INSTANCES
        this.socket = io.connect(this.url)

        this.experience = new Experience({
            targetElement: this.DOM.experience
        })

        this.scroller = new Scroller()

        this.toUpdate.push(this.experience)
        this.toUpdate.push(this.scroller)

        // RAF
        requestAnimationFrame(this.update.bind(this))
    }

    update(time) {
        this.toUpdate.forEach((instance) => {
            instance.update(time)
        })
        
        requestAnimationFrame(this.update.bind(this))
    }
}

window.addEventListener('DOMContentLoaded', () => {
    new App()
})

