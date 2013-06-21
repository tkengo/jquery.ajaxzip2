/* ================================================================ *
    ajaxzip2.js ---- AjaxZip2 郵便番号→住所変換ライブラリ

    Copyright (c) 2006-2007 Kawasaki Yusuke <u-suke [at] kawa.net>
    http://www.kawa.net/works/ajax/ajaxzip2/ajaxzip2.html

    Permission is hereby granted, free of charge, to any person
    obtaining a copy of this software and associated documentation
    files (the "Software"), to deal in the Software without
    restriction, including without limitation the rights to use,
    copy, modify, merge, publish, distribute, sublicense, and/or sell
    copies of the Software, and to permit persons to whom the
    Software is furnished to do so, subject to the following
    conditions:

    The above copyright notice and this permission notice shall be
    included in all copies or substantial portions of the Software.

    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
    EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
    OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
    NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
    HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
    WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
    FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
    OTHER DEALINGS IN THE SOFTWARE.
* ================================================================ */
;(function($) {
  var VERSION = '0.1';

  /**
   * 郵便番号
   */
  var zip  = '';
  var zip3 = '';

  /**
   * 住所要素
   */
  var prefElement   = null;
  var cityElement   = null;
  var areaElement   = null;
  var streetElement = null;

  /**
   * 前回フォーム入力値
   */
  var prev = '';

  /**
   * オプション
   */
  var options = {};

  /**
   * キャッシュ用
   * 一度取得した住所JSONデータは郵便番号上3桁でキャッシュする
   */
  var CACHE = {};

  /**
   * 都道府県一覧
   * 都道府県IDと都道府県名のマッピング
   */
  var PREFMAP = [
      null,       '北海道',   '青森県',   '岩手県',   '宮城県',
      '秋田県',   '山形県',   '福島県',   '茨城県',   '栃木県',
      '群馬県',   '埼玉県',   '千葉県',   '東京都',   '神奈川県',
      '新潟県',   '富山県',   '石川県',   '福井県',   '山梨県',
      '長野県',   '岐阜県',   '静岡県',   '愛知県',   '三重県',
      '滋賀県',   '京都府',   '大阪府',   '兵庫県',   '奈良県',
      '和歌山県', '鳥取県',   '島根県',   '岡山県',   '広島県',
      '山口県',   '徳島県',   '香川県',   '愛媛県',   '高知県',
      '福岡県',   '佐賀県',   '長崎県',   '熊本県',   '大分県',
      '宮崎県',   '鹿児島県', '沖縄県'
  ];

  /**
   * 郵便番号から住所を検索してフォームを補完します。
   *
   * @param object options オプション
   */
  $.fn.zip2addr = function(opt) {
    // オプションを取得
    options = $.extend({}, $.fn.zip2addr.defaultOptions, opt);

    // 郵便番号を取得
    zip = '';
    this.each(function() { zip += $(this).val(); });
    zip  = zip.replace(/[^0-9]/g, '');

    // 郵便番号が7桁に足りなかったら処理しない
    if (zip.length < 7) {
      options.error.call(this);
      return this;
    }

    // 郵便番号の上3桁を取り出す
    zip3 = zip.substr(0, 3);

    // 住所をセットする先の要素を取得
    prefElement   = options.pref   ? $(options.pref)   : null;
    cityElement   = options.city   ? $(options.city)   : null;
    areaElement   = options.area   ? $(options.area)   : null;
    streetElement = options.street ? $(options.street) : null;

    // フォームの値が前回と同じであればここでキャンセル
    var uniq = zip;
    uniq += prefElement   ? prefElement.val()   : '';
    uniq += cityElement   ? cityElement.val()   : '';
    uniq += areaElement   ? areaElement.val()   : '';
    uniq += streetElement ? streetElement.val() : '';
    if (prev == uniq) {
      return this;
    }

    // 郵便番号上位3桁でキャッシュがあるかどうかをチェックして
    // キャッシュがあればキャッシュから、なければJSONを取得する
    var data = CACHE[zip3];
    if (data) {
      jsonLoadSuccessCallback(data);
    }
    else {
      var url = options.path + 'zip-' + zip3 + '.json';
      $.getJSON(url, jsonLoadSuccessCallback);
    }

    return this;
  };

  /**
   * 住所JSONデータのロードが完了した時のコールバック処理を行います。
   * 戻り値のデータから該当の郵便番号の住所データを取り出し
   * その値を各フォーム要素にセットします。
   *
   * @param array data 住所データ
   */
  function jsonLoadSuccessCallback(data)
  {
    // 住所データがみつからなければ何もしない
    if (!data) {
      options.error.call(this);
      return;
    }

    // 取得できた住所データはキャッシュしておく
    CACHE[zip3] = data;

    // 該当の郵便番号の住所データを取得
    // Opera バグ対策：0x00800000 を超える添字は +0xff000000 されてしまう
    var address = data[zip];
    var opera = (zip - 0 + 0xff000000) + "";
    if (!address && data[opera]) {
      address = data[opera]
    }

    // 該当の郵便番号のデータがなければここで終了
    if (!address) {
      options.error.call(this);
      return;
    }

    // 住所の各データを取り出し
    var prefId   = address[0] || 0;
    var prefName = PREFMAP[prefId] || '';
    var city     = address[1] || '';
    var area     = address[2] || '';
    var street   = address[3] || '';

    // 最後にフォーカスする要素
    var focusElement = null;

    // 各要素の値の初期化
    if (prefElement)   prefElement.val('');
    if (cityElement)   cityElement.val('');
    if (areaElement)   areaElement.val('');
    if (streetElement) streetElement.val('');

    // 都道府県フォームに値をセット
    if (prefElement) {
      focusElement = prefElement;
      var dom = prefElement.get(0);

      // 都道府県がセレクトボックスの場合は同じ値を見つけてそれを選択済みにする
      // テキストボックスの場合はそのまま値をセットする
      if ($.inArray(dom.type, [ 'select-one', 'select-multiple' ]) > -1) {
        var list = dom.options;
        for (var i = 0; i < list.length; i++) {
            var value = list[i].value;
            var text  = list[i].text;

            if (value == prefId || value == prefName || text == prefName) {
              list[i].selected = true;
              break;
            }
        }
      }
      else {
        prefElement.val(prefElement.val() + prefName);
      }
    }

    // 市区町村フォームに値をセット
    if (cityElement) {
      focusElement = cityElement;
      cityElement.val(cityElement.val() + city);
    }

    // 町域フォームに値をセット
    if (areaElement) {
      focusElement = areaElement;
      areaElement.val(areaElement.val() + area);
    }

    // 番地フォームに値をセット
    if (streetElement) {
      focusElement = streetElement;
      streetElement.val(streetElement.val() + street);
    }

    // フォーカスする要素があればフォーカスしておく
    if (focusElement) {
      focusElement.focus();
      focusElement.select();
    }

    // 今回のデータを保存
    // 次回処理時に比較して同じ値であれば処理をしないようにする
    prev = zip;
    prev += prefElement   ? prefElement.val()   : '';
    prev += cityElement   ? cityElement.val()   : '';
    prev += areaElement   ? areaElement.val()   : '';
    prev += streetElement ? streetElement.val() : '';

    options.success.call(this, prefId, prefName, city, area, street);
  };

  /**
   * オプション
   */
  $.fn.zip2addr.defaultOptions = {
    /**
     * 住所JSONデータがあるパスを指定
     */
    path: 'ajaxzip2/data/',
    /**
     * 都道府県をセットする要素を指定
     */
    pref: '#pref',
    /**
     * 市区町村をセットする要素を指定
     */
    city: '#city',
    /**
     * 町域をセットする要素を指定
     */
    area: '#area',
    /**
     * 番地をセットする要素を指定
     */
    street: '#street',
    /**
     * 郵便番号から住所データが見つかった時のコールバックを指定
     */
    success: function() {},
    /**
     * 郵便番号から住所データが見つからなかった時のコールバックを指定
     */
    error: function() {}
  };
})(jQuery);
