# jquery.ajaxzip2

[AjaxZip 2.0 - Ajax郵便番号→住所自動入力フォーム（CGI不要版）](http://www.kawa.net/works/ajax/ajaxzip2/ajaxzip2.html) の jQuery プラグインバージョンです。

jquery.ajaxzip2 では郵便番号から住所の補完をすることができます。

# 使い方

[jQuery](http://jquery.com/) と jquery.ajaxzip2 のソースをダウンロードして、HTMLファイルから読み込んで下さい。

```html
<script src="jquery.js"></script>
<script src="jquery.ajaxzip2.js"></script>
```

また、このプラグインにはJSON形式の住所データが必須となります。元サイトから[郵便番号辞書データのみのダウンロード](http://www.kawa.net/works/ajax/ajaxzip2/ajaxzip2.html#download)ができますので、そちらも適宜ダウンロードして配置してください。
日本郵便から最新のデータをダウンロードして自分で最新のJSONデータを作ることも出来ます。詳しくは元サイトの[郵便番号辞書のアップデート手順](http://www.kawa.net/works/ajax/ajaxzip2/ajaxzip2.html#initzip)を参照してください。

基本的には以下のようにして使います。

```javascript
$('郵便番号要素のセレクタ').zip2addr(オプション);
```

# オプション

| オプション名 | 説明                                                 | デフォルト値      |
| :----------- | :----                                                | :---------------- |
| path         | 住所のJSONデータがあるパスを指定します。             | `/ajaxzip2/data/` |
| pref         | 都道府県をセットするjQuery要素またはIDを指定します。 | `#pref`           |
| city         | 市区町村をセットするjQuery要素またはIDを指定します。 | `#city`           |
| area         | 町域をセットするjQuery要素またはIDを指定します。     | `#area`           |
| street       | 番地をセットするjQuery要素またはIDを指定します。     | `#street`         |
| success      | 住所が見つかった時のコールバック関数を指定します。<br/>コールバック関数は以下の引数を受け取ります。<br/>`function successCallback(prefId, prefName, city, area, street)`<br/><br/>`prefId` 都道府県ID<br/>`prefName` 都道府県名<br/>`city` 市区町村<br/>`area` 町域<br/>`street` 番地 | 空の関数 |
| error        | 住所が見つからなかった時のコールバック関数を指定します。<br/>コールバック関数の引数はありません。 | 空の関数 |

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

※ `option` タグの `value` には **JISコード準拠の** 都道府県ID、もしくは都道府県名を指定できます。

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
    path: '/js/comon/data'
  });
});
```
