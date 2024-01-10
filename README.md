# cryptoJs介绍


  CryptoJS 是一个 JavaScript 库，用于提供各种加密算法和工具，帮助开发者在前端进行数据加密、解密和安全处理。它支持常见的加密算法，如AES、DES、TripleDES、Rabbit、MD5、SHA-1、SHA-256 等，使开发者能够轻松地在浏览器中执行加密操作。  
  这个库提供了简单易用的 API，允许开发者以简洁的方式进行加密和解密操作。它不仅适用于浏览器环境，也可以在 Node.js 等 JavaScript 运行环境中使用。  
  本demo使用了AES进行加解密测试。  
  [CryptoJS官网Github地址](https://github.com/brix/crypto-js).


## 要注意的地方

在进行AES加密和解密时有以下几点需要额外注意一下：  
前提:AES加密需要一个密钥key，以及向量偏移量iv。  

要确保在加密和解密时使用的Key和Iv是一致的，如果调用 CryptoJS.AES.encrypt 时未传递Iv进来的话，会随机生成一个Iv，这样就会导致解密的时候无法正确的解出来。
最好确保Key是128、192或是256位的，如果Key是字符串类型，在传入加密函数前要先转为二进制类型的数据。  

加密端和解密端在选择AES加密模式和填充模式时可以选择不选，如果选择了要保持一致。

## 具体代码实现  

### App.js  
 我主要是在这里设置了共用的key和iv将他们传入三个组件中
```javascript

  var key = '30980f98296b77f00a55f3c92b35322d898ae2ffcdb906de40336d2cf3d556a0';   //密钥
  key = CryptoJS.enc.Hex.parse(key);//转换成128位

  const iv = CryptoJS.enc.Hex.parse('e5889166bb98ba01e1a6bc9b32dbf3e6');

  const items = [
    {key: '1',label: '字符串',children: <StringTab cryptoKey={key} iv={iv} />,},
    { key: '2',label: '图片',children: <ImageTab cryptoKey={key} iv={iv} />,},
    {key: '3',label: '文件',children: <FileTab cryptoKey={key} iv={iv} />,},
  ];

```

### 对字符串进行加解密  
对字符串进行加解密比较简单，这里没有将他转换成二进制进行，直接调用了官网的两个api
```javascript
//进行加密，inputValue为文本框输入的值，props.cryptoKey，props.iv为对应App.js中的key和iv值
const encrypted = CryptoJS.AES.encrypt(inputValue, props.cryptoKey, { iv: props.iv }).toString();
//进行解密
decrypted = CryptoJS.AES.decrypt(inputValue, props.cryptoKey, { iv: props.iv }).toString(CryptoJS.enc.Utf8);
```


### 对图片进行加解密  
在图片选项中是对图片进行了canvas转换，再进行加解密，这样的好处是解密以后图片可以直接呈现在界面上，在文件选项中如果上传图片也能进行加解密，就是只能提供下载链接了。  
#### 在读取文件时使用readAsDataURL进行base-64进行编码
```javascript
const handleFileInputChange = (event) => {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();

        reader.onload = function (event) {
            setInputImage(event.target.result);
        };

        reader.readAsDataURL(file);
    }
};
```
#### 加密时先转换成canva
```javascript
const handleEncryptImage = () => {
  setShow(false)

  const startTime = performance.now();

  const img = new Image();
  img.onload = function () {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      const imageData = canvas.toDataURL('image/png');
      const encrypted = CryptoJS.AES.encrypt(imageData, props.cryptoKey, { iv: props.iv }).toString();
      //encrypted就是加密后的结果
      console.log(encrypted);
      setOutputImage(encrypted);
  };
  img.src = inputImage;
};
```
#### 对图片进行解密
```javascript
const handleDecryptImage = () => {
    const startTime = performance.now();
    const decrypted = CryptoJS.AES.decrypt(outputImage, props.cryptoKey, { iv: props.iv }).toString(CryptoJS.enc.Utf8);
    const img = new Image();
    img.onload = function () {
        setOutputImage(img.src);
    };

    img.src = decrypted;
};
```
### 对文件进行加解密 
对文件进行加密时比较麻烦，需要在ArrayBuffer，Uint8Array，WordArray进行转换。  
#### 在读取文件时要readAsArrayBuffer将其读成ArrayBuffer
```javascript
const readFileContent = (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (event) => {
            const content = event.target.result;
            resolve(content);
        };
        reader.onerror = (error) => {
            reject(error);
        };
        reader.readAsArrayBuffer(file);
    });
};
```
#### 进行加密的方法 
需要注意的是传入的CryptoJS.AES.encrypt的data需要是WordBuffer类型的数据
```javascript
const AESEncData = (data, key, iv) => { // 这里的data是WordBuffer类型的数据
    const encrypt = CryptoJS.AES.encrypt(data, key, { iv: iv, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7 });
    const arrayBuffer = WordArrayToArrayBuffer(encrypt.ciphertext);
    return arrayBuffer;
}
```
#### 处理加密  
```javascript
const handleEncryptFile = async () => {
    if (inputFile) {
        setShow(false);
        const startTime = performance.now();

        const fileContent = await readFileContent(inputFile);
        const wordBuffer = ArrayBufferToWordArray(fileContent);
        const encData = AESEncData(wordBuffer, props.cryptoKey, props.iv);

        setOutputFile(encData);
    }
};
```
#### ArrayBuffer，WordArray相互转换的方法
```javascript
const WordArrayToArrayBuffer = wordArray => {
    const { words } = wordArray;
    const { sigBytes } = wordArray;
    const u8 = new Uint8Array(sigBytes);
    for (let i = 0; i < sigBytes; i += 1) {
        const byte = (words[i >>> 2] >>> (24 - (i % 4) * 8)) & 0xff;
        u8[i] = byte;
    }
    return u8;
}

const ArrayBufferToWordArray = arrayBuffer => {
    const u8 = new Uint8Array(arrayBuffer, 0, arrayBuffer.byteLength);
    const len = u8.length;
    const words = [];
    for (let i = 0; i < len; i += 1) {
        words[i >>> 2] |= (u8[i] & 0xff) << (24 - (i % 4) * 8);
    }
    return CryptoJS.lib.WordArray.create(words, len);
}
```
#### 进行解密的方法 
同样需要注意的是传入的CryptoJS.AES.decrypt的data需要是WordBuffer类型的数据
```javascript
    const AESDecData = (data, key, iv) => {
        const wordBuffer = ArrayBufferToWordArray(data);
        const decrypt = CryptoJS.AES.decrypt({ ciphertext: wordBuffer }, key, { iv: iv, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7 });
        const arrayBuffer = WordArrayToArrayBuffer(decrypt);

        return arrayBuffer;
    }
```
#### 处理解密  
```javascript
const handleDecryptFile = async () => {
  if (outputFile) {
      const startTime = performance.now();
      const decrypted = AESDecData(outputFile, props.cryptoKey, props.iv);
      setOutputFile(decrypted);
      //因为是前端无法对本地文件直接进行操作，所以选择使用url展示解密完以后的文件
      //为了处理传入的各种不同的文件类型，写了一个getFileMimeType方法来匹配传入的各种的文件类型
      const mimeType = getFileMimeType(inputFile);
      const blob = new Blob([decrypted], { type: mimeType });
      const url = URL.createObjectURL(blob);
      setDownloadURL(url);
  }
};
const getFileMimeType = (file) => {
  const fileNameParts = file.name.split('.');
  const fileExtension = fileNameParts[fileNameParts.length - 1];

  switch (fileExtension) {
      case 'doc':
      case 'docx':
          return 'application/msword';
      case 'pdf':
          return 'application/pdf';
      case 'jpg':
      case 'jpeg':
          return 'image/jpeg';
      case 'txt':
          return 'text/plain';
      case 'zip':
          return 'application/zip';
      case '7z':
          return 'application/x-7z-compressed';
      default:
          return 'application/octet-stream';
  }
};
```
好的至此大致的思路已经介绍完了，特别感谢王飞翔老师和马文娟老师的帮助。
