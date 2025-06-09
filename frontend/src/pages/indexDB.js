import { useChat } from "../api/context";

// const { memberData, setMemberData } = useChat(); // 含 passkey, account
// const { did, setDid } = useChat();               // DID
// const { vc, setVc } = useChat();                 // VC (Verifiable Credential)
// const {memberData, setMemberData} = useChat();

// 執行加密流程
// encryptVCWithPasskey(vc, memberData.passkey).then(encrypted => {
//   return saveEncryptedVCToIndexedDB({
//     userDID: did,
//     userAccount: memberData.account,
//     encryptedVC: encrypted.data,
//     iv: encrypted.iv
//   });
// }).then(() => {
//   console.log("Encrypted VC saved to IndexedDB.");
// });

// loadAndDecryptVC(did, memberData.Passkey)
//   .then(vc => {
//     console.log("Decrypted VC:", vc);
//     setVc(vc); // 可以直接更新 state
//   })
//   .catch(err => {
//     console.error("Failed to load or decrypt VC:", err);
//   });

// ✅ 將 VC 使用 passkey 衍生金鑰加密
export async function encryptVCWithPasskey(vcObject, passkey) {
  const enc = new TextEncoder();
  const iv = crypto.getRandomValues(new Uint8Array(12));

  const keyMaterial = await crypto.subtle.importKey(
    "raw", enc.encode(passkey), // passkey 作為原始 keyMaterial
    { name: "PBKDF2" },
    false,
    ["deriveKey"]
  );

  const key = await crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: iv,
      iterations: 100000,
      hash: "SHA-256"
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt"]
  );

  const vcString = JSON.stringify(vcObject); // 確保是字串
  const ciphertext = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    enc.encode(vcString)
  );

  return {
    iv: Array.from(iv),
    data: Array.from(new Uint8Array(ciphertext))
  };
}

// ✅ 儲存加密後 VC + 使用者資訊到 IndexedDB
export function saveEncryptedVCToIndexedDB({ userDID, userAccount, encryptedVC, iv }) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("SecretDB", 1);

    request.onupgradeneeded = function (event) {
      const db = event.target.result;
      if (!db.objectStoreNames.contains("secrets")) {
        db.createObjectStore("secrets", { keyPath: "id" });
      }
    };

    request.onsuccess = function (event) {
      const db = event.target.result;
      const transaction = db.transaction("secrets", "readwrite");
      const store = transaction.objectStore("secrets");

      store.put({
        id: userDID,                // 使用 user DID 當作索引
        account: userAccount,       // 儲存帳號（可作為 backup lookup）
        encryptedVC,
        iv
      });

      transaction.oncomplete = () => resolve(true);
      transaction.onerror = (e) => reject(e);
    };

    request.onerror = (e) => reject(e);
  });
}

export async function loadAndDecryptVC(did, passkey) {
  const encryptedRecord = await getEncryptedVCFromIndexedDB(did);
  if (!encryptedRecord) throw new Error("No encrypted VC found for this DID.");

  const { encryptedVC, iv } = encryptedRecord;
  const decryptedVC = await decryptVC(encryptedVC, iv, passkey);
  return decryptedVC;
}

// 從 IndexedDB 取出加密資料
function getEncryptedVCFromIndexedDB(did) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("SecretDB", 1);

    request.onsuccess = function (event) {
      const db = event.target.result;
      const transaction = db.transaction("secrets", "readonly");
      const store = transaction.objectStore("secrets");
      const getRequest = store.get(did);

      getRequest.onsuccess = () => {
        resolve(getRequest.result || null);
      };
      getRequest.onerror = (e) => reject(e);
    };

    request.onerror = (e) => reject(e);
  });
}

// 解密 VC 的函數
async function decryptVC(encryptedDataArray, ivArray, passkey) {
  const enc = new TextEncoder();
  const dec = new TextDecoder();

  const keyMaterial = await crypto.subtle.importKey(
    "raw", enc.encode(passkey),
    { name: "PBKDF2" },
    false,
    ["deriveKey"]
  );

  const key = await crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: new Uint8Array(ivArray),
      iterations: 100000,
      hash: "SHA-256"
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["decrypt"]
  );

  const decrypted = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: new Uint8Array(ivArray) },
    key,
    new Uint8Array(encryptedDataArray)
  );

  return JSON.parse(dec.decode(decrypted));
}

