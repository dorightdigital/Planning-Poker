module.exports = function (grunt) {
  var  _ = require('underscore');
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json')
  });
  var srcFiles = [
    'bower_components/angular/angular.js',
    'bower_components/angular-route/angular-route.js',
    'bower_components/jquery/jquery.js',
    'bower_components/jquery-qrcode/jquery.qrcode.min.js',
    'app/main.js',
    'app/**/*.js'
  ];
  var testSrcFiles = _.clone(srcFiles);
  testSrcFiles.push('bower_components/angular-mocks/angular-mocks.js');
  testSrcFiles.push('test/client/helpers/*.js');
  grunt.initConfig({
      concurrent: {
        dev: {
          tasks: ['watch', 'nodemon:local'],
          options: {
            logConcurrentOutput: true
          }
        },
        inttest: {
          tasks: ['nodemon', 'jasmine_node:integration'],
          options: {
            logConcurrentOutput: true
          }
        }
      },
      sass: {
        dist: {
          files: {
            'build/style.css': [
              'style/style.scss'
            ]
          }
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
        server: ['test/server'],
        integration: ['test/integration']
      },
      jasmine: {
        client: {
          src: testSrcFiles,
          options: {
            specs: ['test/client/*.spec.js']
          }
        }
      },
      jshint: {
        dev: {
          src: ['GruntFile.js', 'test/**/*.spec.js', 'public/src/**/*.js', 'server/*.js']
        }
      },
      concat: {
        client: {
          src: srcFiles,
          dest: 'build/app.js'
        }
      },
      watch: {
        css: {
          files: ['style/style.scss'],
          tasks: ['sass']
        },
        jsclient: {
          files: ['app/**/*.js'],
          tasks: ['concat', 'jshint', 'jasmine:client', 'jasmine_node:integration']
        },
        jsclienttest: {
          files: ['test/client/**/*.spec.js'],
          tasks: ['jshint', 'jasmine:client']
        },
        servertest: {
          files: ['server/**/*.js', 'test/server/**/*.spec.js'],
          tasks: ['jasmine_node:server', 'jasmine_node:integration']
        },
        integrationtest: {
          files: ['test/integration/**/*.spec.js'],
          tasks: ['jasmine_node:integration']
        }
      }
    }
  );

  grunt.loadNpmTasks('grunt-sass');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-concurrent');
  grunt.loadNpmTasks('grunt-nodemon');
  grunt.loadNpmTasks('grunt-jasmine-node');
  grunt.loadNpmTasks('grunt-contrib-jasmine');
  grunt.loadNpmTasks('grunt-install-dependencies');

  grunt.registerTask('precompile', ['sass', 'concat']);
  grunt.registerTask('test', ['jasmine_node:server', 'jasmine:client', 'jshint']);
  grunt.registerTask('build', ['install-dependencies:prod', 'precompile']);
  grunt.registerTask('host-dev', ['nodemon:dev']);
  grunt.registerTask('host-live', ['nodemon:live']);
  grunt.registerTask('dev', ['install-dependencies:dev', 'build', 'jasmine_node:server', 'jasmine:client', 'jshint', 'precompile', 'concurrent:dev']);
}
;
