# Layla Exclusive

固定路徑：`/layla_exclusive/`

這個頁面使用 Web Crypto API 在瀏覽器內解密私人內容。Git 倉庫只保存加密資料；密碼不會以明文或可直接比對的形式寫入檔案。

## 帳號管理

在專案根目錄使用 Node.js 執行：

```powershell
node tools/manage-layla-users.mjs list
node tools/manage-layla-users.mjs verify
node tools/manage-layla-users.mjs add --username layla
node tools/manage-layla-users.mjs change --username mike
node tools/manage-layla-users.mjs remove --username layla
```

指令會互動式要求現有帳號與密碼。新增或改密碼時，也會要求輸入並再次確認新密碼。

## 安全模型

- 使用 PBKDF2-SHA-256（600,000 次）由密碼衍生 AES-256-GCM 金鑰。
- 私人頁面文字與圖片都包在加密內容中。
- 每個帳號各自保存一份加密後的內容金鑰。
- 瀏覽器只在登入成功後於記憶體中解密，不把密碼送到伺服器。
- 頁面不會出現在網站首頁，並設定 `noindex`。

因為是公開靜態網站，攻擊者仍可下載密文進行離線猜密碼。請使用長度足夠、包含不同字元類型且沒有在其他網站使用過的密碼。
