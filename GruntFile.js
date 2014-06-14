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
      wiredep: {
        target: {
          src: 'server/js-dependencies.html'
        }
      },
      "install-dependencies": {
        dev: {
          isDevelopment: true
        },
        prod: {
          isDevelopment: true
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
    }
  )
  ;

  grunt.loadNpmTasks('grunt-contrib-sass');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-concurrent');
  grunt.loadNpmTasks('grunt-wiredep');
  grunt.loadNpmTasks('grunt-nodemon');
  grunt.loadNpmTasks('grunt-jasmine-node');
  grunt.loadNpmTasks('grunt-install-dependencies');
  grunt.registerTask('precompile', ['sass', 'wiredep']);
  grunt.registerTask('test', ['jasmine_node']);
  grunt.registerTask('build', ['install-dependencies:prod', 'precompile']);
  grunt.registerTask('host-dev', ['nodemon:dev']);
  grunt.registerTask('host-live', ['nodemon:live']);
  grunt.registerTask('dev', ['install-dependencies:dev', 'jasmine_node', 'precompile', 'concurrent']);
}
