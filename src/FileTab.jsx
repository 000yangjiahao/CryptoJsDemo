import { useState } from 'react';
import { Button } from 'antd';
import CryptoJS from 'crypto-js';

const FileTab = (props) => {
    const [inputFile, setInputFile] = useState(null);
    const [outputFile, setOutputFile] = useState(null);
    const [downloadURL, setDownloadURL] = useState('');
    const [processTime, setProcessTime] = useState(0);
    const [show, setShow] = useState(false);

    const handleFileInputChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            setInputFile(file);
        }
    };

    const handleEncryptFile = async () => {
        if (inputFile) {
            setShow(false);
            const startTime = performance.now();

            const fileContent = await readFileContent(inputFile);
            const wordBuffer = ArrayBufferToWordArray(fileContent);
            const encData = AESEncData(wordBuffer, props.cryptoKey, props.iv);

            setOutputFile(encData);

            const endTime = performance.now();
            const timeElapsed = endTime - startTime;
            setProcessTime(Math.round(timeElapsed));
        }
    };

    const handleDecryptFile = async () => {
        if (outputFile) {
            const startTime = performance.now();
            const decrypted = AESDecData(outputFile, props.cryptoKey, props.iv);
            setOutputFile(decrypted);
            setShow(true);
            const mimeType = getFileMimeType(inputFile);
            const blob = new Blob([decrypted], { type: mimeType });
            const url = URL.createObjectURL(blob);
            setDownloadURL(url);
            const endTime = performance.now();
            const timeElapsed = endTime - startTime;
            setProcessTime(Math.round(timeElapsed));
        }
    };

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

    const AESEncData = (data, key, iv) => { // 这里的data是WordBuffer类型的数据
        const encrypt = CryptoJS.AES.encrypt(data, key, { iv: iv, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7 });
        const arrayBuffer = WordArrayToArrayBuffer(encrypt.ciphertext);
        return arrayBuffer;
    }

    const AESDecData = (data, key, iv) => { // 这里的data是WordBuffer类型的数据
        const wordBuffer = ArrayBufferToWordArray(data);
        const decrypt = CryptoJS.AES.decrypt({ ciphertext: wordBuffer }, key, { iv: iv, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7 });
        const arrayBuffer = WordArrayToArrayBuffer(decrypt);

        return arrayBuffer;
    }

    const getFileMimeType = (file) => {
        // Extract file extension
        const fileNameParts = file.name.split('.');
        const fileExtension = fileNameParts[fileNameParts.length - 1];

        // Map file extensions to MIME types as needed
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
                return 'application/octet-stream'; // Fallback MIME type
        }
    };

    return (
        <div>
            <input type="file" onChange={handleFileInputChange} />
            <br />
            <Button onClick={handleEncryptFile} style={{ marginTop: 10 }}>
                加密
            </Button>
            <Button onClick={handleDecryptFile} style={{ marginTop: 10, marginLeft: 10 }}>
                解密
            </Button>
            <br />
            <p>处理时间: {processTime} 毫秒</p>
            {show && outputFile && (
                <div>
                    <h3>加密或解密后</h3>
                    {/* <p>{outputFile}</p> */}
                    {downloadURL && (
                        <a href={downloadURL} download="decrypted_file">
                            下载解密后的文件
                        </a>
                    )}
                </div>
            )}
        </div>
    );
};

export default FileTab;
