// ChatWork API Tokenページで確認できる Token を var chatworkToken に設定します
// API Token確認ページ : https://www.chatwork.com/service/packages/chatwork/subpackages/api/token.php
var chatworkToken = "";

// ChatWork WebHook トークンを var webhookToken に設定します
// 下記、リストページからWebHookの「編集」をクリック > 詳細ページの「トークン」をコピーして設定します
// https://www.chatwork.com/service/packages/chatwork/subpackages/webhook/list.php
var webhookToken = "";
var sheet = SpreadsheetApp.getActive().getActiveSheet();

// ChatWorkに文字が入力された時に動作します
function doPost(e) {
    try {
        // ChatWorkのリクエストの証明検証
        // WebHookのURLが漏洩しても外部から任意のリクエストをWebhook経由でChatWorkに送信させない
        var contents = e.postData.contents;
        var signature = getSignature(contents);
        if (e.parameter.chatwork_webhook_signature !== signature) {
            sheet.appendRow(['error', 'Invalid webhook signature', e.parameter.chatwork_webhook_signature]);
            return;
        }

        // ChatWorkに入力された情報を受取る
        // 受け取る情報 : http://developer.chatwork.com/ja/webhook.html#eventCreated
        var webhookJson = JSON.parse(contents);

        // 無限ループを回避する為の対処
        var roopBlock = webhookJson.webhook_event.body.match(/プロフ設定してないと発言禁止なので設定してな〜 \^_\^/);
        if (!roopBlock) {
            // ChatWorkのメッセージ情報を取得します
            // メッセージを投稿したアカウントの情報も含まれます
            var getChatworkMessageJson = getChatworkMessage(webhookJson);
            // メッセージを投稿したアカウントのプロフィール画像が設定されていない時、「プロフ設定してないと発言禁止なので早めに設定してね〜 ^_^」メッセージを送信します
            // (ChatWorkは一度プロフィール画像を設定すると削除する事ができません。画像を設定している場合「chatwork_bot_debug」と入力することで動作確認できます)
            var defaultProfielImgRegex = /https:\/\/appdata.chatwork.com\/avatar\/ico_default_/;
            if (getChatworkMessageJson.account.avatar_image_url.match(defaultProfielImgRegex) || webhookJson.webhook_event.body == 'chatwork_bot_debug') {
                var title = "プロフ設定してないと発言禁止なので設定してな〜 ^_^";
                var message = "ガイドラインは必ず最後まで\n目を通してな^ ^\n最低限のルールや。\nプロフ設定についても書いてるで〜\n" + "https://liberaluni.com/yuru-community-precautions#2";
                postChatworkMessage(webhookJson, getChatworkMessageJson, title, message)
            }
        }

        // 成功をスプレッドシートに記録
        sheet.appendRow(['success', new Date(), JSON.stringify(e.postData)]);
    } catch (ex) {
        // 失敗をスプレッドシートに記録
        sheet.appendRow(['error', new Date(), ex]);
    }
}

// ChatWorkのメッセージ情報を取得します
// 取得する情報 : http://developer.chatwork.com/ja/endpoint_rooms.html#GET-rooms-room_id-messages-message_id
function getChatworkMessage(webhookJson) {
    var messageApi = "https://api.chatwork.com/v2/rooms/" + webhookJson.webhook_event.room_id + "/messages/" + webhookJson.webhook_event.message_id;
    var options = {
        "headers": {"X-ChatWorkToken": chatworkToken}
    };
    return JSON.parse(UrlFetchApp.fetch(messageApi, options));
}

// ChatWorkにメッセージを送信します
// 送信する情報 : http://developer.chatwork.com/ja/endpoint_rooms.html#POST-rooms-room_id-messages
function postChatworkMessage(webhookJson, getChatworkMessageJson, title, message) {
    // ChatWorkのメッセージ記法を利用してチャットに表示される文言を装飾します
    // メッセージ記法 : http://developer.chatwork.com/ja/messagenotation.html
    var message = "[info][title]" + title + "[/title]" + message + "[/info]"
    var options = {
        "method": "post",
        "payload": {"body": message},
        "headers": {"X-ChatWorkToken": chatworkToken}
    };
    return UrlFetchApp.fetch("https://api.chatwork.com/v2/rooms/" + webhookJson.webhook_event.room_id + "/messages", options);
}

// ChatWorkのリクエストの証明検証
// http://developer.chatwork.com/ja/webhook.html#requestSign
function getSignature(contents) {
    var shaObj = new jsSHA("SHA-256", "TEXT");
    shaObj.setHMACKey(webhookToken, "B64");
    shaObj.update(contents);
    return shaObj.getHMAC("B64");
}


