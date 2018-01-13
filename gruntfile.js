module.exports = function (grunt) {

    // Project configuration.
    grunt.initConfig({
        uglify: {
            my_target: {
                files: {
                    './dist/js/bundle.js': ['./src/js/*.js']
                }
            }
        },
        concat: {
            dist: {
                src: ['src/js/*.js'],
                dest: 'dist/js/bundle.js',
            },
        },
    });

    grunt.loadNpmTasks('grunt-contrib-concat');
    // Load the plugin that provides the "uglify" task.
    grunt.loadNpmTasks('grunt-contrib-uglify');

    // Default task(s).
    grunt.registerTask('default', ['uglify', 'concat']);

};