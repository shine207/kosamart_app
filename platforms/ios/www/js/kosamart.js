//var SERVER_URL = 'http://192.168.0.103:3000';
var SERVER_URL = 'http://54.199.141.113:3000';
var deviceReadyDeferred = $.Deferred();
var jqmReadyDeferred = $.Deferred();
var jqmInitDeferred = $.Deferred();

$(document).bind('mobileinit',function(){
    $.extend($.mobile, {
      pushStateEnabled: false,
      allowCrossDomainPages: true
    });

    jqmReadyDeferred.resolve();

});

$(document).on('pageshow', function(event) {
  var active_page = $(event.target);
  if ( active_page.attr('id') === 'product_list' ) {
      document.addEventListener('backbutton', backButtonHandler, false);
  } else {
      document.removeEventListener('backbutton', backButtonHandler, false);
  }
});

var re_init_page = /(kosamart\.html)$/;
$(document).on('pageinit', function(event) {
  var active_page = $(event.target);
  if ( active_page.attr('id') === 'init_page' ) {
      jqmInitDeferred.resolve();
  } else {
/*
console.log( 'init' );

  document.removeEventListener('backbutton', backButtonHandler, false);
  var last = $.mobile.urlHistory.stack.length -1;
  var last_url = $.mobile.urlHistory.stack[last].url;
  console.log(last_url);
    if ( last_url.search(re_init_page) !== -1 ) {
      document.addEventListener('backbutton', backButtonHandler, false);
    }
*/
  }
});

/*
function backButtonHandler(e) {
    console.log('aaa' + document.referrer);
    if ( document.referrer.search(first_page_re) !== -1 ) {
        navigator.notification.confirm("종료하시겠습니까?", function(result){
            if(result == 2){
                navigator.app.exitApp();
            }else{
                e.preventDefault();
            }
        }, '코사마트', '취소,종료');
    } else {
        window.history.back();
    }
}
*/
function backButtonHandler(e) {
    navigator.notification.confirm("종료하시겠습니까?", function(result){
            if(result == 2){
                navigator.app.exitApp();
            }else{
                e.preventDefault();
            }
        }, '코사마트', ['취소','종료']);
}

function deviceReady() {
//  document.addEventListener('backbutton', backButtonHandler, false);
  deviceReadyDeferred.resolve();
}

document.addEventListener('deviceready', deviceReady, false);

$.when(jqmInitDeferred, deviceReadyDeferred, jqmReadyDeferred).then(doWhenBothFrameworksLoaded);

function doWhenBothFrameworksLoaded() {
  $.mobile.changePage('/', { type :'get', changeHash: true } );
}

$(document).on('pagebeforechange', function(e, data) {
    if ( typeof data.toPage !== 'string' ){
/*
      if ( data.toPage === $('#init_page') ) {
          e.preventDefault();
          navigator.notification.confirm("종료하시겠습니까?", function(result){
            if(result == 2){
                navigator.app.exitApp();
            } else {
                $.mobile.changePage($('#product_list'), { type :'get', changeHash: true } );
            }
          }, '코사마트', ['취소','종료']);
          return;
      }
*/
      return;
    }
    if ( data.options.myReload && data.options.myReload === true )
      return;

    var u = $.mobile.path.parseUrl( data.toPage );
    if ( u.hash ) {
      return;
    }
/*
    if ( u.protocol == 'file:' ) {
        e.preventDefault();
        navigator.notification.confirm("종료하시겠습니까?", function(result){
            if(result == 2){
                navigator.app.exitApp();
            } else {
                $.mobile.changePage($('#product_list'), { type :'get', changeHash: true } );
            }
        }, '코사마트', ['취소','종료']);
        return;
    }
*/

    data.options.myReload = true;
    data.options.dataUrl = u.pathname+u.search+u.hash;
    /*
    u.protocol = 'http:';
    u.host = SERVER_URL;
    data.toPage = u.protocol+'//'+(u.username?u.username+u.password+'@':'')+u.host+u.pathname+u.search+u.hash;
    */
    data.toPage = SERVER_URL+u.pathname+u.search+u.hash;
    console.log(data.toPage);
});


