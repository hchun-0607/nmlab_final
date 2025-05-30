
import React, { useState } from "react";
import axios from "axios";
import moment from "moment";
import { useChat } from "../../api/context";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Modal, Form, Button, Dropdown,  InputGroup,  ButtonGroup } from '@themesberg/react-bootstrap';


const RemoveModal = ({ onHide, show, states, product, origs }) =>{

    const instance = axios.create({baseURL:'http://localhost:5000/api/avm'});
    const [placeHolder, setPlaceHolder] = useState("")
    const [editing, setEditing] = useState(false)
    const [index, setIndex] = useState("選擇修改項目")
    const [forChange, setForChange] = useState("")
    const {bom, setBom} = useChat();
    const [newproduct, setNewproduct] = useState({
        product_id: product.product_id,
        product_name: product.product_name,
        update_user: product.update_user,
        update_time: product.update_time,
        status:product.status,
      });

    const handleproductChange =(e) =>{
        const { name, value } = e.target;
        setNewproduct({
            ...newproduct,
            [name]: value,
        });
    }

    const editproduct = (content) =>{
        console.log(forChange, placeHolder)
        setEditing(true)
        switch(content) {
          case "產品名稱" :{
            setIndex(content)
            setPlaceHolder(newproduct.product_name)
            setForChange('product_name')
            break;
          }
          case "產品代碼" :{
            setPlaceHolder(newproduct.product_id)
            setIndex(content)
            setForChange("product_id")
            break;
          }
          case "更新人員" :{
            setIndex(content)
            setPlaceHolder(newproduct.update_user)
            setForChange("update_user")
            break;
          }
          case "更新日期" :{
            setIndex(content)
            setPlaceHolder(newproduct.update_time)
            setForChange("update_time")
            break;
          }
          default:{
            break;
          }
        }
      }

      const handleDeleteproduct = async()=>{
        const jsonData = {
          product_id: `${newproduct.product_id}`
        };
        setBom(null);
        console.log('JsonData: ', jsonData); //for debug
        const response = await instance.post('/del_bom_first', {
          ID:JSON.stringify(jsonData)
        }
      )
        
        alert(response.data);
        onHide()
        setEditing(false); //not to show the input bar
        setBom("deleted");
        
      }
    
      const handleEditproduct = async()=>{
        const jsonData = {
          orig: `${origs}`,
          status: `${newproduct.status}`,
          product_id: `${newproduct.product_id}`,
          product_name: `${newproduct.product_name}`,
          task :"modify"
        };
        setBom(null);
        const response = await instance.post('/update_bom_first', {
          ID:JSON.stringify(jsonData)
        })

        setEditing(false); //not to show the input bar
        setPlaceHolder("") //placeholder in the modal input bar
        setForChange("")
        setIndex("選擇修改項目") //the index button in the 
        alert("已成功修改產品資料");
        setBom("edited");
        onHide()
      }

    const productArray = ['產品代碼','產品名稱']

    return(
    <Modal
        size="lg"
        aria-labelledby="contained-modal-title-vcenter"
        centered
        {...{ onHide, show }}
    >
      <Modal.Header closeButton>
        <Modal.Title id="contained-modal-title-vcenter">
          {states === "deleting" ? "刪除產品" : "編輯產品"}
        </Modal.Title>
      </Modal.Header>
      {states === "deleting"?
        <Modal.Body>
          產品代碼 : {newproduct.product_id} / 產品名稱 : {newproduct.product_name} <br></br> 更新時間 : {moment(newproduct.update_time).format('YYYY-MM-DD HH:mm:ss')} / 更新人員 : {newproduct.update_user}
        </Modal.Body>
        :
        <Modal.Body className="d-flex flex-wrap flex-md-nowrap align-items-center  py-4">
          <Dropdown className = "btn-group dropleft" id = "dropdown-button-drop-start" as={ButtonGroup}>
            <Dropdown.Toggle as={Button} split variant="link"  className="text-dark m-0 p-0" style ={{color :"red"}}>
              <Button variant="outline-primary" >{index}</Button>
            </Dropdown.Toggle>
            <Dropdown.Menu>
                {productArray.map((inv) =>  (
                    <Dropdown.Item onClick={() => {editproduct(inv)}}>
                        <FontAwesomeIcon  className="me-2" /> {inv}
                    </Dropdown.Item> 
                  ))}
            </Dropdown.Menu>
          </Dropdown>
          &nbsp;
          &nbsp;
      
          {editing? 
          <Form >
            <InputGroup >
              <InputGroup.Text>
                <FontAwesomeIcon  />
              </InputGroup.Text>
              <Form.Control type="text" style ={{width : 500}} placeholder = {placeHolder} name={forChange}  onChange={handleproductChange} />
            </InputGroup>
          </Form>:null}
        </Modal.Body>
      }
      <Modal.Footer>
        {states === "deleting"?<Button variant="outline-secondary" onClick={handleDeleteproduct}>確認</Button> :<Button variant="outline-secondary" onClick={handleEditproduct}>修改</Button>  }
        <Button variant="outline-primary">取消</Button>
      </Modal.Footer>
    </Modal>
    )
  };

export default RemoveModal;
