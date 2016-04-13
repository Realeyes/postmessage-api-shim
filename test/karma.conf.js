module.exports = function (config) {
    config.set({
        basePath: '../',
        frameworks: ['mocha', 'browserify'],
        files: [
            'dist/index.js',
            'test/**/*.test.js'
        ],
        preprocessors: {
            'test/**/*.test.js': ['browserify']
        },
        browserify: {
            debug: true,
            transform: [['babelify', { 'presets': ['es2015'] }]]
        },
        reporters: ['spec'],
        colors: true,
        browsers: ['PhantomJS'],
        singleRun: true
    });
};
