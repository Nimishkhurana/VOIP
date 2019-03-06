import JSEncrypt from 'jsencrypt';
import crypto from 'crypto';

let encrypt =  (content, publicKey) => {
  let crypt = new JSEncrypt({default_key_size: 512});
  crypt.setPublicKey(publicKey)
  return crypt.encrypt(content)
}
let decrypt =  (content,privateKey) => {
  let crypt = new JSEncrypt({default_key_size: 512});
  crypt.setPrivateKey(privateKey);
  return crypt.decrypt(content);
}

let encryptAES = (text,secret)=>{
  let cipher = crypto.createCipher('aes-256-ctr',secret)
  let crypted = cipher.update(text,'utf8','hex')
  crypted += cipher.final('hex');
  return crypted;
}


let decryptAES = (text,secret) => {
  let decipher = crypto.createDecipher('aes-256-ctr',secret)
  let dec = decipher.update(text,'hex','utf8')
  dec += decipher.final('utf8');
  return dec;
}

let b64toBlob = (b64Data, contentType, sliceSize)=> {
  contentType = contentType || '';
  sliceSize = sliceSize || 512;
  let byteCharacters = atob(b64Data);
  let byteArrays = [];
  for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
    let slice = byteCharacters.slice(offset, offset + sliceSize);

    let byteNumbers = new Array(slice.length);
    for (let i = 0; i < slice.length; i++) {
      byteNumbers[i] = slice.charCodeAt(i);
    }
    let byteArray = new Uint8Array(byteNumbers);
    byteArrays.push(byteArray);
  }
  let blob = new Blob(byteArrays, {type: contentType});
  return blob;
}

let blobToBase64 = (blob, callback)=>{
  let reader = new FileReader();
  reader.onload = function() {
      let dataUrl = reader.result;
      let base64 = dataUrl.split(',')[1];
      callback(base64);
  };
  reader.readAsDataURL(blob);
}

let randomString = (len = 10)=>{
  return crypto.randomBytes(len).toString('hex');
}

let obj = {
  blobToBase64: blobToBase64,
  b64toBlob: b64toBlob,
  decryptAES: decryptAES,
  encryptAES: encryptAES,
  decrypt: decrypt,
  encrypt: encrypt,
  randomString:randomString
}


export default obj
