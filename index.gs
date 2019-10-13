// ChatWork API Tokenページで確認できる Token を var chatworkToken に設定します
// API Token確認ページ : https://www.chatwork.com/service/packages/chatwork/subpackages/api/token.php
var chatworkToken = '';
var sheet = SpreadsheetApp.getActive().getActiveSheet();

// ChatWorkに文字が入力された時に動作します
function doPost(e) {
    try {
        // ChatWorkに入力された情報を受取る
        // 受け取る情報 : http://developer.chatwork.com/ja/webhook.html#eventCreated
        var webhookJson = JSON.parse(e.postData.contents);

        // 無限ループを回避する為の対処
        var roopBlock = webhookJson.webhook_event.body.match(/アイコン\&プロフィールを設定しよう！/);
        if (!roopBlock) {
            // ChatWorkのメッセージ情報を取得します
            // メッセージを投稿したアカウントの情報も含まれます
            var getChatworkMessageJson = getChatworkMessage(webhookJson);

            // メッセージを投稿したアカウントのプロフィール画像が設定されていない時、「アイコン&プロフィールを設定しよう！」メッセージを送信します
            var defaultProfielImg = "https://appdata.chatwork.com/avatar/ico_default_blue.png";
            if (getChatworkMessageJson.account.avatar_image_url == defaultProfielImg) {
                var title = "アイコン&プロフィールを設定しよう！";
                var message = "アイコンはあなたの顔となり、覚えてもらえるチャンスです😁\n" +"円滑なコミュニケーションにも繋がりますので、\n必ず設定をお願いします。\n" + "https://liberaluni.com/yuru-community-precautions#2";
                postChatworkMessage(webhookJson, getChatworkMessageJson, title, message)
            }
        }

        // 成功をスプレッドシートに記録
        sheet.appendRow(['success', new Date(), JSON.stringify(e.postData)]);
    } catch(ex) {
        // 失敗をスプレッドシートに記録
        sheet.appendRow(['error', new Date(), ex]);
    }
}

// ChatWorkのメッセージ情報を取得します
// 取得する情報 : http://developer.chatwork.com/ja/endpoint_rooms.html#GET-rooms-room_id-messages-message_id
function getChatworkMessage(webhookJson) {
    var messageApi = "https://api.chatwork.com/v2/rooms/" + webhookJson.webhook_event.room_id + "/messages/" + webhookJson.webhook_event.message_id;
    var options = {
        "headers" : {"X-ChatWorkToken": chatworkToken}
    };
    return JSON.parse(UrlFetchApp.fetch(messageApi, options));
}

// ChatWorkにメッセージを送信します
// 送信する情報 : http://developer.chatwork.com/ja/endpoint_rooms.html#POST-rooms-room_id-messages
function postChatworkMessage (webhookJson, getChatworkMessageJson, title, message) {
    // ChatWorkのメッセージ記法を利用してチャットに表示される文言を装飾します
    // メッセージ記法 : http://developer.chatwork.com/ja/messagenotation.html
    var message = "[rp aid={"+ getChatworkMessageJson.account.account_id + "} to={"+ webhookJson.webhook_event.room_id +"}-{"+ webhookJson.webhook_event.message_id +"}][info][title]" + title + "[/title]" + message + "[/info]"
    var options = {
        "method" : "post",
        "payload" : {"body" : message},
        "headers" : {"X-ChatWorkToken": chatworkToken}
    };
    return UrlFetchApp.fetch("https://api.chatwork.com/v2/rooms/" + webhookJson.webhook_event.room_id + "/messages", options);
}
