// --------------------------------------------
// APIの取得
const hot_api = "*****************************:";
// お気に入り用のオブジェクト
const fav_obj = {
  title: null,
  image: null,
  large_area: null,
  middle_area: null,
  lat: null,
  lng: null,
  url: null,
}

// --------------------------------------------
// EXPRESSの処理
let shopList = []; //取得したデータを格納
function restaurant(lat, lan, distance) {
  const search_word = "&lat=" + lat + "&lng=" + lan + "&range=" + distance;
  const json = {
    url: "http://webservice.recruit.co.jp/hotpepper/gourmet/v1/?key=" + hot_api + search_word + "&format=json"
  }
  fetch('http://127.0.0.1:5500/auth/', {
  method: 'POST',
  headers: {
    'content-type': 'application/json',
  },
  body: JSON.stringify(json),
  }).then(response => {
      return response.json();
  }).then(res => {
    shopList = []; //初期化
    for (let i = 0; i < res.results.shop.length; i++){
      shopList[i] = res.results.shop[i];
    }
  }).catch(error => {
    console.log(error);
  });
}

// --------------------------------------------
// API取得データの表示
function shopInfo(shop) {
  // 情報を表示させるエリアの親を取得
  const shop_info = document.querySelector('#shop-info');
  shop_info.innerHTML = '';
  for (let i = 0; i < shop.length; i++) {
    // 子要素の生成
    const element = document.createElement('div');
    element.className = 'shop'
    element.id = 'shop' + i + '|' + shop[i].name;
    // ーーーーーーーーーーーーーーーーーーーーーーーーーーーー
    // 子要素の子要素生成（孫要素）
    // 画像の取得
    const img_child = document.createElement('img');
    img_child.className = 'shop_img';
    img_child.src = shop[i].photo.pc.l
    img_child.alt = "店の写真"
    element.prepend(img_child);
    // 本文のコンテナ
    const text_content = document.createElement('div');
    text_content.className = 'text_content';
    element.append(text_content);
    // titleの取得
    const title_child = document.createElement('p');
    title_child.className = 'shop_title';
    title_child.textContent = shop[i].name + " ( "+ shop[i].genre.name +" )";
    text_content.prepend(title_child);
    // 住所の取得
    const address_child = document.createElement('p');
    address_child.className = 'shop_address';
    address_child.textContent = "住所: " + shop[i].address;
    text_content.append(address_child);
    // 道のりの取得
    const access_child = document.createElement('p');
    access_child.className = 'shop_access';
    access_child.textContent = "アクセス: " + shop[i].access;
    text_content.append(access_child);
    // 価格の取得
    const price_child = document.createElement('p');
    price_child.className = 'shop_price';
    if (shop[i].budget.average == '') {
      price_child.textContent = "平均価格: " + shop[i].budget.name + " (カード決済  "+ shop[i].card +" )";
    } else {
      price_child.textContent = "平均価格: " + shop[i].budget.average+ " (カード決済  "+ shop[i].card +" )";;
    }
    text_content.append(price_child);
    // 営業時間の取得
    const time_child = document.createElement('p');
    time_child.className = 'shop_open';
    time_child.textContent = "営業時間: " + shop[i].open;
    text_content.append(time_child);
    // その他の情報
    const other_child = document.createElement('p');
    other_child.className = 'shop_other';
    other_child.textContent = "wi-fi: " + shop[i].wifi + "   "  + "|  " + "   "  + "個室: " +shop[i].private_room;
    text_content.append(other_child);
    // その他情報２
    const other_child2 = document.createElement('div');
    other_child2.id = shop[i].lat + '|' + shop[i].lng + '|' + shop[i].large_area.name + '|' + shop[i].middle_area.name;
    text_content.append(other_child2);
    // イベントコンテナ
    const event_content = document.createElement('div');
    event_content.className = 'event_content';
    event_content.id = "event_content" + i + "|" + shop[i].name;
    text_content.append(event_content);
    // 経路の取得
    const corse_child = document.createElement('div');
    corse_child.className = 'shop_course';
    corse_child.id = shop[i].lat + '|' + shop[i].lng;
    corse_child.onclick = function () {
      const map = new Bmap(myMap);
      //Map:Init
      map.startMap(myPlace.lat, myPlace.lat, "load", 15);
      const array = [] ;
      map.direction("#direction", "walking",'"'+ myPlace.station +'"', '"' + shop[i].address + '"', array );
    }
    corse_child.textContent = "経路を調べる";
    event_content.prepend(corse_child);
    // リンクの取得
    const a_child = document.createElement('a');
    a_child.className = 'shop_link';
    a_child.href = shop[i].urls.pc
    a_child.target = 'blank'
    a_child.textContent = "予約する";
    event_content.append(a_child);
    // 候補の選択
    const like_child = document.createElement('div');
    like_child.className = 'shop_like';
    like_child.id = 'like|shop' + i + '|' + "event_content" + i + "|" + shop[i].name;
    like_child.onclick = function (e) {
      const me = e.target.id;
      const array = me.split('|');
      const id = array[1];
      const event_content = array[2];
      const shop_name = array[3]
      const new_element = document.createElement('div');
      new_element.className = 'shop_fav';
      new_element.id = 'shop_fav' + '|' + id + '|' + shop_name;
      new_element.textContent = 'お気に入りに登録'
      new_element.onclick = function (e) {
        if (confirm('お気に入り登録をしますか？')) {
          const me = e.target.id;
          const array = me.split('|');
          const id = array[1] + '|' + array[2];
          const parent = document.getElementById(id);
          // titleの取得
          let title = parent.id.split('|')
          title = title[1];
          // imageの取得
          let image = parent.children[0].src;
          // large_areaの取得
          const list = parent.children[1].children[6].id;
          const list_node = list.split('|');
          const lat = list_node[0];
          const lng = list_node[1];
          const large_area = list_node[2];
          const middle_area = list_node[3];
          // urlの取得
          const url = parent.children[1].children[7].children[0].href;
          // fav_objに格納
          fav_obj.title = title;
          fav_obj.image = image;
          fav_obj.large_area = large_area;
          fav_obj.middle_area = middle_area;
          fav_obj.lat = lat;
          fav_obj.lng = lng;
          fav_obj.url = url;
          dbset();
          alert('お気に入りに登録しました')
          this.onclick = '';
        }
      }
      // 要素の削除
      const remove_id = document.getElementById(event_content + "|" + shop_name);
      remove_id.append(new_element);
      const target = document.getElementById(id + "|" + shop_name);
      const area = document.querySelector('#candicate');
      area.append(target);
      remove_id.childNodes[0].remove();
      remove_id.childNodes[1].remove();
    }
    like_child.textContent = "候補に入れる";
    event_content.append(like_child);
    // ーーーーーーーーーーーーーーーーーーーーーーーーーーーーー
    // 親要素子要素の追加
    shop_info.append(element);
  }
}
