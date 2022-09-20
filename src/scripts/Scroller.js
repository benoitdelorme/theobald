import Lenis from "@studio-freight/lenis"

export default class Scroller {

    static instance

    constructor() {
        if(Scroller.instance)
        {
            return Scroller.instance
        }

        Scroller.instance = this
        
        this.lenis = new Lenis({
            duration: 1.2,
            easing: (t) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t)),
            smooth: true,
            direction: 'vertical'
        })

        this.lenis.on('scroll', ({scroll}) => {
            console.log(scroll)
        })
    }

    update(time) {
        this.lenis.raf(time)
    }
}