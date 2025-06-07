
import React, {useState} from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {  faEnvelope, faUnlockAlt, faMobileAlt, faKey } from "@fortawesome/free-solid-svg-icons";
import { Col, Row, Form, Card, Button,  Container, InputGroup} from '@themesberg/react-bootstrap';
import { Link } from 'react-router-dom';
import axios from "axios"
import {useHistory} from "react-router-dom"
import { Routes } from "../routes";
import { useChat } from "../api/context";

export default () => {
  let history = useHistory();

  const instance = axios.create({baseURL:'http://localhost:5000'});
  const {memberData, setMemberData} = useChat();
  const {isPhoneVerified, setIsPhoneVerified} = useChat();

const handleChange = (event) => {
  setMemberData({
      ...memberData,
      [event.target.name]: event.target.value
  })
};
const onNext = async(event) => {
  event.preventDefault();
  // const { account, password, password2, username, email } = memberData;
  if (!memberData.account || !memberData.password || !memberData.password2 || !memberData.username || !memberData.email || !memberData.password) {
    alert("尚有欄位未填");
    return;
  }
  else if(memberData.password !== memberData.password2){
    alert('密碼不一致')
    setMemberData({
      password: "",
      password2:"",
    });
  }
  else if (!isPhoneVerified) {
    alert("請先完成手機驗證");
    return;
  }
  else{
    history.push("/examples/passkey")
  }
  
}

const handleSendVerificationCode = async () => {
  const phone = memberData.phonenumber;

  const phoneRegex = /^09\d{8}$/;  // 手機格式驗證（台灣 09xxxxxxxx）
  if (!phoneRegex.test(phone)) {
    alert("請輸入正確的手機號碼格式（例如：0912345678）");
    return;
  }

  try {
    const response = await instance.post('api/avm/users/send_verification_code', { phone }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    console.log(response)
    if (response.data.success) {
      alert("驗證碼已發送至您的手機！");
    } else {
      alert(response.data.message);
    }
  } catch (error) {
    console.error("發送驗證碼錯誤：", error);
    alert("發送驗證碼時發生錯誤，請稍後再試");
  }
};

const handleCheckVerificationCode = async () => {
  const payload = {
    phone: memberData.phonenumber,
    code: memberData.verificationCode
  };
  console.log(payload)
   if (!memberData.verificationCode) {
    alert("請輸入六位驗證碼");
    return;
  }
  try {
    const response = await instance.post('api/avm/users/check_verification_code', payload , {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    

    if (response.data.success) {
      alert("驗證成功！");
      setMemberData(prev => ({
        ...prev,
        phone: response.data.phone
      }));
      setTimeout(() => setIsPhoneVerified(true), 500); // 可設定一個 state 表示已驗證成功
    } else {
      alert("驗證失敗：" + response.data.message);
    }
  } catch (error) {
    console.error("驗證碼檢查錯誤：", error);
    alert("驗證過程發生錯誤，請稍後再試");
  }
};

  return (
    <main>
      <section className="d-flex align-items-center my-5 mt-lg-6 mb-lg-5">
        <Container>
          <Row className="justify-content-center form-bg-image" >
            <Col xs={12} className="d-flex align-items-center justify-content-center">
              <div className="mb-4 mb-lg-0 bg-white shadow-soft border rounded border-light p-4 p-lg-5 w-100 fmxw-500">
                <div className="text-center text-md-center mb-4 mt-md-0">
                  <h3 className="mb-0">註冊新帳號</h3>
                </div>
                <Form className="mt-4" >                   
                  <Form.Group id="email" className="mb-4">
                    <Form.Label>帳號名稱</Form.Label>
                    <InputGroup>
                      <InputGroup.Text>
                        <FontAwesomeIcon icon={faEnvelope}  />
                      </InputGroup.Text>
                      <Form.Control required type="email" placeholder="" name="account" value={memberData.account} onChange={handleChange}/>
                    </InputGroup>
                  </Form.Group>
                  <Form.Group id="confirmPassword" className="mb-4">
                    <Form.Label>密碼 ( 需大於六位元 )
                    </Form.Label>
                    <InputGroup>
                      <InputGroup.Text>
                        <FontAwesomeIcon icon={faUnlockAlt} />
                      </InputGroup.Text>
                      <Form.Control required type="password" placeholder="" name = "password" value={memberData.password} onChange={handleChange}/>
                    </InputGroup>
                  </Form.Group>
                  <Form.Group id="confirmPassword" className="mb-4">
                    <Form.Label>確認密碼</Form.Label>
                    <InputGroup>
                      <InputGroup.Text>
                        <FontAwesomeIcon icon={faUnlockAlt} />
                      </InputGroup.Text>
                      <Form.Control required type="password" placeholder=""  name = "password2" value={memberData.password2} onChange={handleChange}/>
                    </InputGroup>
                  </Form.Group>
                  <Form.Group id="email" className="mb-4">
                      <Form.Label>姓名</Form.Label>
                      <InputGroup>
                        <InputGroup.Text>
                          <FontAwesomeIcon icon={faEnvelope} />
                        </InputGroup.Text>
                        <Form.Control autoFocus required type="email" placeholder="" name="username" value={memberData.username} onChange={handleChange} />
                      </InputGroup>
                    </Form.Group>
                  <Form.Group id="email" className="mb-4">
                    <Form.Label>Email</Form.Label>
                    <InputGroup>
                      <InputGroup.Text>
                        <FontAwesomeIcon icon={faUnlockAlt} />
                      </InputGroup.Text>
                      <Form.Control  autoFocus required type="email" placeholder="" name="email" value={memberData.email} onChange={handleChange}/>
                    </InputGroup>
                  </Form.Group>
                  <Form.Group id="phone" className="mb-4">
                    <Form.Label>手機號碼 (格式 : 09xxxxxxxx)</Form.Label>
                    <InputGroup>
                      <InputGroup.Text>
                        <FontAwesomeIcon icon={faMobileAlt} />
                      </InputGroup.Text>
                      <Form.Control autoFocus required type="tel" name="phonenumber" value={memberData.phonenumber} onChange={handleChange}/>
                      <Button variant="outline-primary" onClick={handleSendVerificationCode} style={{ whiteSpace: "nowrap" }}>
                        傳送驗證碼
                      </Button>
                    </InputGroup>
                  </Form.Group>
                  <Form.Group id="verificationCode" className="mb-4">
                    <Form.Label>驗證碼</Form.Label>
                    <InputGroup>
                      <InputGroup.Text>
                        <FontAwesomeIcon icon={faKey} />
                      </InputGroup.Text>
                      <Form.Control
                        required
                        type="text"
                        placeholder="請輸入驗證碼"
                        name="verificationCode"
                        value={memberData.verificationCode}
                        onChange={handleChange}
                      />
                      {isPhoneVerified ? (
                        <Button variant="success" disabled>
                          已驗證
                        </Button>
                      ) : (
                        <Button variant="outline-primary" onClick={handleCheckVerificationCode}>
                          驗證
                        </Button>
                      )}
                    </InputGroup>
                  </Form.Group>
                  {/* <Button variant="primary" type="submit" className="w-100"onClick={handleSubmit}> */}
                  <Button variant="primary" type="submit" className="w-100"onClick={onNext}>
                    下一步
                  </Button>
                </Form>
                <div className="d-flex justify-content-center align-items-center mt-4">
                  <span className="fw-normal">
                    您已經有帳號?
                    <Card.Link as={Link} to={Routes.Signin.path} className="fw-bold">
                      {` 按此登入 `}
                    </Card.Link>
                  </span>
                </div>
              </div>
            </Col>
          </Row>
        </Container>
      </section>
    </main>
  );
};
