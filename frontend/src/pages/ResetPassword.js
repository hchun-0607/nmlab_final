
import React, {useState} from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAngleLeft, faEnvelope, faUnlockAlt } from "@fortawesome/free-solid-svg-icons";
import { Col, Row, Form, Card, Button, Container, InputGroup } from '@themesberg/react-bootstrap';
import { Link } from 'react-router-dom';
import {useHistory} from "react-router-dom"
import { Routes } from "../routes";
import axios from 'axios'


export default () => {
  //this member data is different from the memberdata of usechat
  const [memberData, setMemberData] = useState({
    Account: "",
    Password: "",
    Password2: "",
  });
  const instance = axios.create({baseURL:'http://localhost:5000/api/avm/users'});
  let history = useHistory();

  
  const handleChange = (event) => {
    setMemberData({
        ...memberData,
        [event.target.name]: event.target.value
    })
  };
  const onBack = () => {
    history.push("/examples/Signin")
  }
  
  
  const handleSubmit = async(event, onSave) => {
    event.preventDefault();
    console.log(memberData);
    // onSave(memberData);
    if (!memberData.Account || !memberData.Password || !memberData.Password2) {
      alert("尚有欄位未填");
      return;
    }
    else if(memberData.Password !== memberData.Password2){
      alert('新密碼不一致')
      setMemberData({
        Password: "",
        Password2:"",
      });
      return
    }
    else{
      const response = await instance.post('/reset_password', memberData, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      console.log(response.data)
      if(response.data.success){
        alert(response.data.message)
        history.push("/examples/Signin")
      }
      else{
        alert(response.data.message)
        setMemberData({
          Accoount:"",
          Password: "",
          Password2:"",
        });
      }

    }
    
    
  };

  return (
    <main>
      <section className="bg-soft d-flex align-items-center my-5 mt-lg-6 mb-lg-5">
        <Container>
          <Row className="justify-content-center">
            <Col xs={12} className="d-flex align-items-center justify-content-center">
              <div className="bg-white shadow-soft border rounded border-light p-4 p-lg-5 w-100 fmxw-500">
                 <div className="text-center text-md-center mb-4 mt-md-0">
                  <h3 className="mb-0">重設密碼</h3>
                </div>
                <Form>
                  <Form.Group id="email" className="mb-4">
                    <Form.Label>您的帳號</Form.Label>
                    <InputGroup>
                      <InputGroup.Text>
                        <FontAwesomeIcon icon={faEnvelope} />
                      </InputGroup.Text>
                      <Form.Control autoFocus required type="email" placeholder="" name="Account" value={memberData.Account} onChange={handleChange}/>
                    </InputGroup>
                  </Form.Group>
                  <Form.Group id="confirmPassword" className="mb-4">
                    <Form.Label>您的新密碼 ( 需大於六位元 )</Form.Label>
                    <InputGroup>
                      <InputGroup.Text>
                        <FontAwesomeIcon icon={faUnlockAlt} />
                      </InputGroup.Text>
                      <Form.Control required type="password" placeholder="" name="Password" value={memberData.Password} onChange={handleChange} />
                    </InputGroup>
                  </Form.Group>
                  <Form.Group id="confirmPassword" className="mb-4">
                    <Form.Label>確認新密碼</Form.Label>
                    <InputGroup>
                      <InputGroup.Text>
                        <FontAwesomeIcon icon={faUnlockAlt} />
                      </InputGroup.Text>
                      <Form.Control required type="password" placeholder=""name="Password2" value={memberData.Password2} onChange={handleChange} />
                    </InputGroup>
                  </Form.Group>
                  <Row>
                    <Col>
                      <Button variant="primary" onClick={onBack} className="w-100">回到登入</Button>
                    </Col>
                    <Col>
                       <Button variant="primary" type="submit" className="w-100" onClick={handleSubmit} >
                        重設密碼
                      </Button>
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
