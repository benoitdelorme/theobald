import watcher from './utils/watcher.js'
import boobconfig from './utils/config.js'
import compileStyles from './tasks/styles.js'
import compileScripts from './tasks/scripts.js'
import { join } from 'node:path';

/* server(boobconfig) */
compileStyles()
compileScripts()



// CSS WATCHER
watcher(
    join(boobconfig.paths.styles.src, '/**/*.scss'), 
    (event, path) => {
        compileStyles()
    }
)

// JS WATCHER
watcher(
    join(boobconfig.paths.scripts.src, '/**/*.js'), 
    (event, path) => {
        compileScripts()
    }
)