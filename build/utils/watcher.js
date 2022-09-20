import chokidar from 'chokidar'

export default function watcher(folder, callback) {
    chokidar.watch(folder).on('change', (event, path) => {
        if(typeof callback == 'function') {
            if(event)
            callback(event, path)
        }
    })
}