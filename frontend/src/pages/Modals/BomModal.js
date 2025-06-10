import React, { useState, useRef } from 'react';
import { Button, Modal, Form, Card, InputGroup } from 'react-bootstrap';
import axios from 'axios';
import moment from 'moment';
import { useChat } from '../../api/context';
import {
  createVerifiablePresentationWithWebAuthn,
  loadAndDecryptVC
} from '../indexDB.js';

function AddBOMModal({ show, onHide }) {
    const instance = axios.create({baseURL:'http://localhost:5000/api/avm/users'});

    const { userData , setSup} = useChat();
    const {reservationData, setReservationData} = useChat();
    const { did, setDid } = useChat();  
    const { credentialId, setCredentialId } = useChat();    
                 // DID
    
    
    const [formData, setFormData] = useState({
        product_id: '',
        product_name: '',
        product_second_id: '',
        use_quantity: '',
        update_user: '',
        update_time: '',
    });
    const [password, setPassword] = useState(['', '', '', '', '', '']);
    const [confirmPassword, setConfirmPassword] = useState(['', '', '', '', '', '']);

    const passwordRefs = useRef([...Array(6)].map(() => React.createRef()));
    const confirmRefs = useRef([...Array(6)].map(() => React.createRef()));

    const renderInputBoxes = (type, values, refs) => {
        return values.map((value, index) => (
            <Form.Control
            key={index}
            type="text"
            maxLength="1"
            value={value}
            ref={refs.current[index]}
            onChange={(e) => handleInputChange(type, index, e)}
            className="mx-1 text-center"
            style={{ width: '5px' }}
            />
        ));
        };
    function base64urlToArrayBuffer(base64url) {
        const base64 = base64url.replace(/-/g, "+").replace(/_/g, "/") + "=".repeat((4 - base64url.length % 4) % 4);
        const binary = atob(base64);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) {
            bytes[i] = binary.charCodeAt(i);
        }
        return bytes.buffer; // 👈 傳回的是 ArrayBuffer
    }

    const handleInputChange = (type, index, e, refs) => {
    const newValue = e.target.value;
    if (!/^[0-9]?$/.test(newValue)) return; // 限制為數字
    const setter = type === 'password' ? setPassword : setConfirmPassword;
    const values = type === 'password' ? [...password] : [...confirmPassword];
    values[index] = newValue;
    setter(values);

    // 自動跳到下一格
    if (newValue && index < 5) {
        refs = type === 'password' ? passwordRefs : confirmRefs;
        refs.current[index + 1].current.focus();
    }
    };
    // const handleInputChange = (e) => {
    //     const { name, value } = e.target;
    //     setFormData({
    //         ...formData,
    //         [name]: value,
    //     });
    // };

    const handleSubmit = async (e) => {
        e.preventDefault();



        try {

            console.log(userData)
            const userPasskey = password.join("");
            const credIdBuffer = base64urlToArrayBuffer(userData.CredDid);
            console.log("credentialId:", credIdBuffer);
            console.log("Is ArrayBuffer:", credIdBuffer instanceof ArrayBuffer);
            console.log("Is Uint8Array:", credIdBuffer instanceof Uint8Array);
            console.log("Converted id:", credIdBuffer instanceof ArrayBuffer ? credIdBuffer : credIdBuffer.buffer);
            console.log("✅ credIdBuffer instanceof ArrayBuffer:", credIdBuffer instanceof ArrayBuffer);
            const vc = await loadAndDecryptVC(userData.Did, userPasskey);
            console.log("✅ 解密後 VC:", vc);
            
            const vp = await createVerifiablePresentationWithWebAuthn(vc, credIdBuffer, userData.Did);
            setReservationData(prev => ({
                ...prev,
                vp: vp 
            }))

            // 5. 傳送到後端
             console.log(reservationData)
            const response = await instance.post('/verify_presentation', reservationData, {
            headers: {
                'Content-Type': 'application/json'
            }
            });
            
             if (response.data.success) {
            alert("訂位成功，請至訂位資訊查看");
            onHide();
            setReservationData({
                    restaurant_id: "",
                    restaurant_name: "",
                    date:"",
                    time:"",
                    people:"",
                    reserver_name:'',
                    reserver_account:'',
                    reserver_adress:'',
                    reserver_phone:'',
                    reserver_email:'',
                    VP:'',//VC、DID
                    wallet_address:'',
                    deposit:'',
                });
            } else {
            alert(response.data.message);
            }
 
        } catch (err) {
               console.error("❌ 提交失敗：", err.name, err.message);
            alert(`提交失敗：${err.name} - ${err.message}`);
            console.log(reservationData)

        }
        
        };


    return (
        <Modal show={show} onHide={onHide} centered>
            {/* <Modal.Header closeButton>
                <Modal.Title className="w-100 text-center">輸入6位訂位金鑰</Modal.Title>
            </Modal.Header> */}
            <Modal.Body>
                <Modal.Title className="w-100 text-center">輸入6位訂位金鑰</Modal.Title>
                <Form>
                <Form.Group>
                    <InputGroup className="mb-5 mt-5">
                    {renderInputBoxes('password', password, passwordRefs)}
                    </InputGroup>
                </Form.Group>
                
                </Form>
            </Modal.Body>
            <Modal.Footer className="d-flex justify-content-center">
                <Button variant="secondary" onClick={onHide}>
                取消
                </Button>
                <Button variant="primary" onClick={handleSubmit}>
                送出訂位
                </Button>
            </Modal.Footer>
            </Modal>
    );
}

export default AddBOMModal;


