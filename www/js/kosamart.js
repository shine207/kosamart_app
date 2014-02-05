var deviceReadyDeferred = $.Deferred();
var jqmReadyDeferred = $.Deferred();
var jqmInitDeferred = $.Deferred();
var notiDefferred;
var phone_access = true;

$(document).bind('mobileinit',function(){
    $.extend($.mobile, {
      pushStateEnabled: false,
      allowCrossDomainPages: true
    });

    jqmReadyDeferred.resolve();

});

$(document).on('pagecreate', function(event) {
  var active_page = $(event.target);
  if ( active_page.attr('id') === 'product_list' || active_page.attr('id') === 'login'  ) {
      document.addEventListener('backbutton', backButtonHandler, false);
  } else {
      document.removeEventListener('backbutton', backButtonHandler, false);
  }
});

var re_init_page = /(kosamart\.html)$/;
$(document).on('pagecreate', function(event) {
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

  var pushNotification = window.plugins.pushNotification;
  if ( device.platform == 'android' || device.platform == 'Android' ) {
    pushNotification.register(pushSuccessHandler, pushErrorHandler,{"senderID":"966607716514","ecb":"onPushNotificationGCM"});
  } else {
    pushNotification.register(
        tokenHandler,
        errorHandler, 
        {
          "badge":"true",
          "sound":"true",
          "alert":"true",
          "ecb":"onNotificationAPN"
    });
  }
  //$.mobile.changePage('/', { type :'get', changeHash: true } );   // JQM 1.3
  $.mobile.pageContainer.pagecontainer('change', SERVER_URL+'/', { type :'get', changeHash: true } );
}

//$(document).on('pagecontainerbeforeload', function(e, data) {
//$(document).on('pagebeforeload', function(e, data) {
//  console.log(data.url);
    //if ( typeof data.toPage !== 'string' ){
 //   if ( typeof data.url !== 'string' ){
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
  /*
      return;
    }
    if ( data.options.myReload && data.options.myReload === true )
      return;

    var u = $.mobile.path.parseUrl( data.url );
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
  /*

    data.options.myReload = true;
    data.dataUrl = u.pathname+u.search+u.hash;
    /*
    u.protocol = 'http:';
    u.host = SERVER_URL;
    data.toPage = u.protocol+'//'+(u.username?u.username+u.password+'@':'')+u.host+u.pathname+u.search+u.hash;
    */
  /*
    data.url = SERVER_URL+u.pathname+u.search+u.hash;
    console.log(data.url);
});
*/

function phone_upload_friend(email, make_user) {
    // owner_user 파일이 존재하는지 check
    fs.readFile( OWNER_USER, fs.READ_TYPE_TEXT, (function(err, result) {
        if ( err ) {
          if ( err.code == FileError.NOT_FOUND_ERR && make_user ) {
              navigator.notification.confirm("친구목록을 이 기기의 목록으로 변경하시겠습니까?", function(result){
                  if(result == 2){
                    phone_make_userfile_and_upload_friend(email);
                  }
                  return;
              }, '코사마트', ['아니오','네']);
              return;
          } else {
            console.log(err.code + ' : 기기의 Owner 파일이 존재하지 않습니다.' );
            return;
          }
        } else {
          if ( email == result ) {
            fs.uploadFile( UPDATE_ADDRESS, UPLOAD_FRIEND_URL, (function(err) {
                if ( err ) {
                    console.log(err.code+ ' : 친구목록 추가에 실패했습니다');
                }
            }));
          } else {
            console.log('소유자와 로긴 유저가 다릅니다.');
          }
        }
    }));
};

function phone_make_userfile(email) {
    fs.writeFile( OWNER_USER, email, (function(err) {
        if ( err ) {
            console.log(err.code+ ' : 유저파일 생성에 실패했습니다');
        }
    }));
}

function phone_make_userfile_and_upload_friend(email) {
    fs.writeFile( OWNER_USER, email, (function(err) {
        if ( err ) {
            console.log(err.code+ ' : 유저파일 생성에 실패했습니다');
        } else {
            fs.uploadFile( UPDATE_ADDRESS, UPLOAD_FRIEND_URL, (function(err) {
                if ( err ) {
                    console.log(err.code+ ' : 친구목록 추가에 실패했습니다');
                }
            }));
        }
    }));
}

function phone_upload_noti_id() {
    fs.uploadFile( NOTI_ID, UPLOAD_NOTI_ID_URL, (function(err) {
        if ( err ) {
            console.log(err.code+ ' : NOTI ID 등록에 실패했습니다');
        }
    }));
}




/***
 *  GCM PUSH SOURCE ( android )
 ***/


// result contains any message sent from the plugin call
function pushSuccessHandler(result) {
    //alert('Callback Success! Result = '+result);
}

function pushErrorHandler(error) {
    console.log(error);
    alert(error);
}

function onPushNotificationGCM(e) {
    switch( e.event )
    {
        case 'registered':
            if ( e.regid.length > 0 )
            {
                console.log("Regid " + e.regid);
                fs.writeFile( NOTI_ID, {platform:'android',id:e.regid}, function(err) {
                  if ( err ) {
                      console.log(err.code+ ' : 노티 ID 파일 생성에 실패했습니다');
                  }
                });
            }
        break;

        case 'message':
          // this is the actual push notification. its format depends on the data model from the push server
          if ( e.foreground ) {
              toast2('fore'+e.message);
              //alert('inline noti : message = '+e.message+' msgcnt = '+e.msgcnt);
              var my_media = new Media("/android_asset/www/"+e.soundname);
              my_media.play();
          } else {
            if ( e.coldstart ) {
              toast2('cold'+e.message);
              //alert('coldstart noti : message = '+e.message+' msgcnt = '+e.msgcnt);
            } else {
              toast2('back'+e.message);
              //alert('background noti : message = '+e.message+' msgcnt = '+e.msgcnt);
            }
          }
          //alert(e.payload.message + '(' + e.payload.msgcnt + ')' );
          break;
        case 'error':
          alert('GCM error = '+e.msg);
          break;
        default:
          alert('An unknown GCM event has occurred');
          break;
    }
}

/***
 * ISO PUSH SOURCE
 ***/

function onNotificationAPN (event) {
    if ( event.alert ) {
        navigator.notification.alert(event.alert);
    }

    if ( event.sound ) {
        var snd = new Media(event.sound);
        snd.play();
    }

    if ( event.badge ) {
        pushNotification.setApplicationIconBadgeNumber(successHandler, errorHandler, event.badge);
    }
}
