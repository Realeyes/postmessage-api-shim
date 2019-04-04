module.exports = function (config) {
    config.set({
        basePath: '../',
        frameworks: ['mocha', 'browserify'],
        files: [
            'dist/*.js',
            'node_modules/es6-promise-polyfill/*.js',
            'test/**/*.test.js',
            { pattern: 'test/rpc/server-frame.html', included: false }
        ],
        client: {
            mocha: {
                timeout: 3000,
            }
        },
        preprocessors: {
            'test/**/*.test.js': ['browserify']
        },
        browserify: {
            debug: true,
            transform: [['babelify', {
                "presets": [
                    [
                        "@babel/preset-env",
                        {
                          "targets": {
                            "browsers": [
                              "edge >= 15",
                              "ff >= 44",
                              "chrome >= 56",
                              "safari >= 11",
                              "iOS >= 11",
                              "opera >= 43",
                              "and_chr >= 66",
                              "android >= 66",
                              "and_ff >= 60"
                            ]
                          }
                        }
                    ]
                ],
                global: true
            }]]
        },
        reporters: ['spec', 'junit'],
        junitReporter: {
            outputDir: 'test-reports',
            suite: '',
            useBrowserName: true,
            xmlVersion: null
        },
        colors: true,
        browserStack: {
            username: process.env.BROWSERSTACK_USERNAME,
            accessKey: process.env.BROWSERSTACK_ACCESS_KEY,
            project: 'postmessage-api-shim',
            forcelocal: true,
        },
        customLaunchers: {
            bs_ie_10_win: {
                base: 'BrowserStack',
                browser: 'ie',
                browser_version: '10',
                os: 'WINDOWS',
                os_version: '8'
            },
            bs_ie_11_win: {
                base: 'BrowserStack',
                browser: 'ie',
                browser_version: '11',
                os: 'WINDOWS',
                os_version: '10'
            },
            bs_edge_14_win: {
                base: 'BrowserStack',
                browser: 'edge',
                browser_version: '14',
                os: 'WINDOWS',
                os_version: '10'
            },
            bs_edge_15_win: {
                base: 'BrowserStack',
                browser: 'edge',
                browser_version: '15',
                os: 'WINDOWS',
                os_version: '10'
            },
            bs_edge_latest_win: {
                base: 'BrowserStack',
                browser: 'edge',
                os: 'WINDOWS',
                os_version: '10'
            },
            bs_chrome_58_win: {
                base: 'BrowserStack',
                browser: 'chrome',
                browser_version: '58',
                os: 'WINDOWS',
                os_version: '10'
            },
            bs_chrome_59_win: {
                base: 'BrowserStack',
                browser: 'chrome',
                browser_version: '59',
                os: 'WINDOWS',
                os_version: '10'
            },
            bs_chrome_latest_win: {
                base: 'BrowserStack',
                browser: 'chrome',
                os: 'WINDOWS',
                os_version: '10'
            },
            bs_firefox_53_win: {
                base: 'BrowserStack',
                browser: 'firefox',
                browser_version: '53',
                os: 'WINDOWS',
                os_version: '10'
            },
            bs_firefox_54_win: {
                base: 'BrowserStack',
                browser: 'firefox',
                browser_version: '54',
                os: 'WINDOWS',
                os_version: '10'
            },
            bs_firefox_latest_win: {
                base: 'BrowserStack',
                browser: 'firefox',
                os: 'WINDOWS',
                os_version: '10'
            },
        },
        local_browsers: ['Chrome', 'Firefox', 'IE', 'Edge'],
        bs_browsers: [
            'bs_ie_11_win',
            'bs_edge_14_win',
            'bs_edge_15_win',
            'bs_edge_latest_win',
            'bs_chrome_58_win',
            'bs_chrome_59_win',
            'bs_chrome_latest_win',
            'bs_firefox_53_win',
            'bs_firefox_54_win',
            'bs_firefox_latest_win'
        ],
    });

    if(config.browserset) {
        if(config[`${config.browserset}_browsers`]) {
            config.browsers = config[`${config.browserset}_browsers`];
        }
        else {
            throw `The key ${config.browserset}_browsers does not exists in karma config!`
        }
    }
    else { //by default run tests in the browsers specified below
        console.info('-----------------------------------------------------------------------------------------------');
        if (process.env.BAMBOO) {
            config.reporters.push('bamboo');
            config.browsers = config.bs_browsers;
            console.info('No "--browserset" command line argument was given thus running test on Browserstack.');
        }
        else {
            config.browsers = config.local_browsers;
            console.info('No "--browserset" command line argument was given thus running test on local.');
        }
        console.info('If you want to define the browserset to run the tests on please specify the "--browserset".');
        console.info('Ex: ');
        console.info('  npm test -- --browserset=local');
        console.info('  npm test -- --browserset=bs');
        console.info('You can also specify to run the test on a single browser only with the "--browsers" argument');
        console.info('Ex: ');
        console.info('  npm test -- --browsers=Chrome');
        console.info('------------------------------------------------------------------------------------------------');
    }


    if(config.browsers === config.bs_browsers && (!process.env.BROWSERSTACK_USERNAME || !process.env.BROWSERSTACK_ACCESS_KEY)) {
        throw('[ERROR] To run tests on Browserstck please specify two environment variables: BROWSERSTACK_USERNAME and BROWSERSTACK_ACCESS_KEY!')

    }



    // run static file servera to be able to load server iframe from different domain
    let staticHttpServer = require('node-static');
    let fileServer = new staticHttpServer.Server('./');
    require('http').createServer(function (request, response) {
        request.addListener('end', function () {
            request.url = request.url.replace('/base',''); //strip of base/ prefix to be able to use same urls as karma's built-in server
            fileServer.serve(request, response);
        }).resume();
    }).listen(9889); //TODO: port number should be random and passed to the client side
};
