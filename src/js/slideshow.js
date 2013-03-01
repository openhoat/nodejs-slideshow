/*global $: true, util: true, startSlideshow: true */

function initSlideshow(callback) {
  var articleElts = $('section.slides > article');
  if (articleElts.size() < 1) {
    util.addLessCss($);
    util.loadSlides($, function () {
      util.refineSlides($, function () {
        callback();
      });
    });
  } else {
    util.addCss($);
    util.refineSlides($, function () {
      callback();
    });
  }
}

$(document).ready(function () {
  initSlideshow(function () {
    startSlideshow();
  });
});