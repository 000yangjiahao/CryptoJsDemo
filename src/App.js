import React, { useState } from 'react'
import CryptoJS from 'crypto-js';
import { Tabs } from 'antd'
import StringTab from './StringTab'
import ImageTab from './ImageTab';
import FileTab from './FileTab';

function App() {
  const [activeKey, setActiveKey] = useState('1');

  //var key = '30980f98296b77f00a55f3c92b35322d898ae2ffcdb906de40336d2cf3d556a0';
  var key = '30980f98296b77f00a55f3c92b35322d898ae2ffcdb906de40336d2cf3d556a0';   //密钥
  key = CryptoJS.enc.Hex.parse(key);//转换成128位

  // var randomBits = CryptoJS.lib.WordArray.random(256 - key.sigBytes);

  // // 将密钥和随机数连接在一起
  // key= CryptoJS.lib.WordArray.create().concat(key).concat(randomBits);

  const iv = CryptoJS.enc.Hex.parse('e5889166bb98ba01e1a6bc9b32dbf3e6');

  const items = [
    {key: '1',label: '字符串',children: <StringTab cryptoKey={key} iv={iv} />,},
    { key: '2',label: '图片',children: <ImageTab cryptoKey={key} iv={iv} />,},
    {key: '3',label: '文件',children: <FileTab cryptoKey={key} iv={iv} />,},
  ];

  const onTabsChange = (key) => {
    setActiveKey(key)
  }

  return (
    <div style={{ backgroundColor: '#fff', height: '100vh', width: '100vw', padding: 30 }}>
      <Tabs activeKey={activeKey} items={items} onChange={onTabsChange} />
    </div>
  )
}

export default App