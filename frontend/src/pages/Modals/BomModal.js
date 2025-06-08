import React, { useState, useRef } from 'react';
import { Button, Modal, Form, Card, InputGroup } from 'react-bootstrap';
import axios from 'axios';
import moment from 'moment';
import { useChat } from '../../api/context';

function AddBOMModal({ show, onHide }) {
    const instance = axios.create({baseURL:'http://localhost:5000/api/avm/users'});

    const { userData , setSup} = useChat();
    const {reservationData, setReservationData} = useChat();
    
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
       
        console.log(reservationData)
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


