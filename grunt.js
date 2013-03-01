/*global top: true, jasmine: true */

var fs = require('fs')
  , path = require('path')
  , jsdom = require('jsdom')
  , buildTask = require('./lib/build-grunt-task');

function convertToAbsolutePaths(paths) {
  var rootPath = fs.realpathSync('.')
    , i;
  for (i = 0; i < paths.length; i++) {
    paths[i] = rootPath + '/' + paths[i];
  }
}

var dir = {
    dist:'dist',
    reports:'reports',
    spec:'spec'
  },
  verifyFiles = [ 'src/js/*.js' ];

module.exports = function (grunt) {
  var gruntConfig;
  convertToAbsolutePaths(verifyFiles);
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-jslint');
  grunt.loadNpmTasks('grunt-jasmine-node');
  grunt.loadNpmTasks('grunt-contrib-less');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.registerTask('verify', 'jslint');
  if ((fs.existsSync ? fs : path).existsSync(dir.spec)) {
    grunt.registerTask('test', 'jasmine_node');
  } else {
    grunt.registerTask('test', function () {
      grunt.log.writeln('no test found');
    });
  }
  grunt.registerTask('build-slides', buildTask);
  grunt.registerTask('build', 'less copy build-slides');
  grunt.registerTask('default', 'build');
  gruntConfig = {
    pkg:'<json:package.json>',
    clean:{
      'default':[dir.dist, dir.reports]
    },
    jslint:{
      files:verifyFiles,
      directives:{
        require:false,
        browser:true,
        node:true,
        sloppy:true,
        white:true,
        nomen:true,
        stupid:true,
        regexp:true,
        unparam:true,
        plusplus:true,
        vars:true
      },
      options:{
        errorsOnly:true,
        jslintXml:dir.reports + '/jslint.xml',
        failOnError:false
      }
    },
    jasmine_node:{
      specNameMatcher:'.*Spec',
      projectRoot:dir.spec,
      requirejs:false,
      forceExit:true,
      jUnit:{
        report:true,
        savePath:dir.reports + '/',
        useDotNotation:true,
        consolidate:true
      }
    },
    less:{
      production:{
        options:{
          yuicompress:true
        },
        files:{
          'dist/styles/slideshow.css':'src/styles/slideshow.less'
        }
      }
    },
    copy:{
      dist:{
        files:{
          'dist/images/':'src/images/**',
          'dist/js/':'src/js/**',
          'dist/lib/':'src/lib/**',
          'dist/slides/':'src/slides/*/!(slide.html)'
        }
      }
    }
  };
  var testOption = grunt.option('test');
  if (testOption) {
    gruntConfig.jasmine_node.specNameMatcher = testOption;
  }
  grunt.initConfig(gruntConfig);
};