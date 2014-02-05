/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
var phone_regex=/^01[01679]-?\d{3,4}-?\d{4}$/;
var ADDRESSBOOK_INFO = 'addrbook_info.txt';
var OWNER_USER = 'owner_user.txt';
var UPDATE_ADDRESS = 'update_addr.txt';

//var SERVER_URL = 'http://192.168.0.103:3000';
var SERVER_URL = 'http://54.199.141.113:3000';

var app = {
    own_user:null,
    setUser: function(user) {
        this.own_user = user;
    },
    getUser: function() {
        return this.own_user;
    },

    // Application Constructor
    initialize: function() {
        this.bindEvents();
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady.bind(this), false);
    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicity call 'app.receivedEvent(...);'
    onDeviceReady: function() {
        var that = this;
        async.waterfall([
            function(cb){
                app.receivedEvent('deviceready');
                cb();
            },
            function(cb){
                cb(!app.checkConnection() );
            },
            function(cb){
                app.checkUserFile(cb);
                console.log('checkUser');
            },
            function(result, cb) {
                app.setUser(result);
                if ( result ) {
                    console.log('가입유저');
                    app.checkAddressBookInfo(cb);
                } else {
                    console.log('신규유저');
                    cb(null,null);
                }
            },
            function(result,cb) {
                if ( !result ) {
                    // 신규유저일 경우 초기화
                    result = {updatetime:0, address:[]};
                } else {
                    result = JSON.parse(result);
                }
                if (result.updatetime < (new Date).getTime()) {
                    // 신규유저거나, update time이 지났거나.. 새로 주소록 불러온다.
                    that.getContacts(function(err, new_address) {
                        if ( err ) {
                            cb(err);
                        } else {
                            // update_addr.txt 생성
                            that.modifyAddress( result.address, new_address, function(err) {
                                if ( err )
                                    cb(err);
                                else {
                                    // 새로운 addressbook info 생성
                                    result.updatetime = (new Date).getTime() + 604800000;
                                    result.address = new_address;
                                    fs.writeFile(ADDRESSBOOK_INFO, JSON.stringify(result), function(err) {
                                        cb(err);
                                    });
                                }
                            });
                        }
                    });
                } else {
                  console.log(result.updatetime);
                  console.log((new Date).getTime());
                  cb();
                }
            },
        ], function(err) {
            if ( err )
                console.log(err);
            else
                that.moveToKosamart();
        });
    },
    // Update DOM on a Received Event
    receivedEvent: function(id) {
        var parentElement = document.getElementById(id);
        var listeningElement = parentElement.querySelector('.listening');
        var receivedElement = parentElement.querySelector('.received');
        var errorElement = parentElement.querySelector('.error_context');

        listeningElement.setAttribute('style', 'display:none;');
        receivedElement.setAttribute('style', 'display:block;');
        errorElement.setAttribute('style', 'display:none;');

        console.log('Received Event: ' + id);
    },
    displayError: function(id, msg) {
        var parentElement = document.getElementById(id);
        var listeningElement = parentElement.querySelector('.listening');
        var receivedElement = parentElement.querySelector('.received');
        var errorElement = parentElement.querySelector('.error_context');

        listeningElement.setAttribute('style', 'display:none;');
        receivedElement.setAttribute('style', 'display:none;');
        errorElement.setAttribute('style', 'display:block;');

        errorElement.innerHTML=msg;
        navigator.notification.alert(msg, (function() {}));
    },
    checkConnection: function() {
        var networkState = navigator.connection.type;
        if ( networkState == Connection.NONE ) {
            this.displayError('deviceready','네트웍 연결이 필요합니다...');
            return false;
        } else {
            return true;
        }
    },
    checkUserFile: function(cb) {
        var that = this;
        fs.readFile( OWNER_USER, fs.READ_TYPE_TEXT, (function(err, result) {
            if ( err && err.code != FileError.NOT_FOUND_ERR ) {
                console.log(err);
                that.displayError('deviceready','핸드폰 파일에 접근할 수 없습니다...');
                cb(err);
            } else {
                cb(null, result);
            }
        }));
    },
    checkAddressBookInfo: function(cb) {
        var that = this;
        fs.readFile( ADDRESSBOOK_INFO, fs.READ_TYPE_TEXT, (function(err, result) {
            if ( err ) {
                that.displayError('deviceready','핸드폰 파일에 접근할 수 없습니다...');
                cb(err);
            } else {
                cb(null, result);
            }
        }));
    },
    getContacts: function(cb) {
        var result = Array();

        var options = new ContactFindOptions();
        options.filter = "";
        options.multiple = true;
        var fields = ["phoneNumbers"];
        navigator.contacts.find( fields, onSuccess, onError, options);

        function onSuccess(contacts) {
            console.log(contacts.length);
            for ( var i = 0; i<contacts.length; i++ ) {
                if ( contacts[i]['phoneNumbers'] )
                    for ( var j = 0; j<contacts[i]['phoneNumbers'].length; j++ ) {
                        var phonenumber = contacts[i]['phoneNumbers'][j].value ;
                        if ( phone_regex.test(phonenumber) === true )
                            result.push( phonenumber );
                    }
            }
            cb(null, result);
        }
        function onError(contactError) {
            console.log(contactError);
            app.displayError('deviceready', '친구목록을 가져올수 없습니다.');
            cb(contactError);
        }
    },
    moveToKosamart: function() {
        var that = this;
        function move() {
          $.ajax({
            url: SERVER_URL+'/alive',
            type: 'GET',
            error : function() {
              app.displayError('deviceready', '서버에 접속할수 없습니다.');
            },
            success: function(data) {
              location.href= "kosamart.html";
            }
          });
        };
        setTimeout(move, 1000);
    },
    modifyAddress: function(origin, current, cb) {
        // 동일한지 비교
        /*
        var diff_flag = false;
        if ( origin.length != current.length ) {
            diff_flag = true;
        } else if ( md5(JSON.stringify(origin)) != md5(JSON.stringify(current)) ) {
            diff_flag = true;
        } 
        if ( diff_flag ) {
        */
        if ( true ) {
            var diff = _.difference(current, origin);
            if ( diff || diff.length > 0 ) {
                fs.writeFile(UPDATE_ADDRESS, JSON.stringify(diff), function(err) {
                    if ( err ) {
                        app.displayError('deviceready', '친구목록 업데이트에 실패했습니다.');
                    }
                    cb(err);
                });
            } else
              cb();
        } else
          cb();
    }
};

      /*
      console.log("topage : " + data.toPage );
      //console.log("frompage : " + data.options.fromPage?data.options.fromPage.attr('data-url'):'null' );
      console.log("dataUrl : " + data.options.dataUrl );
      console.log("reloadPage : " + data.options.reloadPage );

      // 동일페이지 호출
      if ( data.options.fromPage && data.options.fromPage[0] === data.toPage[0] && !) {
        return;
      }

      if ( typeof data.toPage !== 'string' ){
        return;
      }
      var u = $.mobile.path.parseUrl( data.toPage );
      // #어쩌고저쩌고 오는것들도 그냥 일반처리
      if ( u.hash.length > 0 ) {
        return;
      }
      if ( !data.options.reloadPage || data.options.reloadPage == false ) {
        // dom tree 찾아서 있으면 그냥 그쪽으로 넘겨줌.
      }

      // injection.
      e.preventDefault();
      showKosamart( u, data.options );
      */
 
/*
function showKosamart( urlObj, options ) {
    $.ajax({
      type: options.type,
      url: SERVER_URL+urlObj.pathname+urlObj.search,
      data: options.data,
      //dataType: 'json',
      success: function(data, textStatus) {
        if ( data.redirect) {
          options.type = 'get';
          showKosamart(data.redirect, options);
        } else {
            var $wrap = $('.wrap');
            var $tmp = $('<div></div>');
            var $to_page = $tmp.html(data).find('.frame_page').clone();
            $tmp.remove();
            $to_page.appendTo($wrap);

            $to_page.page();
            //options.dataUrl = urlObj.href;
            options.dataUrl = urlObj.pathname+urlObj.search
            $.mobile.changePage( $to_page, options );
        }
      },
      error: function(data) {
        toast2(data,true);
        data.deferred.reject(data.absUrl, data.options);
      },
    });
};

*/
