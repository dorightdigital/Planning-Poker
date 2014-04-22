module.exports = function (grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json')
  });
  grunt.initConfig({
    concurrent: {
      dev: {
        tasks: ['watch:jstest', 'watch:css', 'nodemon:local'],
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
      local: {
        script: 'server/index.js',
        options: {
          env: {
            PORT: '7901'
          },
          ext: 'js',
          watch: ['server']
        }
      },
      dev: {
        script: 'server/index.js',
        options: {
          env: {
            PORT: '8001'
          },
          watch: ['none']
        }
      },
      live: {
        script: 'server/index.js',
        options: {
          env: {
            PORT: '8101'
          },
          watch: ['none']
        }
      }
    },
    jasmine_node: {
      all: ['test/']
    },
    watch: {
      css: {
        files: ['src/style.scss'],
        tasks: ['sass']
      },
      jstest: {
        files: ['test/**/*.spec.js', 'public/**/*.js', 'server/*.js'],
        tasks: ['jasmine_node']
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-sass');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-concurrent');
  grunt.loadNpmTasks('grunt-nodemon');
  grunt.loadNpmTasks('grunt-jasmine-node');
  grunt.registerTask('test', ['jasmine_node']);
  grunt.registerTask('host-dev', ['sass', 'nodemon:dev']);
  grunt.registerTask('host-live', ['sass', 'nodemon:live']);
  grunt.registerTask('dev', ['jasmine_node', 'sass', 'concurrent']);
}
