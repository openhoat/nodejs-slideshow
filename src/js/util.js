(function () {
  var util = {
    addLessCss:function ($) {
      $('head').append('<link rel="stylesheet/less" type="text/css" href="styles/slideshow.less" />')
        .append('<script src="lib/less-1.3.3.min.js"></script>');
    },
    addCss:function ($) {
      $('head').append('<link rel="stylesheet" type="text/css" href="styles/slideshow.css"/>');
    },
    loadSlides:function ($, callback) {
      var loadNextSlide = function (slideNr) {
        var url;
        slideNr = slideNr || 1;
        url = 'slides/' + slideNr + '/slide.html?t=' + new Date().getTime();
        $.get(url,function (data, textStatus, jqXHR) {
          var section = $('body > section');
          section.append(data);
          loadNextSlide(++slideNr);
        }).fail(function (err) {
            if (err.status === 404) {
              callback();
            }
          });
      };
      loadNextSlide();
    },
    refineSlides:function ($, callback) {
      var articles = $('section.slides > article')
        , noArticles = articles.size()
        , checkLast = function (articleIndex) {
          if (articleIndex === noArticles - 1) {
            callback();
          }
        };
      if (noArticles > 0) {
        articles.each(function (articleIndex, articleElt) {
          var slideNr = articleIndex + 1
            , slideId = 'slide' + slideNr
            , images
            , noImages;
          if (articleElt.id === '') {
            articleElt.id = slideId;
          }
          articleElt.innerHTML += '  <div class="slidenumber">' + slideNr + '</div>\n';
          images = $(this).find('img');
          noImages = images.size();
          if (noImages > 0) {
            images.each(function (imageIndex, imageElt) {
              if ($(this).attr('rel-src')) {
                $(this).attr('src', 'slides/' + slideNr + '/' + $(this).attr('rel-src'));
                $(this).removeAttr('rel-src');
              }
              if (imageIndex === noImages - 1) {
                checkLast(articleIndex);
              }
            });
          } else {
            checkLast(articleIndex);
          }
        });
      } else {
        callback();
      }
    }
  };
  if (typeof module === 'undefined') {
    this.util = util;
  } else {
    module.exports = util;
  }
})();