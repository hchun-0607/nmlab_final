
import React, {useState} from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {  faEnvelope, faUnlockAlt } from "@fortawesome/free-solid-svg-icons";
import { Col, Row, Form, Card, Button,  Container, InputGroup} from '@themesberg/react-bootstrap';
import { Link } from 'react-router-dom';
import axios from "axios"
import {useHistory} from "react-router-dom"

import { Routes } from "../routes";






export default () => {
  const [userName, setUserName] = useState("")
  const [password, setPassWord] = useState("")
  const instance = axios.create({baseURL:'http://localhost:5000/api/avm'});
  let history = useHistory();
  const [memberData, setMemberData] = useState({
    username: "",
    account: "",
    email: "",
    password: "",
    password2:"",
});

const handleChange = (event) => {
  setMemberData({
      ...memberData,
      [event.target.name]: event.target.value
  })
};

const handleSubmit = async(event) => {
  event.preventDefault();
  console.log(memberData);
  if(memberData.password !== memberData.password2){
    alert('密碼不一致')
    setMemberData({
      username: "",
      account: "",
      email: "",
      password: "",
      password2:"",
    });
  }
  else{
    const response = await instance.post('/add_user', memberData, {
    headers: {
      'Content-Type': 'application/json'
    }
    });

    console.log(response)
    if(response.data.message === '註冊成功'){
      alert('註冊成功')
      history.push("/examples/Signin")
    }
    else{
      alert("註冊失敗 : "+ response.data.message)
      setMemberData({
        username: "",
        account: "",
        email: "",
        password: "",
        password2:"",
      });
    }

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
                  <Button variant="primary" type="submit" className="w-100"onClick={handleSubmit}>
                    註冊
                  </Button>
                </Form>

                {/* <div className="mt-3 mb-4 text-center">
                  <span className="fw-normal">or</span>
                </div>
                <div className="d-flex justify-content-center my-4">
                  <Button variant="outline-light" className="btn-icon-only btn-pill text-facebook me-2">
                    <FontAwesomeIcon icon={faFacebookF} />
                  </Button>
                  <Button variant="outline-light" className="btn-icon-only btn-pill text-twitter me-2">
                    <FontAwesomeIcon icon={faTwitter} />
                  </Button>
                  <Button variant="outline-light" className="btn-icon-only btn-pil text-dark">
                    <FontAwesomeIcon icon={faGithub} />
                  </Button>
                </div> */}
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
