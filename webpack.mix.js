 /**
 * ===========================
 * Benoรฎt Delorme - A capable website/webapp config built.
 * BBSM - Benoรฎt's Boilerplate Static Multi-languages
 * https://github.com/benoitdelorme/bbsm
 * ===========================
 **/

 /** 
 *
 * Contents
 *
 * ๐๏ธ Settings: Base config
 * ๐๏ธ Settings: Source folders
 * ๐๏ธ Settings: Langs
 * ๐๏ธ Settings: Misc
 * ๐  Templates
 * ๐๏ธ Statics
 * ๐ Images
 * ๐ Scripts
 * ๐ Scripts: Polyfill
 * ๐ Scripts: Auto import libraries
 * ๐ Scripts: Global Variables
 * ๐ Scripts: Linting
 * ๐จ Styles
 */

let mix                = require('laravel-mix');
let nun                = require('laravel-mix-nunjucks');
let imagemin           = require("laravel-mix-imagemin");
let polyfill           = require("laravel-mix-polyfill");
let CopyWebpackPlugin  = require('copy-webpack-plugin');

/**
 * ๐๏ธ Settings: Base config
*/
const config = {
    publicFolder: !mix.inProduction() ? "client" : "client"
};

/**
 * ๐๏ธ Settings: Source folders
*/
const source = {
    root: path.resolve("src/"),
    images: path.resolve("src/images"),
    icons: path.resolve("src/icons"),
    videos: path.resolve("src/videos"),
    scripts: path.resolve("src/js"),
    styles: path.resolve("src/scss"),
    fonts: path.resolve("src/fonts"),
    templates: path.resolve("src/templates"),
    datas: path.resolve("src/data"),
    htaccess: path.resolve("src/")
};

/**
 * ๐๏ธ Settings: Langs
 * hash = uri, file = data/**.json, lang = {{lang}}
*/
let langs = [
    {
        hash: 'fr-ca',
        file: 'fr-ca',
        lang: 'fr'
    }
];

let i18n = {};

// ๐๏ธ Settings: Misc
mix.setPublicPath(config.publicFolder);
mix.disableNotifications();
mix.webpackConfig({ resolve: { alias: source } });
!mix.inProduction() && mix.sourceMaps();

/**
 * ๐  Templates
 * Convert Nunjunk HTML
 * https://github.com/moyus/laravel-mix-nunjucks
*/
for(let i = 0 ; i < langs.length ; i++) {

    let langFolder = (i != 0) ? langs[i].hash : '';
    let langFile = require(source.datas + "/" + langs[i].file+'.json');
    
    i18n[langs[i].lang] = langFile;

    mix.njk(source.templates, config.publicFolder+"/"+langFolder, {
        ext: '.html',
        data: {
            assets: (i != 0) ? '..' : '.',
            lang: langs[i].lang,
            data: langFile
        }
    });
}

/**
 * ๐๏ธ Copy statics files
*/
// mix.copyDirectory(source.images, config.publicFolder+'/images')
mix.copyDirectory(source.videos, config.publicFolder+'/videos');
mix.copyDirectory(source.fonts, config.publicFolder+'/fonts');
mix.copy("src/.htaccess", config.publicFolder+"/.htaccess");

/**
 * ๐ Images
 * Images are optimized and copied to the build directory
 * https://github.com/CupOfTea696/laravel-mix-imagemin
 * https://github.com/Klathmon/imagemin-webpack-plugin#api
 *
*/
mix.webpackConfig({
    plugins: [
        //Compress images
        new CopyWebpackPlugin({
            patterns: [
                {
                    from: 'src/images',
                    to: 'images',
                }
            ]
        })
    ],
});


/**
 * ๐ Scripts
 * Script files are transpiled to vanilla JavaScript
 * https://laravel-mix.com/docs/4.0/mixjs
 */
mix.js(source.scripts+'/app.js', config.publicFolder+'/js/app.js');


/**
 * ๐ Scripts: Polyfills
 * Automatically add polyfills for target browsers with core-js@3
 * See "browserslist" in package.json for your targets
 * https://github.com/zloirock/core-js/blob/master/docs/2019-03-19-core-js-3-babel-and-a-look-into-the-future.md
 * https://github.com/scottcharlesworth/laravel-mix-polyfill#options
 */
mix.polyfill({
    enabled: mix.inProduction(),
    useBuiltIns: "usage", // Only add a polyfill when a feature is used
    targets: false, // "false" makes the config use browserslist targets in package.json
    corejs: 3,
    debug: false, // "true" to check which polyfills are being used
});

/**
 * ๐ Scripts: Global Variables
 * Define globals variables
 * https://stackoverflow.com/questions/48906425/laravel-mix-webpack-environment-dependent-variable-for-client-code
*/
Mix.listen('loading-plugins', plugins => {
    const _ = require('lodash');
    let define = _.find(plugins, plugin => {return plugin.constructor.name === 'DefinePlugin';});
    
    define.definitions['LOG'] = !mix.inProduction() ? JSON.stringify(true) : JSON.stringify(false);
    define.definitions['i18n'] = JSON.stringify(i18n);
});

/**
 * ๐ Scripts: Linting
 */
/* if (!mix.inProduction()) {
    require("laravel-mix-eslint");
    mix.eslint();
} */

/**
 * ๐จ Styles
*/
mix.sass(source.styles+'/style.scss', config.publicFolder+'/css/style.css');
