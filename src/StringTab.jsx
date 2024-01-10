import { Button, Progress, Input } from "antd";
import React, { useState } from 'react'
import CryptoJS from 'crypto-js';

export default function StringTab(props) {

    const [inputValue, setInputValue] = useState('');
    const [outputValue, setOutputValue] = useState('');
    const [progressPercent, setProgressPercent] = useState(0);
    const [processTime, setProcessTime] = useState(0);
    const { TextArea } = Input;

    const handleEncrypt = () => {
        setProgressPercent(0);
        const startTime = Date.now();
        const encrypted = CryptoJS.AES.encrypt(inputValue, props.cryptoKey, { iv: props.iv }).toString();

        const endTime = Date.now();
        const elapsedTime = endTime - startTime;

        setOutputValue(encrypted);
        setProcessTime(elapsedTime);
        setProgressPercent(100);
    };

    const handleDecrypt = () => {
        setProgressPercent(0);
        const startTime = Date.now();
        let decrypted = '';
        let elapsedTime = 0;

        if (inputValue.trim() === '') {
            decrypted = '请输入加密内容再进行解密';
        } else {
            try {
                decrypted = CryptoJS.AES.decrypt(inputValue, props.cryptoKey, { iv: props.iv }).toString(CryptoJS.enc.Utf8);
                if (decrypted.trim() === '') {
                    decrypted = '解密失败，请输入正确的加密内容';
                }
            } catch (error) {
                decrypted = '解密失败，请输入正确的加密内容';
            }
        }
        const endTime = Date.now();
        elapsedTime = endTime - startTime;
        setOutputValue(decrypted);
        setProcessTime(elapsedTime);
        setProgressPercent(100);
    };

    return (
        <div>
            <TextArea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="请输入要加密或解密的内容"
                style={{ width: 1200, minHeight: 250 }}
            />
            <br />
            <Button onClick={handleEncrypt} style={{ marginTop: 10 }}>
                加密
            </Button>
            <Button onClick={handleDecrypt} style={{ marginTop: 10, marginLeft: 10 }}>
                解密
            </Button>
            <br />
            <TextArea
                value={outputValue}
                placeholder="加密或解密后的内容将在这里显示"
                //readOnly
                style={{ width: 1200, minHeight: 250, marginTop: 10 }}
            />
            <Progress percent={progressPercent} status="active" style={{ marginTop: 10 }} />
            <p>处理时间：{processTime} 毫秒</p>
        </div>
    );
}