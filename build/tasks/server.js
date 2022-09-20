import nodemon from 'nodemon';
import notification from '../utils/notification.js';

export default function server(config) {
    nodemon({ script: 'server.js' }).on('start', function () {
        notification({
            title:   'Server',
            message: `Listen: localhost:${config.node.server.port}`
        });
    }).on('crash', function (e) {
        notification({
            title:   'Server',
            message: `Crash: ${e}`
        });
    });
}