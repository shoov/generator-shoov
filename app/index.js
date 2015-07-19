'use strict';
var yeoman = require('yeoman-generator');
var chalk = require('chalk');
var glob = require('glob');
var fs = require('fs-extra');
var path = require('path');
var yosay = require('yosay');
var tilde = require('tilde-expansion');
var opn = require('opn');

module.exports = yeoman.generators.Base.extend({
  initializing: function () {
    this.pkg = require('../package.json');
  },

  prompting: function () {
    var done = this.async();

    var self = this;

    // Have Yeoman greet the user.
    self.log(yosay(
      'Welcome to the ' + chalk.red('Shoov') + ' generator!'
    ));

    var shoovExists = false;
    tilde('~/', function(s) {
      shoovExists = fs.existsSync(path.resolve(s, '.shoov.json'));
    });

    if (!shoovExists) {
      self.log(
        chalk.red('Error: Please create your ~/.shoov.json file')
      );
      opn('https://app.shoov.io/#/my-account');
      return;
    }

    done();
  },

  writing: {
    app: function() {
      var self = this;

      var files  = glob.sync(self.templatePath() + '/**/*');

      files.forEach(function(file) {
        if (fs.lstatSync(file).isDirectory()) {
          // Don't try to copy a directory.
          return;
        }

        var fileName = file.replace(self.templatePath(), '');

        var dir = path.dirname(fileName);
        var baseName = path.basename(fileName);
        var extension = path.extname(baseName);

        if (extension !== '.scss') {
          // If not a SCSS file, convert the prefix of the underscore to a dot.
          baseName = baseName.replace(/^_/g, '.');
        }

        var newFileName = dir != '/' ? dir.replace('/', '') + '/' + baseName : baseName;

        self.fs.copy(file, self.destinationPath(newFileName));
      });
    }
  },

  install: {

    /**
     * Install npm.
     */
    client: function() {
      if (this.options['skip-install']) {
        this.log('Skipping install');
        return;
      }

      this.log('npm install');
      this.npmInstall(null);
    }
  }
});
