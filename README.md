# jquery.ajaxzip2

jquery.ajaxzip2 は [AjaxZip 2.0 - Ajax郵便番号→住所自動入力フォーム（CGI不要版）](http://www.kawa.net/works/ajax/ajaxzip2/ajaxzip2.html) の jQuery プラグインとしての実装です。またオリジナルバージョンから機能を拡張しています。

jquery.ajaxzip2 では郵便番号から住所を補完する機能を提供します。住所データは JSON または JSONP 形式に対応しています。

# 住所データ

jquery.ajaxzip2 は、郵便番号から住所を補完するための郵便番号辞書データが必要となります。データは JSON または JSONP 形式に対応していますので、以下のどちらかの方法を選択してください。

## JSON 形式

サーバーに JSON 形式の住所データを配置して利用します。文字コードは **UTF-8** を使用します。

元サイトから[郵便番号辞書データのダウンロード](http://www.kawa.net/works/ajax/ajaxzip2/ajaxzip2.html#download)ができます。適宜ダウンロードしてサーバーへ配置してください。また、リンク先の郵便番号辞書は少し古くなっているため、日本郵便から最新のデータをダウンロードして最新の郵便番号辞書データを作ることも出来ます。詳しくは元サイトの[郵便番号辞書のアップデート手順](http://www.kawa.net/works/ajax/ajaxzip2/ajaxzip2.html#initzip)を参照してください。

## JSONP 形式

郵便番号検索APIなどを利用して住所を補完したい場合はこちらになります。利用者側での住所データの準備は必要ありません。文字コードは、オプションで指定できます。デフォルトは **UTF-8** です。

# 使い方

[jQuery](http://jquery.com/) と jquery.ajaxzip2 のソースをダウンロードして、HTMLファイルから読み込んで下さい。

```html
<script src="jquery.js"></script>
<script src="jquery.ajaxzip2.js"></script>
```

基本的には以下のようにして使います。

```javascript
$('郵便番号要素のセレクタ').zip2addr(オプション);
```

# オプション

jquery.ajaxzip2 では以下の表のオプションを受け付けます。オプションの指定は **デフォルトオプション** と **プラグインを呼び出し時のオプション** の2種類があります。

## デフォルトオプション

デフォルトオプションは以下のようにして上書きできます。

```javascript
$.fn.zip2addr.defaultOptions.path = 'http://localhost/data.json';
$.fn.zip2addr.defaultOptions.type = 'jsonp';
$.fn.zip2addr.defaultOptions.name = 'callback';
```

## プラグイン呼び出し時のオプション

プラグインを呼び出す際に以下のようにして指定します。

```javascript
$('#zip').zip2addr({
  path: 'http://localhost/data.json',
  type: 'jsonp',
  name: 'callback'
});
```

## オプション一覧

| オプション名 | 説明                                                 | デフォルト値      |
| :----------- | :----                                                | :---------------- |
| path         | JSON または JSONP 形式の住所データのパスを指定します。<br/>API などの利用で http 経由の場合は `http://.../` のように<br/>http から始まる URL を指定できます。<br/><br/>以下の値をプレースホルダとして使用することができます。<br/>`%ZIP3%` 郵便番号の上3桁に置換されます。<br/>`%ZIP7%` 郵便番号7桁に置換されます。            | `/ajaxzip2/data/zip-%ZIP3%.json` |
| type         | 住所データの種別を指定します。<br/>`json` または `jsonp` を指定してください。 | `json`           |
| charset      | JSONP 形式で住所データを読み込む際の文字コードを指定します。 | `UTF-8`           |
| name         | JSONP 形式で住所データを読み込む際のコールバック関数名を指定します。 | `zip2addr`           |
| cache        | 住所データを取得する際にキャッシュを利用するかどうかを指定します。 | `true`           |
| focus        | 補完動作完了後にフォーカスしたい jQuery 要素または ID を指定します。<br/>空の場合は最後に補完された要素にフォーカスされます。<br/>`false`の場合はフォーカス動作を行いません。 | `''`           |
| pref         | 都道府県をセットする jQuery 要素または ID を指定します。 | `#pref`           |
| city         | 市区町村をセットする jQuery 要素または ID を指定します。 | `#city`           |
| area         | 町域をセットする jQuery 要素または ID を指定します。     | `#area`           |
| street       | 番地をセットする jQuery 要素または ID を指定します。     | `#street`         |
| success      | 住所が見つかった時のコールバック関数を指定します。<br/>コールバック関数は以下の引数を受け取ります。<br/>`function successCallback(prefId, prefName, city, area, street)`<br/><br/>`prefId` 都道府県ID<br/>`prefName` 都道府県名<br/>`city` 市区町村<br/>`area` 町域<br/>`street` 番地<br/><br/>このコールバック関数で `false` を返した場合、住所補完の処理をキャンセルします。 | 空の関数 |
| error        | 住所が見つからなかった時のコールバック関数を指定します。<br/>コールバック関数の引数はありません。 | 空の関数 |
| load         | 住所データがロードされた時のコールバック関数を指定します。<br/><br/>jquery.ajaxzip2 では、指定された形式で住所データが読み込まれる必要があります。 `path` オプションに対して自由にパスまたは URL を指定できますが、それが[本家の郵便番号辞書データ(JSON 形式)](http://www.kawa.net/works/ajax/ajaxzip2/ajaxzip2.html#download) **以外** の場合、jquery.ajaxzip2 が理解できる形式に整形しなおす必要があります。詳しくは[外部のAPIを利用する](#api)の項を参照してください。 | `null` |

# 外部のAPIを利用する

郵便番号から住所データを引ける JSONP 形式対応の API を提供しているサービスがいくつかあります。例えば

* [グルーブテクノロジー株式会社の郵便番号検索API](http://groovetechnology.jp/webservice/zipsearch/)
* [ricollab 郵便番号検索](http://zip.ricollab.jp/index.html)
* [郵便番号-住所検索API](http://zipaddress.net/)

などがあります。jquery.ajaxzip2 では住所データをこれらの API から取得して住所を補完することができます。ここでは [グルーブテクノロジー株式会社の郵便番号検索API](http://groovetechnology.jp/webservice/zipsearch/) を利用して住所を補完する方法を解説します。

※利用する際は各サービスの利用規約などを良く読んで自己責任でお願いします。

## パスを指定する

API 仕様を読んで、パスを設定します。郵便番号の部分は `%ZIP3%` のプレースホルダを利用します。またコールバック関数の名前も同時に指定しておきます。データ種別も `jsonp` を選択しておきます。

```javascript
$.fn.zip2addr.defaultOptions.path = 'http://api.postalcode.jp/v1/zipsearch?zipcode=%ZIP3%&callback=zip2addr';
$.fn.zip2addr.defaultOptions.type = 'jsonp';
```

## 住所データの形式を理解する

API がどのような形式でデータを返してくるのかを確認します。このデータを元に **郵便番号をキー** として **都道府県、市区町村、町域、番地の配列を値** とした、ハッシュを作ってそれを返すようにします。

グルーブテクノロジーの API の結果は以下のような形式なので

```javascript
{"zipcode": {
  "a1" :{
    "zipcode":"3320000",
    "prefecture":"埼玉県",
    "city":"川口市",
    "town":"以下に掲載がない場合",
    ...
  },
  "a2" :{
    "zipcode":"3320001",
    "prefecture":"埼玉県",
    "city":"川口市",
    "town":"青木",
    ...
  },
  ...
}
```

これを以下のように整形する必要があります。

```javascript
{
  "3320000": [ "埼玉県", "川口市", "以下に掲載がない場合", "" ],
  "3320001": [ "埼玉県", "川口市", "青木", "" ],
  ...
}
```

※都道府県の部分は 都道府県名または都道府県 ID を指定してください。都道府県 ID の場合は **JISコードに準拠した** ID である必要があります。

※API からの結果が既に上記のような形式になっているようなサービス(または自分で開発した API など)は、以下のコールバック関数を指定する必要はありません。

## ロード完了時のコールバック関数を指定する

先に見たような変換を行うために以下のような関数を住所データロード時のコールバックとして定義します。このコールバック関数の引数には、ロードされた JSON 形式の住所データが渡されます。

```javascript
$.fn.zip2addr.defaultOptions.load = function(data) {
  var result = {};
  for (var key in data.zipcode) {
    var z = data.zipcode[key];
    result[z.zipcode] = [ z.prefecture, z.city, z.town, '' ];
  }

  return result;
};
```

このコールバック関数はデータの加工なども自由なので、たとえば **以下に掲載がない場合** などの文字を出したくない場合は、以下のようにも出来るでしょう。

```javascript
$.fn.zip2addr.defaultOptions.load = function(data) {
  var result = {};
  for (var key in data.zipcode) {
    var z = data.zipcode[key];
    z.town = z.town == '以下に掲載がない場合' ? '' : z.town;
    result[z.zipcode] = [ z.prefecture, z.city, z.town, '' ];
  }

  return result;
};
```
## プラグインを呼び出す

あとは通常通りプラグインを呼び出せばグルーブテクノロジーの API を利用した住所補完ができます。

```javascript
$('#zip').zip2addr();
```

解説ではデフォルトオプションを指定しましたが、呼び出し時に指定することも可能です。

```javascript
$('#zip').zip2addr({
  path: 'http://api.postalcode.jp/v1/zipsearch?zipcode=%ZIP3%&callback=zip2addr',
  type: 'jsonp',
  load: function(data) {
    ...
  }
});
```

他の API を利用する場合や、もしくは自分で用意した独自の JSON データなどを利用する場合でも、ロード時のコールバックで指定の形式に変換すれば、どんなものでも利用可能です。

# 住所データのキャッシュ

jquery.ajaxzip2 は郵便番号からロードされた住所データをキャッシュします。通常は郵便番号上3桁毎に住所データをキャッシュしており、郵便番号の上3桁に変更がなければ、住所データのロードをせずにキャッシュを見に行くようになっています。

`path` オプションに `%ZIP7%` のプレースホルダが指定された時のみ、郵便番号7桁でキャッシュを行います。

# ライセンス

MITライセンスとして公開します。

# サンプル

## 都道府県、市区町村、町域、番地が別のフォームになっている

**HTML**

```html
郵便番号
<input type="text" name="zip" id="zip" />
<input type="button" value="検索" id="search" />

都道府県
<input type="text" name="pref" id="pref" />
市区町村
<input type="text" name="city" id="city" />
町域
<input type="text" name="area" id="area" />
番地
<input type="text" name="street" id="street" />
```

**JavaScript**

```javascript
$('#search').click(function() {
  $('#zip').zip2addr();
});
```

## 都道府県がセレクトボックスになっている

**HTML**

```html
郵便番号
<input type="text" name="zip" id="zip" />
<input type="button" value="検索" id="search" />

都道府県
<select name="pref_id" id="pref_id">
  <option value="1">北海道</option>
  <option value="2">青森県</option>
  :
  :
  <option value="47">沖縄県</option>
</select>
市区町村
<input type="text" name="city" id="city" />
町域
<input type="text" name="area" id="area" />
番地
<input type="text" name="street" id="street" />
```

※ `option` タグの `value` には、都道府県名または都道府県 ID を指定できます。都道府県 ID の場合は **JISコードに準拠した** ID である必要があります。

**JavaScript**

```javascript
$('#search').click(function() {
  $('#zip').zip2addr({
    pref: '#pref_id'
  });
});
```

## 郵便番号のフォームが2つに分かれている

**HTML**

```html
郵便番号
<input type="text" name="zip1" id="zip1" /> - <input type="text" name="zip2" id="zip2" />
<input type="button" value="検索" id="search" />

市区町村
<input type="text" name="city" id="city" />
町域
<input type="text" name="area" id="area" />
番地
<input type="text" name="street" id="street" />
```

**JavaScript**

```javascript
$('#search').click(function() {
  $('#zip1, #zip2').zip2addr();
});
```

## 住所が1つのフォームになっている

**HTML**

```html
郵便番号
<input type="text" name="zip" id="zip" />
<input type="button" value="検索" id="search" />

住所
<input type="text" name="address" id="address" />
```

**JavaScript**

```javascript
$('#search').click(function() {
  $('#zip').zip2addr({
    pref: '#address',
    city: '#address',
    area: '#address',
    street: '#address'
  });
});
```

## 市区町村、町域、番地がフォーム要素ではない
**HTML**

```html
郵便番号
<input type="text" name="zip" id="zip" />
<input type="button" value="検索" id="search" />

市区町村
<div id="city"></div>
町域
<div id="area"></div>
番地
<div id="street"></div>
```

**JavaScript**

```javascript
$('#search').click(function() {
  $('#zip').zip2addr();
});
```

## 郵便番号がフォーム要素ではない

**HTML**

```html
郵便番号
<div id="zip">000-0000</div>
<input type="button" value="検索" id="search" />

市区町村
<div id="city"></div>
町域
<div id="area"></div>
番地
<div id="street"></div>
```

**JavaScript**

```javascript
$('#search').click(function() {
  $('#zip').zip2addr();
});
```

## 住所JSONデータが http://yoursite/js/common/data/ 以下にある

**HTML**

```html
郵便番号
<input type="text" name="zip" id="zip" />
<input type="button" value="検索" id="search" />

市区町村
<input type="text" name="city" id="city" />
町域
<input type="text" name="area" id="area" />
番地
<input type="text" name="street" id="street" />
```

**JavaScript**

```javascript
$('#search').click(function() {
  $('#zip').zip2addr({
    path: '/js/comon/data/zip-%ZIP3%.json'
  });
});
```