// Copy from jsSHA/sha256.js at f812eb471428e9e00cc73c975a35bcc73fdacf2e · Caligatio/jsSHA https://github.com/Caligatio/jsSHA/blob/f812eb471428e9e00cc73c975a35bcc73fdacf2e/src/sha256.js
/*
 A JavaScript implementation of the SHA family of hashes, as
 defined in FIPS PUB 180-4 and FIPS PUB 202, as well as the corresponding
 HMAC implementation as defined in FIPS PUB 198a

 Copyright Brian Turek 2008-2017
 Distributed under the BSD License
 See http://caligatio.github.com/jsSHA/ for more information

 Several functions taken from Paul Johnston
*/
'use strict';(function(I){function w(c,a,d){var l=0,b=[],g=0,f,n,k,e,h,q,y,p,m=!1,t=[],r=[],u,z=!1;d=d||{};f=d.encoding||"UTF8";u=d.numRounds||1;if(u!==parseInt(u,10)||1>u)throw Error("numRounds must a integer >= 1");if(0===c.lastIndexOf("SHA-",0))if(q=function(b,a){return A(b,a,c)},y=function(b,a,l,f){var g,e;if("SHA-224"===c||"SHA-256"===c)g=(a+65>>>9<<4)+15,e=16;else throw Error("Unexpected error in SHA-2 implementation");for(;b.length<=g;)b.push(0);b[a>>>5]|=128<<24-a%32;a=a+l;b[g]=a&4294967295;
    b[g-1]=a/4294967296|0;l=b.length;for(a=0;a<l;a+=e)f=A(b.slice(a,a+e),f,c);if("SHA-224"===c)b=[f[0],f[1],f[2],f[3],f[4],f[5],f[6]];else if("SHA-256"===c)b=f;else throw Error("Unexpected error in SHA-2 implementation");return b},p=function(b){return b.slice()},"SHA-224"===c)h=512,e=224;else if("SHA-256"===c)h=512,e=256;else throw Error("Chosen SHA variant is not supported");else throw Error("Chosen SHA variant is not supported");k=B(a,f);n=x(c);this.setHMACKey=function(b,a,g){var e;if(!0===m)throw Error("HMAC key already set");
    if(!0===z)throw Error("Cannot set HMAC key after calling update");f=(g||{}).encoding||"UTF8";a=B(a,f)(b);b=a.binLen;a=a.value;e=h>>>3;g=e/4-1;if(e<b/8){for(a=y(a,b,0,x(c));a.length<=g;)a.push(0);a[g]&=4294967040}else if(e>b/8){for(;a.length<=g;)a.push(0);a[g]&=4294967040}for(b=0;b<=g;b+=1)t[b]=a[b]^909522486,r[b]=a[b]^1549556828;n=q(t,n);l=h;m=!0};this.update=function(a){var c,f,e,d=0,p=h>>>5;c=k(a,b,g);a=c.binLen;f=c.value;c=a>>>5;for(e=0;e<c;e+=p)d+h<=a&&(n=q(f.slice(e,e+p),n),d+=h);l+=d;b=f.slice(d>>>
    5);g=a%h;z=!0};this.getHash=function(a,f){var d,h,k,q;if(!0===m)throw Error("Cannot call getHash after setting HMAC key");k=C(f);switch(a){case "HEX":d=function(a){return D(a,e,k)};break;case "B64":d=function(a){return E(a,e,k)};break;case "BYTES":d=function(a){return F(a,e)};break;case "ARRAYBUFFER":try{h=new ArrayBuffer(0)}catch(v){throw Error("ARRAYBUFFER not supported by this environment");}d=function(a){return G(a,e)};break;default:throw Error("format must be HEX, B64, BYTES, or ARRAYBUFFER");
}q=y(b.slice(),g,l,p(n));for(h=1;h<u;h+=1)q=y(q,e,0,x(c));return d(q)};this.getHMAC=function(a,f){var d,k,t,u;if(!1===m)throw Error("Cannot call getHMAC without first setting HMAC key");t=C(f);switch(a){case "HEX":d=function(a){return D(a,e,t)};break;case "B64":d=function(a){return E(a,e,t)};break;case "BYTES":d=function(a){return F(a,e)};break;case "ARRAYBUFFER":try{d=new ArrayBuffer(0)}catch(v){throw Error("ARRAYBUFFER not supported by this environment");}d=function(a){return G(a,e)};break;default:throw Error("outputFormat must be HEX, B64, BYTES, or ARRAYBUFFER");
}k=y(b.slice(),g,l,p(n));u=q(r,x(c));u=y(k,e,h,u);return d(u)}}function m(){}function D(c,a,d){var l="";a/=8;var b,g;for(b=0;b<a;b+=1)g=c[b>>>2]>>>8*(3+b%4*-1),l+="0123456789abcdef".charAt(g>>>4&15)+"0123456789abcdef".charAt(g&15);return d.outputUpper?l.toUpperCase():l}function E(c,a,d){var l="",b=a/8,g,f,n;for(g=0;g<b;g+=3)for(f=g+1<b?c[g+1>>>2]:0,n=g+2<b?c[g+2>>>2]:0,n=(c[g>>>2]>>>8*(3+g%4*-1)&255)<<16|(f>>>8*(3+(g+1)%4*-1)&255)<<8|n>>>8*(3+(g+2)%4*-1)&255,f=0;4>f;f+=1)8*g+6*f<=a?l+="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/".charAt(n>>>
    6*(3-f)&63):l+=d.b64Pad;return l}function F(c,a){var d="",l=a/8,b,g;for(b=0;b<l;b+=1)g=c[b>>>2]>>>8*(3+b%4*-1)&255,d+=String.fromCharCode(g);return d}function G(c,a){var d=a/8,l,b=new ArrayBuffer(d),g;g=new Uint8Array(b);for(l=0;l<d;l+=1)g[l]=c[l>>>2]>>>8*(3+l%4*-1)&255;return b}function C(c){var a={outputUpper:!1,b64Pad:"=",shakeLen:-1};c=c||{};a.outputUpper=c.outputUpper||!1;!0===c.hasOwnProperty("b64Pad")&&(a.b64Pad=c.b64Pad);if("boolean"!==typeof a.outputUpper)throw Error("Invalid outputUpper formatting option");
    if("string"!==typeof a.b64Pad)throw Error("Invalid b64Pad formatting option");return a}function B(c,a){var d;switch(a){case "UTF8":case "UTF16BE":case "UTF16LE":break;default:throw Error("encoding must be UTF8, UTF16BE, or UTF16LE");}switch(c){case "HEX":d=function(a,b,c){var f=a.length,d,k,e,h,q;if(0!==f%2)throw Error("String of HEX type must be in byte increments");b=b||[0];c=c||0;q=c>>>3;for(d=0;d<f;d+=2){k=parseInt(a.substr(d,2),16);if(isNaN(k))throw Error("String of HEX type contains invalid characters");
    h=(d>>>1)+q;for(e=h>>>2;b.length<=e;)b.push(0);b[e]|=k<<8*(3+h%4*-1)}return{value:b,binLen:4*f+c}};break;case "TEXT":d=function(c,b,d){var f,n,k=0,e,h,q,m,p,r;b=b||[0];d=d||0;q=d>>>3;if("UTF8"===a)for(r=3,e=0;e<c.length;e+=1)for(f=c.charCodeAt(e),n=[],128>f?n.push(f):2048>f?(n.push(192|f>>>6),n.push(128|f&63)):55296>f||57344<=f?n.push(224|f>>>12,128|f>>>6&63,128|f&63):(e+=1,f=65536+((f&1023)<<10|c.charCodeAt(e)&1023),n.push(240|f>>>18,128|f>>>12&63,128|f>>>6&63,128|f&63)),h=0;h<n.length;h+=1){p=k+
    q;for(m=p>>>2;b.length<=m;)b.push(0);b[m]|=n[h]<<8*(r+p%4*-1);k+=1}else if("UTF16BE"===a||"UTF16LE"===a)for(r=2,n="UTF16LE"===a&&!0||"UTF16LE"!==a&&!1,e=0;e<c.length;e+=1){f=c.charCodeAt(e);!0===n&&(h=f&255,f=h<<8|f>>>8);p=k+q;for(m=p>>>2;b.length<=m;)b.push(0);b[m]|=f<<8*(r+p%4*-1);k+=2}return{value:b,binLen:8*k+d}};break;case "B64":d=function(a,b,c){var f=0,d,k,e,h,q,m,p;if(-1===a.search(/^[a-zA-Z0-9=+\/]+$/))throw Error("Invalid character in base-64 string");k=a.indexOf("=");a=a.replace(/\=/g,
    "");if(-1!==k&&k<a.length)throw Error("Invalid '=' found in base-64 string");b=b||[0];c=c||0;m=c>>>3;for(k=0;k<a.length;k+=4){q=a.substr(k,4);for(e=h=0;e<q.length;e+=1)d="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/".indexOf(q[e]),h|=d<<18-6*e;for(e=0;e<q.length-1;e+=1){p=f+m;for(d=p>>>2;b.length<=d;)b.push(0);b[d]|=(h>>>16-8*e&255)<<8*(3+p%4*-1);f+=1}}return{value:b,binLen:8*f+c}};break;case "BYTES":d=function(a,b,c){var d,n,k,e,h;b=b||[0];c=c||0;k=c>>>3;for(n=0;n<a.length;n+=
    1)d=a.charCodeAt(n),h=n+k,e=h>>>2,b.length<=e&&b.push(0),b[e]|=d<<8*(3+h%4*-1);return{value:b,binLen:8*a.length+c}};break;case "ARRAYBUFFER":try{d=new ArrayBuffer(0)}catch(l){throw Error("ARRAYBUFFER not supported by this environment");}d=function(a,b,c){var d,n,k,e,h;b=b||[0];c=c||0;n=c>>>3;h=new Uint8Array(a);for(d=0;d<a.byteLength;d+=1)e=d+n,k=e>>>2,b.length<=k&&b.push(0),b[k]|=h[d]<<8*(3+e%4*-1);return{value:b,binLen:8*a.byteLength+c}};break;default:throw Error("format must be HEX, TEXT, B64, BYTES, or ARRAYBUFFER");
}return d}function r(c,a){return c>>>a|c<<32-a}function J(c,a,d){return c&a^~c&d}function K(c,a,d){return c&a^c&d^a&d}function L(c){return r(c,2)^r(c,13)^r(c,22)}function M(c){return r(c,6)^r(c,11)^r(c,25)}function N(c){return r(c,7)^r(c,18)^c>>>3}function O(c){return r(c,17)^r(c,19)^c>>>10}function P(c,a){var d=(c&65535)+(a&65535);return((c>>>16)+(a>>>16)+(d>>>16)&65535)<<16|d&65535}function Q(c,a,d,l){var b=(c&65535)+(a&65535)+(d&65535)+(l&65535);return((c>>>16)+(a>>>16)+(d>>>16)+(l>>>16)+(b>>>
    16)&65535)<<16|b&65535}function R(c,a,d,l,b){var g=(c&65535)+(a&65535)+(d&65535)+(l&65535)+(b&65535);return((c>>>16)+(a>>>16)+(d>>>16)+(l>>>16)+(b>>>16)+(g>>>16)&65535)<<16|g&65535}function x(c){var a=[],d;if(0===c.lastIndexOf("SHA-",0))switch(a=[3238371032,914150663,812702999,4144912697,4290775857,1750603025,1694076839,3204075428],d=[1779033703,3144134277,1013904242,2773480762,1359893119,2600822924,528734635,1541459225],c){case "SHA-224":break;case "SHA-256":a=d;break;case "SHA-384":a=[new m,new m,
    new m,new m,new m,new m,new m,new m];break;case "SHA-512":a=[new m,new m,new m,new m,new m,new m,new m,new m];break;default:throw Error("Unknown SHA variant");}else throw Error("No SHA variants supported");return a}function A(c,a,d){var l,b,g,f,n,k,e,h,m,r,p,w,t,x,u,z,A,B,C,D,E,F,v=[],G;if("SHA-224"===d||"SHA-256"===d)r=64,w=1,F=Number,t=P,x=Q,u=R,z=N,A=O,B=L,C=M,E=K,D=J,G=H;else throw Error("Unexpected error in SHA-2 implementation");d=a[0];l=a[1];b=a[2];g=a[3];f=a[4];n=a[5];k=a[6];e=a[7];for(p=
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           0;p<r;p+=1)16>p?(m=p*w,h=c.length<=m?0:c[m],m=c.length<=m+1?0:c[m+1],v[p]=new F(h,m)):v[p]=x(A(v[p-2]),v[p-7],z(v[p-15]),v[p-16]),h=u(e,C(f),D(f,n,k),G[p],v[p]),m=t(B(d),E(d,l,b)),e=k,k=n,n=f,f=t(g,h),g=b,b=l,l=d,d=t(h,m);a[0]=t(d,a[0]);a[1]=t(l,a[1]);a[2]=t(b,a[2]);a[3]=t(g,a[3]);a[4]=t(f,a[4]);a[5]=t(n,a[5]);a[6]=t(k,a[6]);a[7]=t(e,a[7]);return a}var H;H=[1116352408,1899447441,3049323471,3921009573,961987163,1508970993,2453635748,2870763221,3624381080,310598401,607225278,1426881987,1925078388,2162078206,
    2614888103,3248222580,3835390401,4022224774,264347078,604807628,770255983,1249150122,1555081692,1996064986,2554220882,2821834349,2952996808,3210313671,3336571891,3584528711,113926993,338241895,666307205,773529912,1294757372,1396182291,1695183700,1986661051,2177026350,2456956037,2730485921,2820302411,3259730800,3345764771,3516065817,3600352804,4094571909,275423344,430227734,506948616,659060556,883997877,958139571,1322822218,1537002063,1747873779,1955562222,2024104815,2227730452,2361852424,2428436474,
    2756734187,3204031479,3329325298];"function"===typeof define&&define.amd?define(function(){return w}):"undefined"!==typeof exports?("undefined"!==typeof module&&module.exports&&(module.exports=w),exports=w):I.jsSHA=w})(this);