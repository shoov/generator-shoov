'use strict';
var yeoman = require('yeoman-generator');

module.exports = yeoman.generators.Base.extend({
  initializing: function () {
    this.pkg = require('../package.json');
  },

  writing: {
    app: function() {
      var self = this;
      glob.sync(self.templatePath() + '/**/*');
    }
  }
});
