$(document).ready(function() {
  module('JSONP形式での自動補完');

  QUnit.moduleStart(function(name) {
    if (name.name == 'JSONP形式での自動補完') {
      $.fn.zip2addr.defaultOptions.type   = 'jsonp';
      $.fn.zip2addr.defaultOptions.path   = 'jsonp/data001.js';
      $.fn.zip2addr.defaultOptions.callback = function(data) {
        var result = {};
        for (var key in data) {
          var z = data[key];
          result[z.zip] = [ z.pref, z.city, z.town, '' ];
        }

        return result;
      };
    }
    else {
      $.fn.zip2addr.defaultOptions.type   = 'json';
      $.fn.zip2addr.defaultOptions.path   = '/ajaxzip2/data/zip-%ZIP3%.json';
      $.fn.zip2addr.defaultOptions.callback = null;
    }
  });

  asyncTest('JSONP形式で住所データを取得する', function() {
    expect(4);

    $('#zip').val('3000000').zip2addr();
    setTimeout(function() {
      equal($('#pref').  val(), '福岡県',           '都道府県が正しくセットされている');
      equal($('#city').  val(), 'テスト市テスト町', '市区町村が正しくセットされている');
      equal($('#area').  val(), 'テスト',           '町域が正しくセットされている');
      equal($('#street').val(), '',                 '番地が正しくセットされている');
      start();
    }, 100);
  });
});
