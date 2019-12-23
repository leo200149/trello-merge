const KEY = 'f459e351f335f1dbedd8fd933bee395e';
var TOKEN = '';
const regex = /^/gm;
const subst = `\t`;
var listT;
function Init(){
  console.log('TrelloPowerUp.initialize');
  TrelloPowerUp.initialize({
    'list-actions': function (t) {
      listT = t;
      return t.getRestApi()
      .isAuthorized()
      .then(function(isAuthorized) {
        if (isAuthorized) {
          return [{
            text: "合併整串",
            callback: ShowMenu
          }];
        } else {
          return [{
            text: "合併整串",
            callback: ShowIframe
          }];
        }
      });
    }
  }, { appKey: KEY, appName: 'test' });
}

function ShowMenu(t){
    t.list('name', 'id')
    .then(function (list) {
      GetToken(t);
    });
}

function ShowIframe(t){
  return t.popup({
    title: 'Authorize to continue',
    url: './authorize.html',
    callback:function(t){
      listT.closeModal();
    }
  });
}

function GetToken(t){
  t.getRestApi()
  .getToken()
  .then(function(token) {
    TOKEN = token;
    let listId = t.getContext().list;
    t.list('all')
      .then(function (list) {
        let cards = list.cards;
        let desc = '';
        for (let i in cards) {
          let card = cards[i];
          desc += ('# ' + card.name + '\n\n');
          desc += (card.desc.replace(regex, subst) + '\n\n');
          desc += ('---' + '\n\n');
        }
        NewCard({ listId: listId, name: DateFormat().format(new Date(), 'YYYYMMDDhhmmss') + '合併單', desc: desc });
      });
  });
  listT.closeModal();
}

function NewCard(card) {
  var xhr = new XMLHttpRequest();
  var form_data = new FormData();
  for (var key in card) {
    form_data.append(key, card[key]);
  }
  xhr.addEventListener("readystatechange", function () {
    if (this.readyState === this.DONE) {
      console.log(this.responseText);
    }
  });
  xhr.open("POST", "https://api.trello.com/1/cards?idList=" + card.listId + "&keepFromSource=all&key=" + KEY + "&token=" + TOKEN);
  xhr.send(form_data);
}

function NewComment(cardId, desc) {
  var xhr = new XMLHttpRequest();
  var form_data = new FormData();
  form_data.append('text', desc);
  xhr.addEventListener("readystatechange", function () {
    if (this.readyState === this.DONE) {
      console.log(this.responseText);
    }
  });
  xhr.open("POST", "https://api.trello.com/1/cards/" + cardId + "/actions/comments?key=" + KEY + "&token=" + TOKEN);
  xhr.send(form_data);
}

function DateFormat() {
  return new DateFormat.prototype.init();
}
DateFormat.fn = DateFormat.prototype = {
  _default: {
    formatFn: function (date, pattern) {
      date = date || 0;
      pattern = pattern.length;
      return pattern === 1 ? date : (Math.pow(10, pattern) + date + '').slice(- pattern);
    },
    formatMap: {
      Y: function (d, f) {
        return DateFormat.fn._default.formatFn(d.getFullYear(), f);
      },
      M: function (d, f) {
        return DateFormat.fn._default.formatFn(d.getMonth() + 1, f);
      },
      D: function (d, f) {
        return DateFormat.fn._default.formatFn(d.getDate(), f);
      },
      h: function (d, f) {
        return DateFormat.fn._default.formatFn(d.getHours(), f);
      },
      m: function (d, f) {
        return DateFormat.fn._default.formatFn(d.getMinutes(), f);
      },
      s: function (d, f) {
        return DateFormat.fn._default.formatFn(d.getSeconds(), f);
      },
      w: function (d, f) {
        return d.getDay();
      }
    },
  },
  // 初始化
  init: function () {
    return this;
  },
  // 配置
  config: function (config) {
    for (var name in config) {
      this._default[name] = config[name];
    }
    return this;
  },
  // 格式化
  format: function (date, pattern) {

    date = new Date(date);

    if (/Invalid/i.test(date + '')) {
      console.error('请提供一个合法日期！');
      return;
    }

    var _self = this,
      char = '';

    return pattern.replace(/([YMDhsmw])\1*/g,
      function (format) {
        char = format.charAt();
        return _self._default.formatMap[char] ? _self._default.formatMap[char](date, format) : '';
      });
  }
};

DateFormat.fn.init.prototype = DateFormat.fn;