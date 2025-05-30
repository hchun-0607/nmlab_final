import React, { useState } from "react";
import { Modal, Button, Form } from '@themesberg/react-bootstrap';
import axios from "axios";
import { useChat } from "../../api/context";


const RawMaterialFormModal = ({ show, onClose, onSave }) => {
  const instance = axios.create({baseURL:'http://localhost:5000/api/avm'});
  const {mat, setMat} = useChat();

  const [rawMaterialData, setRawMaterialData] = useState({
    productCode: "",
    productName: "",
    date: "",
    openingQuantity: "",
    openingUnit: "",
    openingUnitPrice: "",
    openingCost: "",
    // Add other fields as needed
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setRawMaterialData({
      ...rawMaterialData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {

  e.preventDefault();
  console.log(rawMaterialData.date)

  if(rawMaterialData.productCode === ''){
    alert('尚未輸入期初原物料代碼')
  }
  else{
    if(rawMaterialData.productName === ''){
      alert('尚未輸入期初原物料名稱')
    }
    else if(rawMaterialData.date === ''){
      alert('尚未輸入期初原物料日期')
    }
    else if(rawMaterialData.openingQuantity === ''){
      alert('尚未輸入期初原物料數量')
    }
    else if(rawMaterialData.openingUnit === ''){
      alert('尚未輸入期初原物料單位')
    }
    else if(rawMaterialData.openingUnitPrice === ''){
      alert('尚未輸入期初原物料單價')
    }
    else{
      rawMaterialData.openingCost = `${Number(rawMaterialData.openingQuantity)*Number(rawMaterialData.openingUnitPrice)}`

      const response = await instance.post('/add_inventory', {
        ID:JSON.stringify(rawMaterialData)
      })
      console.log(response.data)

      alert(response.data)
      setRawMaterialData({
        productCode: "",
        productName: "",
        date: "",
        openingQuantity: "",
        openingUnit: "",
        openingUnitPrice: "",
        openingCost: "",
      })
      
      if(response.data === "期初原物料新增成功"){
          setMat(response.data)
          onClose();
      }
    }
  };
  };

  return (
    <Modal show={show} onHide={onClose}>
      <Modal.Header closeButton>
        <Modal.Title>新增原物料</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit}>
          <Form.Group controlId="productCode">
            <Form.Label>原物料代碼</Form.Label>
            <Form.Control
              type="text"
              name="productCode"
              value={rawMaterialData.productCode}
              onChange={handleChange}
              // required
            />
          </Form.Group>
          <Form.Group controlId="productName">
            <Form.Label>原物料名稱</Form.Label>
            <Form.Control
              type="text"
              name="productName"
              value={rawMaterialData.productName}
              onChange={handleChange}
              // required
            />
          </Form.Group>
          <Form.Group controlId="date">
            <Form.Label>日期</Form.Label>
            <Form.Control
              type="date"
              name="date"
              value={rawMaterialData.date}
              onChange={handleChange}
              // required
            />
          </Form.Group>
          <Form.Group controlId="openingQuantity">
            <Form.Label>期初數量</Form.Label>
            <Form.Control
              type="number"
              name="openingQuantity"
              value={rawMaterialData.openingQuantity}
              onChange={handleChange}
              // required
            />
          </Form.Group>
          <Form.Group controlId="openingUnit">
            <Form.Label>期初單位</Form.Label>
            <Form.Control
              type="text"
              name="openingUnit"
              value={rawMaterialData.openingUnit}
              onChange={handleChange}
              // required
            />
          </Form.Group>
          <Form.Group controlId="openingUnitPrice">
            <Form.Label>期初單價</Form.Label>
            <Form.Control
              type="number"
              name="openingUnitPrice"
              value={rawMaterialData.openingUnitPrice}
              onChange={handleChange}
              // required
            />
          </Form.Group>
          <br></br>
          <Form.Group controlId="openingQuantity">
                      {((Number(rawMaterialData.openingUnitPrice)>0)&&(Number(rawMaterialData.openingQuantity)>0))?<p style={{fontSize: 18}}><b>總價: {Number(rawMaterialData.openingUnitPrice)*Number(rawMaterialData.openingQuantity)}</b></p>:<p style={{fontSize: 17}}>總價:</p>}
                    </Form.Group>
          <Modal.Footer>
            <Button variant="secondary" onClick={onClose}>
              取消
            </Button>
            <Button type="submit" variant="primary">
              新增
            </Button>
          </Modal.Footer>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default RawMaterialFormModal;
