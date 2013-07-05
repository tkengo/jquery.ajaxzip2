/* ================================================================ *
    jquery.ajaxzip2.js ---- 郵便番号→住所変換jQueryプラグイン

    Copyright (c) 2013 Kengo Tateishi
    https://github.com/tkengo/jquery.ajaxzip2/

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
  var VERSION = '1.0';

  /**
   * 郵便番号
   */
  var zip  = '';

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
   * 住所データをキャッシュする郵便番号の桁数
   */
  var cacheDigit = 3;

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
    this.each(function() { zip += get($(this)); });
    zip = zip.replace(/[^0-9]/g, '');

    // 郵便番号が7桁に足りなかったら処理しない
    if (zip.length < 7) {
      options.error.call(this);
      return this;
    }

    // 住所をセットする先の要素を取得
    prefElement   = $(options.pref);
    cityElement   = $(options.city);
    areaElement   = $(options.area);
    streetElement = $(options.street);

    // フォームの値が前回と同じであればここでキャンセル
    var uniq = zip + get(prefElement) + get(cityElement) + get(areaElement) + get(streetElement);
    if (prev == uniq) {
      return this;
    }

    // URLに郵便番号が含まれていれば置換する
    if (options.path.indexOf('%ZIP7%') > -1) {
      options.path = options.path.replace('%ZIP7%', zip);
      cacheDigit = 7;
    }
    else if (options.path.indexOf('%ZIP3%') > -1) {
      options.path = options.path.replace('%ZIP3%', zip.substr(0, 3));
      options.path = options.path.replace('%ZIP4%', zip.substr(3, 4));
      cacheDigit = 3;
    }

    // 郵便番号でキャッシュがあるかどうかをチェックして
    // キャッシュがあればキャッシュから、なければJSONを取得する
    var data = CACHE[zip.substr(0, cacheDigit)];
    if (data && options.cache) {
      jsonLoadSuccessCallback(data);
    }
    else {
      window[options.name] = _zip2addr;

      if (options.type == 'jsonp') {
        var script = document.createElement('script');
        script.type = 'text/javascript';
        script.src  = options.path;
        script.charset = options.charset;
        var s = document.getElementsByTagName('script')[0];
        s.parentNode.insertBefore(script, s);
      }
      else if (options.type == 'json') {
        $.getJSON(options.path, window[options.name]);
      }
    }

    return this;
  };

  /**
   * 住所検索後のコールバック関数
   *
   * @param array data 住所データ
   */
  function _zip2addr(data)
  {
    // ユーザー定義コールバック関数の呼び出し
    if (typeof options.load == 'function') {
      data = options.load(data);
    }

    // 補完処理
    jsonLoadSuccessCallback(data);
  }

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
    CACHE[zip.substr(0, cacheDigit)] = data;

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

    // 都道府県がIDではなく名前の場合はIDに変換する
    if (typeof address[0] == 'string') {
      for (var i in PREFMAP) {
        if (PREFMAP[i] == address[0]) {
          address[0] = i;
          break;
        }
      }
    }

    // 住所の各データを取り出し
    var prefId   = address[0] || 0;
    var prefName = PREFMAP[prefId] || '';
    var city     = address[1] || '';
    var area     = address[2] || '';
    var street   = address[3] || '';

    // コールバック関数の呼び出し
    // falseが返れば後の処理はしない
    if (options.success.call(this, prefId, prefName, city, area, street) === false) {
      return;
    }

    // 最後にフォーカスする要素
    var focusElement = null;

    // 各要素の値の初期化
    set(prefElement, '');
    set(cityElement, '');
    set(areaElement, '');
    set(streetElement, '');

    // 都道府県フォームに値をセット
    if (prefElement && prefElement.length > 0) {
      focusElement = prefElement;

      // 都道府県がセレクトボックスの場合は同じ値を見つけてそれを選択済みにする
      // テキストボックスの場合はそのまま値をセットする
      if (prefElement.is('select')) {
        prefElement.children('option').each(function() {
          var value = $(this).val();
          var text  = $(this).text();

          if (value == prefId || value == prefName || text == prefName) {
            prefElement.val(value);
            return false;
          }
        });
      }
      else {
        set(prefElement, get(prefElement) + prefName);
      }
    }

    // 市区町村フォームに値をセット
    if (cityElement && cityElement.length > 0) {
      focusElement = cityElement;
      set(cityElement, get(cityElement) + city);
    }

    // 町域フォームに値をセット
    if (areaElement && areaElement.length > 0) {
      focusElement = areaElement;
      set(areaElement, get(areaElement) + area);
    }

    // 番地フォームに値をセット
    if (streetElement && streetElement.length > 0) {
      focusElement = streetElement;
      set(streetElement, get(streetElement) + street);
    }

    // フォーカスする要素があればフォーカスしておく
    if (options.focus) {
      focusElement = $(options.focus);
    }
    if (focusElement && options.focus !== false) {
      focusElement.focus();
      focusElement.select();
    }

    // 今回のデータを保存
    // 次回処理時に比較して同じ値であれば処理をしないようにする
    prev = zip + get(prefElement) + get(cityElement) + get(areaElement) + get(streetElement);
  }

  /**
   * 要素がテキスト要素かどうかを判定します。
   *
   * @param object element 要素
   * @return boolean テキスト要素であればtrue
   */
  function isTextable(element)
  {
    return !(element.is(':text') || element.is('select') || element.is(':hidden'));
  }

  function set(element, value)
  {
    if (element && element.length > 0) {
      if (isTextable(element)) {
        element.text(value);
      } else {
        element.val(value);
      }
    }
  }

  function get(element)
  {
    if (element && element.length > 0) {
      if (isTextable(element)) {
        return element.text();
      } else {
        return element.val();
      }
    }

    return '';
  }

  /**
   * オプション
   */
  $.fn.zip2addr.defaultOptions = {
    /**
     * 住所JSONデータがあるパスを指定
     */
    path: '/ajaxzip2/data/zip-%ZIP3%.json',
    /**
     * 住所データの種別を指定
     */
    type: 'json',
    /**
     * JSONPで読み込む時の住所データの文字コードを指定
     */
    charset: 'UTF-8',
    /**
     * JSONPのコールバック関数名を指定
     */
    name: 'zip2addr',
    /**
     * 郵便番号データをキャッシュするかどうかを指定
     */
    cache: true,
    /**
     * 補完処理が完了した後にフォーカスする要素を指定
     */
    focus: '',
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
    error: function() {},
    /**
     * 住所データロード時に呼ばれるコールバック関数を指定
     */
    load: null
  };
})(jQuery);
