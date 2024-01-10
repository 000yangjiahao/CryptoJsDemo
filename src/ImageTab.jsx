import { useState } from 'react';
import { Button } from 'antd';
import CryptoJS from 'crypto-js';

const ImageTab = (props) => {

    const [inputImage, setInputImage] = useState(null);
    const [outputImage, setOutputImage] = useState(null);
    const [processTime, setProcessTime] = useState(0);
    const [show, setShow] = useState(false)

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

    const handleEncryptImage = () => {
        if (inputImage) {
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
                console.log(encrypted);
                setOutputImage(encrypted);

                const endTime = performance.now();
                const timeElapsed = endTime - startTime;
                setProcessTime(Math.round(timeElapsed));
            };

            img.src = inputImage;
        }
    };

    const handleDecryptImage = () => {
        if (outputImage) {
            const startTime = performance.now();
            const decrypted = CryptoJS.AES.decrypt(outputImage, props.cryptoKey, { iv: props.iv }).toString(CryptoJS.enc.Utf8);
            const img = new Image();
            img.onload = function () {
                setOutputImage(img.src);

                const endTime = performance.now();
                const timeElapsed = endTime - startTime;
                setProcessTime(Math.round(timeElapsed));
            };

            img.src = decrypted;
            setShow(true)
        }
    };

    return (
        <div>
            <input type="file" onChange={handleFileInputChange} />
            <br />
            <Button onClick={handleEncryptImage} style={{ marginTop: 10 }}>
                加密
            </Button>
            <Button onClick={handleDecryptImage} style={{ marginTop: 10, marginLeft: 10 }}>
                解密
            </Button>
            <br />
            {inputImage && (
                <div>
                    <h3>原生</h3>
                    <img src={inputImage} alt="Original" style={{ maxWidth: '100%', maxHeight: '300px', marginTop: 10 }} />
                </div>
            )}
            {outputImage && show && (
                <div>
                    <h3>加密或解密</h3>
                    <img src={outputImage} alt="Encrypted/Decrypted" style={{ maxWidth: '100%', maxHeight: '300px', marginTop: 10 }} />
                </div>
            )}
            <p>处理时间: {processTime} 毫秒</p>
        </div>
    );
};

export default ImageTab;
