# ChatWork Bot
### 必要
```
ChatWorkアカウント
Googleアカウント
```

### 動作
プロフィール画像設定がされてない、ChatWorkアカウントが発言した場合に自動で通知するbot
![動作](https://user-images.githubusercontent.com/45530161/66712756-5cfa3400-eddc-11e9-9ebe-f42982383013.gif)

### 実装手順
1. <a href="https://www.chatwork.com/service/packages/chatwork/subpackages/api/token.php" target="_blank">API Tokenをコピーします</a>  
![token](https://user-images.githubusercontent.com/45530161/66712973-91bbba80-eddf-11e9-805f-c1e1afc12d0e.png)

1. API Token を <a href="https://github.com/hitoshi-kakihana/chatwork_bot/edit/master/index.gs" target="_blank">index.gs</a> の3行目に記入してソースコードをコピーします  

1. Google Apps Scriptを作成  
適当なスプレッドシートを作成（名前は任意）  
![1](https://user-images.githubusercontent.com/45530161/66713135-aef18880-ede1-11e9-8641-ab28dbffc7c8.png)  
スクリプトエディタに 2でコピーしたソースコードを貼り付けます  
「保存」アイコンをクリック  
「プロジェクト名の編集」（任意の名前を記入）OKをクリック  
「ウェブアプリケーションとして導入」をクリック  
![2](https://user-images.githubusercontent.com/45530161/66713205-7bfbc480-ede2-11e9-9f79-81a7520fc01f.png)  
「プロジェクトバージョン」(任意の名前を入力)  
「次のユーザーとしてアプリケーションを実行」(自分のgmailを選択)  
「アプリケーションにアクセスできるユーザー」(全員 匿名ユーザーを含むを選択)  
「導入」をクリック  
![aaa](https://user-images.githubusercontent.com/45530161/66713341-a3539100-ede4-11e9-9723-6f0378578156.png)  
「現在のウェブアプリケーションのURL」をコピーします  
![jjj](https://user-images.githubusercontent.com/45530161/66713548-2a096d80-ede7-11e9-91c4-8e446b695927.png)  

1. <a href="https://www.chatwork.com/service/packages/chatwork/subpackages/webhook/create.php" target="_blank">ChatWork WebHookを作成</a>    
「Webhook名」(任意の名前を入力)  
「Webhook URL」(現在のウェブアプリケーションのURL を貼り付けます)  
「ルームイベント」「メッセージ作成」「メッセージ更新」を選択  
「ルームID」（ChatWorkの　マイチャット のURLの末尾の数字を入力します)  
![webhook](https://user-images.githubusercontent.com/45530161/66713685-bd8f6e00-ede8-11e9-9195-a2f066a3cca4.png)  
「トークン」をコピーして<a href="https://github.com/hitoshi-kakihana/chatwork_bot/edit/master/index.gs" target="_blank">index.gs</a> の8行目に記入します　Googleスプレッドシートのスクリプトエディタに直接貼り付けてください  
保存するときは「開発時注意点」を参考に修正を反映してください  
 (3行目に記入したAPI Tokenを消さないように注意してください)
![Webhookの編集   Chatwork](https://user-images.githubusercontent.com/45530161/66716487-2e468280-ee09-11e9-91e4-4b30fcf802cd.png)

1. ChatWork の マイチャット ルームで文字を入力してbotが通知してくる事を確認します  
※通知が来ない場合は「chatwork_bot_debug」と入力することでbotが反応します  
補足：ChatWorkは一度プロフィール画像を設定すると削除する事ができません  
そのため画像を設定している場合「chatwork_bot_debug」と入力することで動作確認できるようにしました

### 開発時注意点
Google Apps Scriptは修正した後に保存するだけでは修正が反映されません  
次を参考にして修正を反映する必要があります  
<a href="https://qiita.com/YutakaArai/items/dcb14c94de1dde330fbd" target="_blank">https://qiita.com/YutakaArai/items/dcb14c94de1dde330fbd</a>

### 使用する技術
[Google Apps Script](https://developers.google.com/apps-script/)

### 参考情報
[チャットワークWebhookを使ってメッセージ送信をトリガーにGASを起動させる方法](https://tonari-it.com/gas-chatwork-webhook-message/#toc1)
