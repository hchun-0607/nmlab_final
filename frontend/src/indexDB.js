const plaintext = 'mySuperSecretPasskey';
const password = 'encryptionPassword'; // 這要從安全來源取得，例如登入密碼

encryptData(plaintext, password).then(encrypted => {
  return saveToIndexedDB(encrypted);
}).then(() => {
  console.log('Encrypted data saved to IndexedDB');
});

function saveToIndexedDB(data) { //儲存到 IndexedDB
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('SecretDB', 1);

    request.onupgradeneeded = function (event) {
      const db = event.target.result;
      db.createObjectStore('secrets', { keyPath: 'id' });
    };

    request.onsuccess = function (event) {
      const db = event.target.result;
      const transaction = db.transaction('secrets', 'readwrite');
      const store = transaction.objectStore('secrets');
      store.put({ id: 'passkey', ...data });
      transaction.oncomplete = () => resolve(true);
      transaction.onerror = (e) => reject(e);
    };

    request.onerror = (e) => reject(e);
  });
}

async function encryptData(plaintext, password) { //使用 Crypto API 加密資料
  const enc = new TextEncoder();
  const iv = crypto.getRandomValues(new Uint8Array(12));

  const keyMaterial = await crypto.subtle.importKey(
    'raw', enc.encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );

  const key = await crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: iv,
      iterations: 100000,
      hash: 'SHA-256'
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt']
  );

  const ciphertext = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    enc.encode(plaintext)
  );

  return {
    iv: Array.from(iv),
    data: Array.from(new Uint8Array(ciphertext))
  };
}