export async function createWebAuthnCredential(username) {
  const challenge = crypto.getRandomValues(new Uint8Array(32));
  console.log("user for key : ",username)
  const publicKeyOptions = {
    challenge: challenge.buffer,
    rp: {
      name: "My VC App",
      id: window.location.hostname,
    },
    user: {
      id: new TextEncoder().encode(username),
      name: username,
      displayName: username,
    },
    pubKeyCredParams: [
      { type: "public-key", alg: -7 }, // ES256
      { type: "public-key", alg: -257 }
    ],
    authenticatorSelection: {
      userVerification: "preferred",
    },
    timeout: 60000,
    attestation: "direct",
  };

  const credential = await navigator.credentials.create({
    publicKey: publicKeyOptions,
  });
  console.log("key done")
  return credential;
}

export async function createVerifiablePresentationWithWebAuthn(vc, credentialId, did) {
  try {
    // const challenge = new Uint8Array(32);
    // window.crypto.getRandomValues(challenge);

    // navigator.credentials.get({
    //   publicKey: {
    //     challenge: challenge,
    //     userVerification: "preferred",
    //     timeout: 60000,
    //   }
    // }).then(assertion => {
    //   console.log('認證成功', assertion);
    // }).catch(err => {
    //   console.error('認證失敗', err);
    // });
    //✅ 1. 建立 VP（不含 proof）
    const vp = {
      "@context": ["https://www.w3.org/2018/credentials/v1"],
      type: ["VerifiablePresentation"],
      verifiableCredential: Array.isArray(vc) ? vc : [vc],
      holder: did,
    };

    // ✅ 2. 對 VP JSON 字串做 SHA-256
    const vpString = JSON.stringify(vp);
    const encoder = new TextEncoder();
    const data = encoder.encode(vpString);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const idBuffer = credentialId instanceof ArrayBuffer
      ? credentialId
      : credentialId instanceof Uint8Array
        ? credentialId.buffer
        : undefined;

    if (!idBuffer) {
      throw new Error("❌ credentialId 為 undefined 或格式錯誤");
    }

    // ✅ 3. 呼叫 WebAuthn 取得簽名
    const assertion = await navigator.credentials.get({
      publicKey: {
        challenge: new Uint8Array(hashBuffer),
        // allowCredentials: [{
        //   id: idBuffer,
        //   type: "public-key",
        // }],
        userVerification: "preferred",
        timeout: 60000
      },
    });

    if (!assertion || !assertion.response) {
      throw new Error("WebAuthn assertion 回傳為 null 或格式錯誤");
    }

    // ✅ 4. 擷取 WebAuthn 回傳的資料
    const authResponse = assertion.response;
    const signature = arrayBufferToBase64(authResponse.signature);
    const clientDataJSON = arrayBufferToBase64(authResponse.clientDataJSON);
    const authenticatorData = arrayBufferToBase64(authResponse.authenticatorData);

    // ✅ 5. 組成 proof
    const proof = {
      type: "WebAuthnSignature2023",
      created: new Date().toISOString(),
      verificationMethod: `${did}#key-1`,
      proofPurpose: "authentication",
      challenge: arrayBufferToBase64(hashBuffer),
      signature,
      clientDataJSON,
      authenticatorData,
    };

    // ✅ 6. 加入 proof 成為完整 VP
    vp.proof = proof;

    return vp;

  } catch (err) {
    console.warn("❌ WebAuthn get() 失敗:");
    console.warn("錯誤名稱:", err.name);
    console.warn("錯誤訊息:", err.message);
    if (err.name === "NotAllowedError") {
      alert("操作遭拒：請確認是否完成指紋或臉部驗證");
    } else if (err.name === "OperationError") {
      alert("找不到該 Passkey，請確認是在同一瀏覽器註冊");
    } else {
      alert("未知錯誤：" + err.message);
    }
  }
}


// Helper: ArrayBuffer 轉 Base64
function arrayBufferToBase64(buffer) {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}
