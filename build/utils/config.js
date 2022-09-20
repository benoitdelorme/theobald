 import boobconfig from '../../boob.json' assert {type: "json"}

 let usrconfig
 
 try {
     usrconfig = await import('../../boob.local.json')
     usrconfig = usrconfig.default
 
     merge(boobconfig, usrconfig)
 } catch (err) {
     // do nothing
 }
 
 export default boobconfig

export function merge(target, ...sources) {
    for (const source of sources) {
        if (target === source) {
            throw new TypeError(
                'Cannot merge, target and source are the same'
            )
        }

        for (const key in source) {
            if (source[key] != null) {
                if (isObjectLike(source[key]) && isObjectLike(target[key])) {
                    merge(target[key], source[key])
                    continue
                } else if (Array.isArray(source[key]) && Array.isArray(target[key])) {
                    target[key] = target[key].concat(source[key])
                    continue
                }
            }

            target[key] = source[key]
        }
    }

    return target
}