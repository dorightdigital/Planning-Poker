module.exports = function (grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json')
  });
  grunt.initConfig({
    concurrent: {
      dev: {
        tasks: ['nodemon', 'watch', 'jasmine'],
        options: {
          logConcurrentOutput: true
        }
      }
    },
    sass: {
      dist: {
        files: {
          'public/src/style.css': 'src/style.scss'
        }
      }
    },
    nodemon: {
      dev: {
        script: 'server/index.js',
        options: {
          env: {
            PORT: '8001'
          },
          ext: 'js',
          watch: ['server']
        }
      }
    },
    watch: {
      css: {
        files: 'src/style.scss',
        tasks: ['sass']
      },
      tests: {
        files: 'test/**.js',
        tasks: ['jasmine']
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-jasmine');
  grunt.loadNpmTasks('grunt-contrib-sass');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-concurrent');
  grunt.loadNpmTasks('grunt-nodemon');
  grunt.registerTask('default', ['sass']);
  grunt.registerTask('dev', ['sass', 'concurrent']);
}
