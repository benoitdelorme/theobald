
 import notifier from 'node-notifier'

 export default function notification(options, callback) {
     if (typeof options === 'string') {
         options = {
             message: options
         }
     } else if (!options.title && !options.message) {
         throw new TypeError(
             'Notification expects at least a \'message\' parameter'
         )
     }
      
    options.icon = 'https://avatars.githubusercontent.com/u/561485?v=4'
    
     if (typeof callback === 'undefined') {
         if (typeof options.wait === 'undefined') {
             if (typeof options.timeout === 'undefined') {
                 options.timeout = 5
             }
         }
     }
 
     notifier.notify(options, callback)
 }
 