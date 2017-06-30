module.exports = function (config) {
    config.set({
        basePath: '../',
        frameworks: ['mocha', 'browserify'],
        files: [
            'dist/index.js',
            'test/**/*.test.js',
            { pattern: 'test/rpc/server-frame.html', included: false }
        ],
        preprocessors: {
            'test/**/*.test.js': ['browserify']
        },
        browserify: {
            debug: true,
            transform: [['babelify', { 'presets': ['es2015'] }]]
        },
        reporters: ['spec', 'junit'],
        junitReporter: {
            outputDir: 'test-reports',
            suite: '',
            useBrowserName: true,
            xmlVersion: null
        },
        colors: true,
        browsers: ['Chrome'],
        singleRun: true
    });
};
