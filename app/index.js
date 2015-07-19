'use strict';
var yeoman = require('yeoman-generator');
var chalk = require('chalk');
var glob = require('glob');
var fs = require('fs-extra');
var path = require('path');
var yosay = require('yosay');

module.exports = yeoman.generators.Base.extend({
  initializing: function () {
    this.pkg = require('../package.json');
  },

  writing: {
    app: function() {
      var self = this;

      // Have Yeoman greet the user.
      self.log(yosay(
        'Welcome to the ' + chalk.red('Shoov') + ' generator!'
      ));

      var files  = glob.sync(self.templatePath() + '/**/*');

      files.forEach(function(file) {
        if (fs.lstatSync(file).isDirectory()) {
          // Don't try to copy a directory.
          return;
        }

        var fileName = file.replace(self.templatePath('/'), '');

        var dir = path.dirname(fileName);
        var baseName = path.basename(fileName);

        var newFileName = dir ? dir + '/' + baseName : baseName;

        self.fs.copy(self.templatePath(fileName), self.destinationPath(newFileName));
      });
    }
  }
});
