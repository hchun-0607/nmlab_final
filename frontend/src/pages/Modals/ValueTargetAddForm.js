import React, { useState} from "react";
import { Modal, Button, Form } from '@themesberg/react-bootstrap'
import axios from "axios";
import moment from "moment";
import { useChat } from "../../api/context";



const ValueTargetFormModal = ({ show, type, onClose, onSave}) => {
  const instance = axios.create({baseURL:'http://localhost:5000/api/avm'});

  const [valueTargetData, setValueTargetData] = useState({
    name: "",
    valueTargetCode: "",
    category:"",
    updateTime:"", 
  });
  const {task, setTask} = useChat();


  const handleChange = (e) => {
    const { name, value } = e.target;
    setValueTargetData({
      ...valueTargetData,
      [name]: value,
    });
  };

  const handleSubmit = async(e) => {

  e.preventDefault();

  if(valueTargetData.name === ''){
    alert('尚未輸入價值標的名稱')
  }
  else{
    if(valueTargetData.valueTargetCode === ''){
      alert('尚未輸入價值標的代碼')
    }
    else{
      valueTargetData.category = type;
      valueTargetData.updateTime = moment(new Date()).format('YYYY-MM-DD HH:mm:ss');
      setTask(null) //if continue adding value target of the same category, the window updates
      const response = await instance.post('/add_value_target', {
        ID:JSON.stringify(valueTargetData)
      })

      alert(response.data)
      setValueTargetData({
        name: "",
        valueTargetCode: "",
        category:"",
        updateTime:"", 
      })

      if(response.data === "價值標的新增成功"){
          setTask(valueTargetData.category)
          onClose();
      }
    }
  };

  };

  return (
    <Modal show={show} onHide={onClose}>
      <Modal.Header closeButton>
        <Modal.Title>新增{type === "原料"?"原料":type === "產品"?"產品":type === "顧客"?"顧客":"部門"}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit}>
          <Form.Group controlId="valueTargetName">
            <Form.Label>{type === "原料"?"原料":type === "產品"?"產品":type === "顧客"?"顧客":"部門"}名稱</Form.Label>
            <Form.Control
              type="text"
              name="name"
              value={valueTargetData.name}
              onChange={handleChange}
              required
            />
          </Form.Group>
          <Form.Group controlId="valueTargetCode">
            <Form.Label>{type === "原料"?"原料":type === "產品"?"產品":type === "顧客"?"顧客":"部門"}代碼</Form.Label>
            <Form.Control
              type="text"
              name="valueTargetCode"
              // placeholder ="M"
              placeholder = {type === "原料"?"M":type === "產品"?"P":type === "顧客"?"C":"D"}
              value={valueTargetData.valueTargetCode}
              onChange={handleChange}
              required
            />
          </Form.Group>
          {/* Add other input fields for valueTarget details */}
          <Modal.Footer>
            <Button variant="secondary" onClick={onClose}>
              取消
            </Button>
            <Button type="submit" variant="primary"
             >
              儲存
            </Button>
          </Modal.Footer>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default ValueTargetFormModal;
