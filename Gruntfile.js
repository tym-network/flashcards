module.exports = function(grunt) {
    grunt.loadNpmTasks('grunt-contrib-less');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-watch');

    grunt.initConfig({
        concat: {
            target: {
                files: {
                    'public/css/cardashian.css': ['public/css/*.css', '!public/css/cardashian.css','!public/css/cardashian.min.css'],
                }
            }
        },
        uglify: {
            target: {
                files: {
                    'public/js/cardashian.min.js': ['public/js/cardashian.js'],
                }
            }
        },
        cssmin: {
            target: {
                files: [
                    {
                      expand: true,
                      cwd: 'public/css/',
                      src: ['cardashian.css', '!cardashian.min.css'],
                      dest: 'public/css/',
                      ext: '.min.css',
                    }
                ]
            }
        },
        less: {
            target: {
                files: [
                    {
                      expand: true,
                      cwd: 'public/css/',
                      src: ['*.less'],
                      dest: 'public/css/',
                      ext: '.css',
                    }
                ]
            }
        },
        watch: {
            all: {
                files: ['public/js/**/*.js', 'public/css/*.less'],
                tasks: ['default'],
                options: {
                    spawn: false
                }
            }
        }
    });
    grunt.registerTask('default', ['less', 'concat', 'uglify', 'cssmin']);
    grunt.registerTask('watchAll', ['watch']);
};
