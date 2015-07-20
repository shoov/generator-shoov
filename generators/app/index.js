'use strict';
var yeoman = require('yeoman-generator');
var chalk = require('chalk');
var glob = require('glob');
var fs = require('fs-extra');
var path = require('path');
var yosay = require('yosay');
var tilde = require('tilde-expansion');
var spawn = require('child_process').spawn;
var opn = require('opn');

module.exports = yeoman.generators.Base.extend({
  initializing: function () {
    this.pkg = require('../../package.json');
  },

  addOptions: function() {
    // Try to get value from the CLI.
    this.option('base-url', {
      desc: 'The base url of the site to visually monitor',
      type: String,
      required: 'true'
    });
  },

  askForBaseUrl: function () {
    // Have Yeoman greet the user.
    this.log(yosay(
      'Welcome to the ' + chalk.red('Shoov') + ' generator!'
    ));

    if (this.options['base-url']) {
      // Get the value from the CLI.
      this.baseUrl = this.options['base-url'];
      this.log('Setting base url to: ' + this.baseUrl);
      return;
    }

    var done = this.async();

    var prompts = [{
      name: 'baseUrl',
      message: 'What is the The base url of the site to visually monitor?',
      default: 'http://shoov.io'
    }];

    this.prompt(prompts, function (props) {
      this.baseUrl = props.baseUrl;

      done();
    }.bind(this));
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

        var fileName = './' + file.replace(self.templatePath(), '');

        var dir = path.dirname(fileName);
        var baseName = path.basename(fileName);
        var extension = path.extname(baseName);

        if (extension !== '.scss') {
          // If not a SCSS file, convert the prefix of the underscore to a dot.
          baseName = baseName.replace(/^_/g, '.');
        }

        var newFileName = dir != '/' ? dir.replace('/', '') + '/' + baseName : baseName;

        if (extension === '.png' || extension === '.jpg') {
          // Copy images.
          self.fs.copy(self.templatePath(fileName), self.destinationPath(newFileName));
        }
        else {
          var contents = self.fs.read(self.templatePath(fileName));
          var newContents = contents
            .replace(/GENERATOR_SHOOV_BASE_URL/g, self.baseUrl);

          self.fs.write(newFileName, newContents);
        }
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
    },

    graphicsmagickExists: function () {
      var done = this.async();

      var self = this;

      if (process.platform == 'darwin') {
        var graphicsmagickInstalled = false;
        var graphicsmagickInfo = spawn('brew', ['info', 'graphicsmagick']);

        graphicsmagickInfo.stdout.on('data', function (data) {
          var buff = new Buffer(data);
          graphicsmagickInstalled = graphicsmagickInstalled || buff.toString('utf8').indexOf('/usr/local/Cellar/graphicsmagick') > -1;
        });

        graphicsmagickInfo.on('close', function (code) {

          if (!code && !graphicsmagickInstalled) {
            self.log(chalk.red('---------------------------'));
            self.log(chalk.red('GraphicsMagick for image processing is not installed on your machine'));
            self.log(chalk.red('To install this package follow the instructions in:'));
            self.log(chalk.yellow('  https://github.com/webdriverio/webdrivercss#install'));
            self.log(chalk.red('---------------------------'));
            opn('https://github.com/webdriverio/webdrivercss#install');
          }

          done();
        });
      }
      else {
        done();
      }

    },

    explain: function() {
      this.log(chalk.green('---------------------------'));

      this.log(chalk.green('Execute tests:'));
      this.log(chalk.green('1) With PhantomJs'));
      this.log(chalk.green('  $ phantomjs --webdriver=4444 &'));
      this.log(chalk.green('  $ cd visual-monitor'));
      this.log(chalk.green('  $ mocha'));


      this.log(chalk.green('2) With BrowserStack or SauceLabs'));
      this.log(chalk.gray ('  Important: Add your provider credentials in Shoov\'s My-Account page.'));
      this.log(chalk.green('  $ cd visual-monitor'));
      this.log(chalk.green('  $ PROVIDER_PREFIX=browserstack SELECTED_CAPS=chrome mocha'));

      this.log(chalk.green('---------------------------'));
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

      var self = this;

      this.log('npm install');
      var npmInstall = this.npmInstall(null, {cwd: 'visual-monitor'});

      this.log('Composer install');
      var composerInstall = this.spawnCommand('composer', ['install'], {cwd: './behat'});

      npmInstall.on('close', function (code) {
        if (!code) {
          // Installation was successful.
          self.spawnCommand('tar', ['cfz', 'node_modules.tar.gz', './node_modules'], {cwd: './visual-monitor'})
        }
      });

      composerInstall.on('close', function (code) {
        if (!code) {
          // Installation was successful.
          self.spawnCommand('tar', ['cfz', 'vendor_bin.tar.gz', './vendor', './bin'], {cwd: './behat'})
        }
      });

    }
  }
});
