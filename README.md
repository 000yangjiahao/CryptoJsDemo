### 使用的模式是CBC 填充模式为Pkcs7 如果需要上传文件解密请使用对应模式和密钥
```javascript
var key = '30980f98296b77f00a55f3c92b35322d898ae2ffcdb906de40336d2cf3d556a0';   //密钥
key = CryptoJS.enc.Hex.parse(key);//转换成128位
const iv = CryptoJS.enc.Hex.parse('e5889166bb98ba01e1a6bc9b32dbf3e6');
```
