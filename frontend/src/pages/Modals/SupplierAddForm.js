import React, { useState } from "react";
import { Modal, Button, Form } from '@themesberg/react-bootstrap'
import axios from "axios";
import moment from "moment";
import { useChat } from "../../api/context";



const SupplierFormModal = ({ show, onClose }) => {
  const instance = axios.create({baseURL:'http://localhost:5000/api/avm'});
  const {userData, setSup} = useChat();
  const [supplierData, setSupplierData] = useState({
    supplier_name: "",
    supplier_num: "",
    update_time : "",
    update_user :userData.Username,
     // Updated field name to "供應商代碼"
    // Add other fields as needed
  });

  const handleChange = (e) => {
    console.log(e.target)
    const { name, value } = e.target;
    setSupplierData({
      ...supplierData,
      [name]: value,
    });
  };

  const handleSubmit = async(e) => {
    e.preventDefault();
    if(supplierData.supplier_name === ''){
      alert('尚未輸入供應商名稱')
    }
    else{
      if(supplierData.supplier_num === ''){
        alert('尚未輸入供應商代碼')
      }
      else{
        supplierData.update_time = moment(new Date()).format('YYYY-MM-DD HH:mm:ss');
        supplierData.update_user = userData.Username;

        const response = await instance.post('/add_supplier', {
          ID:JSON.stringify(supplierData)
        })

        alert(response.data)
        setSupplierData({
          supplier_name: "",
          supplier_num: "",
          update_time:"",
          update_user: "",
        })
        if(response.data === "供應商新增成功"){
            setSup("add_sup")
            onClose();
        }
      }
    };
  }

  return (
    <Modal show={show} onHide={onClose}>
      <Modal.Header closeButton>
        <Modal.Title>新增供應商</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit}>
          <Form.Group controlId="supplierName">
            <Form.Label>供應商名稱</Form.Label>
            <Form.Control
              type="text"
              name="supplier_name"
              value={supplierData.supplier_name}
              onChange={handleChange}
              // required
            />
          </Form.Group>
          <Form.Group controlId="supplierCode">
            <Form.Label>供應商代碼</Form.Label>
            <Form.Control
              type="text"
              name="supplier_num"
              value={supplierData.supplier_num}
              onChange={handleChange}
              // required
            />
          </Form.Group>
          {/* Add other input fields for supplier details */}
          <Modal.Footer>
            <Button variant="secondary" onClick={onClose}>
              取消
            </Button>
            <Button type="submit" variant="primary">
              儲存
            </Button>
          </Modal.Footer>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default SupplierFormModal;
