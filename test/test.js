function stubGetJSON(url, callback)
{
  callback({
    "0000000":[1, "テスト市テスト町","テスト"],
    "0000001":[1, "サンプル市サンプル町","サンプル","３丁目２４－１２"],
    "0010000":[2, "ajaxzip市ajaxzip町","住所自動補完","３丁目１－２４"],
    "0020000":[3, "ajaxzip2市ajaxzip2町","住所自動補完","3-2-1"],
    "0030000":[4, "ユニットテスト市","QUnit","５−４−３"],
    "0040000":[5, "自動テスト市自動テスト町","QUnit1.10"],
    "0050000":[6, "ほげ市ホゲ町","ほげふが", "999-99-9"]
  });
}

var originalGetJSON = $.getJSON;
$.getJSON = stubGetJSON;

$(document).ready(function() {
  module('郵便番号を正しく入力しての自動補完');

  test('住所フォームが分かれている', function() {
    $('#zip').val('0000000').zip2addr();
    equal($('#pref').  val(), '北海道',           '都道府県が正しくセットされている');
    equal($('#city').  val(), 'テスト市テスト町', '市区町村が正しくセットされている');
    equal($('#area').  val(), 'テスト',           '町域が正しくセットされている');
    equal($('#street').val(), '',                 '番地が正しくセットされている');
  });

  test('都道府県がセレクトボックスになっている', function() {
    $('#zip').val('0000001').zip2addr({ pref: '#pref_id' });
    equal($('#pref_id').val(), 1, '都道府県IDが正しくセットされている');
  });

  test('住所の入力フォームがまとまっている', function() {
    $('#zip').val('0010000').zip2addr({
      pref: '#address',
      city: '#address',
      area: '#address',
      street: '#address'
    });
    equal($('#address').val(), '青森県ajaxzip市ajaxzip町住所自動補完３丁目１－２４', '住所が全て正しくセットされている');
  });

  test('郵便番号が2つに分かれている', function() {
    $('#zip1').val('002');
    $('#zip2').val('0000');

    $('#zip1, #zip2').zip2addr();
    equal($('#pref')  .val(), '岩手県',               '都道府県が正しくセットされている');
    equal($('#city')  .val(), 'ajaxzip2市ajaxzip2町', '市区町村が正しくセットされている');
    equal($('#area')  .val(), '住所自動補完',         '町域が正しくセットされている');
    equal($('#street').val(), '3-2-1',                '番地が正しくセットされている');
  });

  test('住所がフォーム要素ではない', function() {
    $('#zip').val('0030000').zip2addr({
      pref: '#pref_div',
      city: '#city_div',
      area: '#area_div',
      street: '#street_div'
    });
    equal($('#pref_div')  .text(), '宮城県',           '都道府県が正しくセットされている');
    equal($('#city_div')  .text(), 'ユニットテスト市', '市区町村が正しくセットされている');
    equal($('#area_div')  .text(), 'QUnit',            '町域が正しくセットされている');
    equal($('#street_div').text(), '５−４−３',         '番地が正しくセットされている');
  });

  test('郵便番号がフォーム要素ではない', function() {
    $('#zip_div').text('0040000').zip2addr();
    equal($('#pref')  .val(), '秋田県',                   '都道府県が正しくセットされている');
    equal($('#city')  .val(), '自動テスト市自動テスト町', '市区町村が正しくセットされている');
    equal($('#area')  .val(), 'QUnit1.10',                '町域が正しくセットされている');
    equal($('#street').val(), '',                         '番地が正しくセットされている');
  });

  test('郵便番号にハイフンが含まれている', function() {
    $('#zip').val('000-0000').zip2addr();
    equal($('#pref').  val(), '北海道',           '都道府県が正しくセットされている');
    equal($('#city').  val(), 'テスト市テスト町', '市区町村が正しくセットされている');
    equal($('#area').  val(), 'テスト',           '町域が正しくセットされている');
    equal($('#street').val(), '',                 '番地が正しくセットされている');
  });

  test('郵便番号が見つかったらコールバック関数が呼ばれている', function() {
    $('#zip').val('0050000').zip2addr({
      success: function(prefId, prefName, city, area, street) {
        equal(prefId,   6,              'コールバック関数の引数に都道府県IDが正しくセットされている');
        equal(prefName, '山形県',       'コールバック関数の引数に都道府県が正しくセットされている');
        equal(city,     'ほげ市ホゲ町', 'コールバック関数の引数に市区町村が正しくセットされている');
        equal(area,     'ほげふが',     'コールバック関数の引数に町域が正しくセットされている');
        equal(street,   '999-99-9',     'コールバック関数の引数に番地が正しくセットされている');
      }
    });
  });

  module('郵便番号が正しくない場合の処理');

  test('郵便番号が7桁に満たない', function() {
    $('#zip').val('000').zip2addr({
      error: function() {
        ok(true, 'エラーコールバック呼び出し成功');
      }
    });
  });

  test('郵便番号が存在しない', function() {
    $('#zip').val('9999999').zip2addr({
      error: function() {
        ok(true, 'エラーコールバック呼び出し成功');
      }
    });
  });

  module('リモート通信しない住所の自動補完');

  test('郵便番号と住所が変更されていない', function() {
    var callCount = 0;
    var o = $.getJSON;
    $.getJSON = function(url, callback) {
      callCount++;
      callback({ "1000000":[10, "テスト市テスト町","テスト"] });
    };

    $('#zip').val('1000000');
    $('#zip').zip2addr();
    $('#zip').zip2addr();

    $.getJSON = o;

    equal(callCount, 1, '変更が無いのでJSONデータ取得は1度しか呼ばれていない');
  });

  test('キャッシュデータから住所を取得する', function() {
    var callCount = 0;
    var o = $.getJSON;
    $.getJSON = function(url, callback) {
      callCount++;
      callback({ "2000000":[11, "テスト市1テスト町2","テスト"] });
      callback({ "2000001":[11, "テスト市1テスト町2","テスト"] });
    };

    $('#zip').val('2000000').zip2addr();
    $('#zip').val('2000001').zip2addr();

    $.getJSON = o;

    equal(callCount, 1, '郵便番号の上3桁でキャッシュされているのでJSONデータ取得は1度しか呼ばれていない');
  });
});
