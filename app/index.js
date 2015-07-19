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

  writing: {
    app: function() {
      var self = this;

      // Have Yeoman greet the user.
      this.log(yosay(
        'Welcome to the ' + chalk.red('Shoov') + ' generator!'
      ));

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
    },

    shoovConfigExists: function () {
      var done = this.async();

      var self = this;

      tilde('~/', function(s) {
        if (!fs.existsSync(path.resolve(s, '.shoov.json'))) {
          self.log(chalk.red('---------------------------'));
          self.log(chalk.red('Shoov\'s config file (~/.shoov.json) is missing from your home directory.'));
          self.log(chalk.red('Get it by following the instructions in:'));
          self.log(chalk.yellow('  https://app.shoov.io/#/my-account'));
          self.log(chalk.red('---------------------------'));
          opn('https://app.shoov.io/#/my-account');
        }
      });

      done();
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
      this.npmInstall(null, {cwd: 'visual-monitor'});
    }
  }
});
