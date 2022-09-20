import { promisify } from 'node:util';
import { basename } from 'node:path';
import { writeFile } from 'node:fs/promises';
import sass from 'node-sass';

import notification from '../utils/notification.js';
import boobconfig from '../utils/config.js';
import message from '../utils/message.js';
import resolve from '../utils/template.js';
import { PurgeCSS } from 'purgecss';
import postcss, { pluginsMap as postcssPluginsMap } from '../utils/postcss.js';

let postcssProcessor
const sassRender = promisify(sass.render)

export const defaultSassOptions = {
    omitSourceMapUrl: true,
    sourceMap: false,
    sourceMapContents: true,
};

export const developmentSassOptions = Object.assign({}, defaultSassOptions, {
    outputStyle: 'expanded',
});

export const productionSassOptions = Object.assign({}, defaultSassOptions, {
    outputStyle: 'compressed',
});

export const defaultPostCSSOptions = {
    processor: {
        map: {
            annotation: false,
            inline: false,
            sourcesContent: true,
        },
    },
};

export const developmentPostCSSOptions = Object.assign({}, defaultPostCSSOptions);
export const productionPostCSSOptions  = Object.assign({}, defaultPostCSSOptions);

export default async function compileStyles(sassOptions = null, postcssOptions = null) {
    if (sassOptions == null) {
        sassOptions = productionSassOptions;
    } else if (
        sassOptions !== developmentSassOptions &&
        sassOptions !== productionSassOptions
    ) {
        sassOptions = Object.assign({}, defaultSassOptions, sassOptions);
    }

    if (postcss) {
        if (postcssOptions == null) {
            postcssOptions = productionPostCSSOptions;
        } else if (
            postcssOptions !== false &&
            postcssOptions !== developmentPostCSSOptions &&
            postcssOptions !== productionPostCSSOptions
        ) {
            postcssOptions = Object.assign({}, defaultPostCSSOptions, postcssOptions);
        }
    }

    boobconfig.tasks.styles.forEach(async ({
        infile,
        outfile,
        label = null
    }) => {
        const filestem = basename((outfile || 'undefined'), '.css');

        const timeLabel = `${label || `${filestem}.css`} compiled in`;
        console.time(timeLabel);

        try {
            infile  = resolve(infile);
            outfile = resolve(outfile);

            let result = await sassRender(Object.assign({}, sassOptions, {
                file: infile,
                outFile: outfile,
            }));

            if (postcss && postcssOptions) {
                if (typeof postcssProcessor === 'undefined') {
                    postcssProcessor = createPostCSSProcessor(
                        postcssPluginsMap,
                        postcssOptions
                    );
                }

                result = await postcssProcessor.process(
                    result.css,
                    Object.assign({}, postcssOptions.processor, {
                        from: outfile,
                        to: outfile,
                    })
                );

                if (result.warnings) {
                    const warnings = result.warnings();
                    if (warnings.length) {
                        message(`Error processing ${label || `${filestem}.css`}`, 'warning');
                        warnings.forEach((warn) => {
                            message(warn.toString());
                        });
                    }
                }
            }

            try {
                await writeFile(outfile, result.css).then(() => {
                    // Purge CSS once file exists.
                    if (outfile) {
                        purgeUnusedCSS(outfile, `${label || `${filestem}.css`}`);
                    }
                });
                
                if (result.css) {
                    message(`${label || `${filestem}.css`} compiled`, 'success', timeLabel);
                } else {
                    message(`${label || `${filestem}.css`} is empty`, 'notice', timeLabel);
                }
            } catch (err) {
                message(`Error compiling ${label || `${filestem}.css`}`, 'error');
                message(err);

                notification({
                    title:   `${label || `${filestem}.css`} save failed 🚨`,
                    message: `Could not save stylesheet to ${label || `${filestem}.css`}`
                });
            }

            if (result.map) {
                try {
                    await writeFile(outfile + '.map', result.map.toString());
                } catch (err) {
                    message(`Error compiling ${label || `${filestem}.css.map`}`, 'error');
                    message(err);

                    notification({
                        title:   `${label || `${filestem}.css.map`} save failed 🚨`,
                        message: `Could not save sourcemap to ${label || `${filestem}.css.map`}`
                    });
                }
            }
        } catch (err) {
            message(`Error compiling ${label || `${filestem}.scss`}`, 'error');
            message(err.formatted || err);

            notification({
                title:   `${label || `${filestem}.scss`} compilation failed 🚨`,
                message: (err.formatted || `${err.name}: ${err.message}`)
            });
        }
    });
};

function createPostCSSProcessor(pluginsListOrMap, options)
{
    let plugins;

    if (Array.isArray(pluginsListOrMap)) {
        plugins = pluginsListOrMap;
    } else {
        plugins = [];

        for (let [ name, plugin ] of Object.entries(pluginsListOrMap)) {
            if (name in options) {
                plugin = plugin[name](options[name]);
            }

            plugins.push(plugin);
        }
    }

    return postcss(plugins);
}

async function purgeUnusedCSS(outfile, label) {
    label = label ?? basename(outfile);
    const timeLabel = `${label} purged in`;
    console.time(timeLabel);

    const purgeCSSContentFiles = Array.from(boobconfig.tasks.purgeCSS.content);

    const purgeCSSResults = await new PurgeCSS().purge({
        content: purgeCSSContentFiles,
        css: [ outfile ],
        rejected: true,
        defaultExtractor: content => content.match(/[a-z0-9_\-\\\/\@]+/gi) || [],
        safelist: {
            standard: [ /^((?!\bu-gc-).)*$/ ]
        }
    })

    for(let result of purgeCSSResults) {
        await writeFile(outfile, result.css)

        message(`${label} purged`, 'chore', timeLabel);
    }
}