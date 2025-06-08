
import React, {useState, useRef, useEffect} from "react";
import { Col, Row, Form, Card, Button, Container, InputGroup } from '@themesberg/react-bootstrap';
import axios from 'axios'
import {useHistory} from "react-router-dom"
import { useChat } from "../api/context";
import {
  encryptVCWithPasskey,
  saveEncryptedVCToIndexedDB,
  loadAndDecryptVC
} from './indexDB.js';

export default () => {

  const instance = axios.create({baseURL:'http://localhost:5000/api/avm/users'});
  
  
  const {memberData, setMemberData} = useChat();

  let history = useHistory();

  const [password, setPassword] = useState(Array(6).fill(''));
  const [confirmPassword, setConfirmPassword] = useState(Array(6).fill(''));
  const passwordRefs = useRef([]);
  const confirmRefs = useRef([]);
  const { did, setDid } = useChat();               // DID
  const { vc, setVc } = useChat(); 

  const onBack = () => {
    history.push("/examples/sign-up")
  }
  const handleChange = (index, value, type) => {
    const newValue = value.replace(/[^a-zA-Z0-9]/g, '').slice(0, 1);
    if (type === 'password') {
      const updated = [...password];
      updated[index] = newValue;
      setPassword(updated);
      if (newValue && index < 5) passwordRefs.current[index + 1].focus();
    } else {
      const updated = [...confirmPassword];
      updated[index] = newValue;
      setConfirmPassword(updated);
      if (newValue && index < 5) confirmRefs.current[index + 1].focus();
    }
  };

function arraysEqual(a, b) {
  if (a.length !== b.length) return false;
  return a.every((val, index) => val === b[index]);
}

const renderInputBoxes = (type, values, refs) =>
    values.map((char, idx) => (
      <Form.Control
        key={idx}
        type=""
        value={char}
        onChange={(e) => handleChange(idx, e.target.value, type)}
        ref={(el) => (refs.current[idx] = el)}
        style={{ width: '40px', marginRight: '10px', textAlign: 'center', fontSize: '1.25rem' }}
        maxLength={1}
      />
    ));

  const handleSubmit = async(event) => {
  event.preventDefault();
  if(!arraysEqual(password, confirmPassword)){
    alert('訂位金鑰不一致')
    setPassword(Array(6).fill(''))
    setConfirmPassword(Array(6).fill(''))
    return;
  }
  
  

  const requiredFields = ["account", "password", "username", "email", "passkey"];
  const isAllFilled = requiredFields.every(
    (field) => memberData[field] && memberData[field].trim() !== ""
  );
  if(!isAllFilled){
    alert("尚有欄位未填");
    return;
  }
  else{
    const response = await instance.post('/add_user', memberData, {
    headers: {
      'Content-Type': 'application/json'
    }
    });

    console.log(response)
    const userPasskey = password.join(""); // 將 passkey 字串化

  if (!vc || !did || !memberData?.account) {
    console.warn("缺少 VC、DID 或 account，略過加解密流程");
    return;
  }
 
  encryptVCWithPasskey(vc, userPasskey)
    .then(encrypted => {
      return saveEncryptedVCToIndexedDB({
        userDID: did,
        userAccount: memberData.account,
        encryptedVC: encrypted.data,
        iv: encrypted.iv
      });
    })
    .then(() => {
      console.log("Encrypted VC saved to IndexedDB.");

      // 解密 VC 並更新 state
      return loadAndDecryptVC(did, userPasskey);
    })
    .then(decryptedVC => {
      console.log("Decrypted VC:", decryptedVC);
      setVc(decryptedVC);
    })
    .catch(err => {
      console.error("加密或解密 VC 時發生錯誤:", err);
    });

    
    if(response.data.message === '使用者新增成功'){
      alert('使用者新增成功')
      history.push("/example/Signin")
      
    }
    else{
      alert("註冊失敗 : "+ response.data.message)
      setMemberData(prev => Object.fromEntries(Object.keys(prev).map(key => [key, ""])));
    }

  }
  
};
useEffect(() => {
   setMemberData(prev => ({
    ...prev,
    passkey: password.join("")  // 確保是字串，不是 array
  }));
  
}, [password]);

  return (
    <main>
      <section className="d-flex align-items-center my-5 mt-lg-6 mb-lg-5">
        <Container>
          <Row className="justify-content-center form-bg-image" >
            <Col xs={12} className="d-flex align-items-center justify-content-center">
              <div className="bg-white shadow-soft border rounded border-light p-4 p-lg-5 w-100 fmxw-500">
                <div className="text-center text-md-center mb-4 mt-md-0">
                  <h3 className="mb-0">訂位金鑰設定</h3>
                </div>
                <Form className="mt-4">
                  <Form.Label>請輸入6碼訂位金鑰</Form.Label>
                  <InputGroup className="mb-3">
                    {renderInputBoxes('password', password, passwordRefs)}
                  </InputGroup>
                  <Form.Label>再次確認訂位金鑰</Form.Label>
                  <InputGroup className="mb-5">
                    {renderInputBoxes('confirm', confirmPassword, confirmRefs)}
                  </InputGroup>
                  <Row>
                    <Col>
                      <Button variant="primary" onClick={onBack} className="w-100">上一步</Button>
                    </Col>
                    <Col>
                      <Button variant="primary" onClick={handleSubmit} className="w-100">完成註冊</Button>
                      {/* <Button variant="primary" className="w-100">完成註冊</Button> */}
                    </Col>
                  </Row>
                </Form>
              </div>
            </Col>
          </Row>
        </Container>
      </section>
    </main>
  );
};
