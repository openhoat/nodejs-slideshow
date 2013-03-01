var path = require('path')
  , fs = require('fs')
  , jsdom = require('jsdom')
  , util = require('../src/js/util');

var rootPath = path.join(__dirname, '..');

function getAppFile(file) {
  var argumentsArray = Array.prototype.slice.apply(arguments);
  argumentsArray.splice(0, 0, rootPath);
  return path.join.apply(this, argumentsArray);
}

function copyFileSync(srcFile, destFile) {
  var BUF_LENGTH, buff, bytesRead, fdr, fdw, pos;
  BUF_LENGTH = 64 * 1024;
  buff = new Buffer(BUF_LENGTH);
  fdr = fs.openSync(srcFile, 'r');
  fdw = fs.openSync(destFile, 'w');
  bytesRead = 1;
  pos = 0;
  while (bytesRead > 0) {
    bytesRead = fs.readSync(fdr, buff, 0, BUF_LENGTH, pos);
    fs.writeSync(fdw, buff, 0, bytesRead);
    pos += bytesRead;
  }
  fs.closeSync(fdr);
  return fs.closeSync(fdw);
}

function copySlideResources() {
  var slidesDir = getAppFile('dist', 'slides')
    , slideDir, slideResourcesDir, slideResources, slideResource
    , slideNr = 1, slideResourcesDirExists;
  if (!fs.existsSync(slidesDir)) {
    fs.mkdirSync(slidesDir);
  }
  while (true) {
    slideDir = getAppFile('src', 'slides', '' + slideNr);
    slideResourcesDir = getAppFile('dist', 'slides', '' + slideNr);
    slideResourcesDirExists = false;
    if (!fs.existsSync(slideDir)) {
      break;
    }
    slideResources = fs.readdirSync(slideDir);
    for (var i = 0; i < slideResources.length; i++) {
      slideResource = slideResources[i];
      if (slideResource !== 'slide.html') {
        if (!slideResourcesDirExists && !fs.existsSync(slideResourcesDir)) {
          fs.mkdirSync(slideResourcesDir);
          slideResourcesDirExists = true;
        }
        copyFileSync(path.join(slideDir, slideResource), path.join(slideResourcesDir, slideResource));
      }
    }
    slideNr++;
  }
}

var task = function (grunt) {
  var content, buffer, slideNr, file, slideContents, document, window
    , done = this.async();
  buffer = fs.readFileSync(getAppFile('src', 'empty.html'));
  content = buffer.toString();
  var regex = new RegExp('(<section .*>)[\n]?.*(</section>)', 'i');
  slideNr = 1;
  slideContents = [];
  while (true) {
    file = getAppFile('src', 'slides', '' + slideNr, 'slide.html');
    if (!fs.existsSync(file)) {
      break;
    }
    buffer = fs.readFileSync(file);
    slideContents.push(buffer.toString());
    slideNr++;
  }
  buffer = '\n' + slideContents.join('\n') + '\n';
  content = content.replace(regex, '$1\n' + buffer + '$2');
  var complete = function (content) {
    content = '<!DOCTYPE html>\n' + content.split('\n').slice(1).join('\n');
    fs.writeFileSync(getAppFile('dist', 'index.html'), content, 'utf-8');
    done();
  };
  document = jsdom.jsdom(content, null);
  window = document.createWindow();
  content = window.document.innerHTML;
  jsdom.jQueryify(window, getAppFile('src', 'lib', 'jquery.min.js'), function () {
    window.document.innerHTML = content;
    util.refineSlides(window.$, function () {
      complete(window.document.innerHTML);
    });
  });
};

module.exports = task;