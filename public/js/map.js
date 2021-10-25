// --------------------------------------------
// APIKEY
const map_apikey = "***************************************";
// 現在地のオブジェクト(緯度・経度)
let myPlace = {
  lat: null,
  lng: null,
  station: null
}
// --------------------------------------------
// 経度・緯度から駅の検索用のURL
const train_URL = "https://express.heartrails.com/api/json?method=getStations"
// 駅名から経度・緯度を検索用のURL
const xy_URL = "https://express.heartrails.com/api/json?method=getStations";

// 駅名を検索する関数
async function get_trainName(URL) {
  const x = "&x=" + myPlace.lng;
  const y = "&y=" + myPlace.lat + '"';
  const api_URL = await URL + x + y;
  const api = await fetch(api_URL, { method: 'get' });
  const obj = await api.json();
  let option = '';
  for (let i = 0; i < obj.response.station.length; i++){
    option += '<option value="' + obj.response.station[i].line+ '|' +obj.response.station[i].name + '">' + obj.response.station[i].line+ '  ' +obj.response.station[i].name + '</option>';
  }
  document.getElementById('moyori').innerHTML = option;
}

// 駅名から緯度と経度を検索(現在値)
async function get_xy() {
  const value = document.getElementById('moyori').value;
  const array = value.split('|');
  const train = "&line=" + array[0];
  const station = "&name=" + array[1];
  const URL = xy_URL + train + station;
  const api = await fetch(URL, { method: 'GET' });
  const obj = await api.json();
  myPlace.station = await array[1] + "駅";
  myPlace.lng = await obj.response.station[0].x;
  myPlace.lat = await obj.response.station[0].y;
}

// 駅名から緯度と経度を検索(エリアから取得)
async function get_xy2() {
  const station_value = document.getElementById('station').value;
  const train_value   = document.getElementById('line').value;
  const train = "&line=" + train_value;
  const station = "&name=" + station_value;
  const URL = xy_URL + train + station;
  const api = await fetch(URL, { method: 'GET' });
  const obj = await api.json();
  myPlace.station = station_value + "駅";
  myPlace.lng = obj.response.station[0].x;
  myPlace.lat = obj.response.station[0].y;
}

// --------------------------------------------
// 地図の表示
function GetMap(target, latitude, longitude, scale) {
  //Instance
  const map = new Bmap(target);
  //Map:Init
  map.startMap(latitude, longitude, "load", scale);
}

// --------------------------------------------
// 現在地の取得
function GetMyPlace() {
  // 現在地の取得を実施
  $("#overlay").fadeIn(1);
  navigator.geolocation.getCurrentPosition(success, fail);
  async function success(position) {
    myPlace.lat = await position.coords.latitude;
    myPlace.lng = await position.coords.longitude;
    const myMap = document.querySelector('#myMap');
    GetMap(myMap, myPlace.lat, myPlace.lng, 15);
    await get_trainName(train_URL);
    $("#overlay").fadeOut(300);
  }
  function fail() {
    alert('位置情報の取得に失敗しました。');
    $("#overlay").fadeOut(300);
  }
}
// --------------------------------------------
// 緯度・経度にピンを指す
function GetMap_addPin(target, shop, scale,length) {
  //Instance
  const map = new Bmap(target);
  //Map:Init
  map.startMap(myPlace.lat, myPlace.lng, "load", scale);
  for (let i = 0; i < length; i++){
    let pin = 'pin' + i;
    pin = map.pinText(shop[i].lat, shop[i].lng, "'" + shop[i].name + "'",);
  }
  // 現在地にPINを指す
  map.pin(myPlace.lat, myPlace.lng, "#ff0000")
  map.infobox(myPlace.lat, myPlace.lng, "");
}

// --------------------------------------------
// 道順を調べる
function goto(target,shop) {
  const map = new Bmap(target);
  //Map:Init
  map.startMap(shop.lat, shop.lng, "load", 15);
  // 現在地にPINを指す
  map.pin(myPlace.lat, myPlace.lng, "#ff0000");
  const array = [] ;
  map.direction("#direction", "walking", "御茶ノ水", "表参道", array ); //walking or driving
  map.infobox(myPlace.lat, myPlace.lng, "現在地");
}

// --------------------------------------------
// 緯度・経度にピンを指す
function favMap_addPin(target, obj, scale) {
  //Instance
  const map = new Bmap(target);
  //Map:Init
  map.startMap(39, 138, "load", scale);
  let i = 0;
  const area = {};
  for (let key in obj) {
    // 地図にPINを差し込む
    let pin = 'pin' + i;
    pin = map.pinText(obj[key].lat, obj[key].lng, "'" + obj[key].title + "'",);
    // お気に入り店舗に店を表示
    area[obj[key].large_area] += '1';
    i++;
  }
  // 検索結果
  const fav_table = document.getElementById('fav_table');
  fav_table.innerHTML = '';
  const head_tr = document.createElement('tr');
  const th1 = document.createElement('th');
  th1.textContent = 'エリア';
  const th2 = document.createElement('th');
  th2.textContent = 'お気に入り数';
  fav_table.append(head_tr);
  for (let city in area) {
    let text = area[city];
    let count = (text.match(/1/g) || []).length;
    const tr = document.createElement('tr');
    const td1 = document.createElement('td');
    td1.textContent = city;
    const td2 = document.createElement('td');
    td2.textContent = count + '店舗';
    td2.className = "fav_store_num"
    td2.onclick = function (e) {
      const favShop = document.getElementById('fav-shop');
      favShop.innerHTML = '';
      let area = e.target.previousElementSibling.textContent;
      for (let key in firebase_obj) {
        if (firebase_obj[key].large_area == area) {
          // 要素の作成
          const div = document.createElement('div');
          div.className = 'favShop';
          // 子要素の作成
          const p = document.createElement('p');
          p.className = 'fav_p'
          p.textContent = firebase_obj[key].title;
          div.append(p);
          const img = document.createElement('img');
          img.className = 'fav_img'
          img.src = firebase_obj[key].image;
          div.append(img);
          const div2 = document.createElement('div');
          div2.className = 'div-flex';
          div.append(div2);
          const a = document.createElement('a');
          a.className = 'fav_a'
          a.href = firebase_obj[key].url;
          a.target = 'blank';
          a.textContent = "予約する";
          div2.append(a);
          const button = document.createElement('button');
          button.className = 'delete_btn';
          button.textContent = '削除'
          button.id = firebase_obj[key].title;
          button.onclick = function (e) {
            const check = confirm('本当に削除しますか')
            if (check) {
              const me = e.currentTarget;
              const parent = me.parentNode;
              const target = parent.parentNode;
              console.log(target);
              const key = e.target.id;
              db.collection(User.uid).doc(key).delete()
                .then(function () {
                  target.remove();
                  alert('削除しました')
                })
            }
          }
          div2.append(button)
          // 要素の差し込み
          favShop.append(div);
        }
      }
    }
    tr.append(td1);
    tr.append(td2);
    head_tr.append(th1);
    head_tr.append(th2);
    fav_table.append(tr);
  }
  const total = document.getElementById('total');
  total.textContent = "お気に入り登録店舗 " + i + "店"
}
