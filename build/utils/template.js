import boobconfig from './config.js'

const templateData = flatten({
    paths: boobconfig.paths
})

export default function resolve(input, data = templateData) {
    switch (typeof input) {
        case 'string': {
            return resolveValue(input, data)
        }

        case 'object': {
            if (input == null) {
                break;
            }

            if (Array.isArray(input)) {
                return input.map((value) => resolve(value, data))
            } else {
                for (const key in input) {
                    input[key] = resolve(input[key], data)
                }
            }
        }
    }

    return input
}


function flatten(input, prefix, target = {}) {
    for (let key in input) {
        let field = (prefix ? prefix + '.' + key : key);

        if (typeof input[key] === 'object') {
            flatten(input[key], field, target);
        } else {
            target[field] = input[key];
        }
    }

    return target;
}

export function resolveValue(input, data = templateData) {
    const tags = [];

    if (data !== templateData) {
        data = flatten(data);
    }

    for (let tag in data) {
        tags.push(escapeRegExp(tag));
    }

    if (tags.length === 0) {
        return input;
    }

    const search = new RegExp('\\{%\\s*(' + tags.join('|') + ')\\s*%\\}', 'g');
    return input.replace(search, (match, key) => {
        let value = data[key];

        switch (typeof value) {
            case 'function':
                let args = Array.prototype.slice.call(arguments, -2);
                return value.call(data, match, args[0], args[1]);

            case 'string':
            case 'number':
                return value;
        }

        return '';
    });
}


function escapeRegExp(str) {
    return str.replace(/[\[\]\{\}\(\)\-\*\+\?\.\,\\\^\$\|\#\s]/g, '\\$&');
}
