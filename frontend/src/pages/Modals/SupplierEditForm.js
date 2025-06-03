
import React, { useState } from "react";
import axios from "axios";
import moment from "moment";
import { useChat } from "../../api/context";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAngleDown, faAngleUp, faArrowDown, faArrowUp, faEdit, faEllipsisH, faExternalLinkAlt, faEye, faTrashAlt } from '@fortawesome/free-solid-svg-icons';
import { Modal, Form, Nav, Card, Button, Table, Dropdown, ProgressBar,  InputGroup, Pagination, ButtonGroup } from '@themesberg/react-bootstrap';


const RemoveModal = ({ onHide, show, states, supplier, origs }) =>{

    const instance = axios.create({baseURL:'http://localhost:5000'});
    const [placeHolder, setPlaceHolder] = useState("")
    const [editing, setEditing] = useState(false)
    const [index, setIndex] = useState("選擇修改項目")
    const [forChange, setForChange] = useState("")
    const {sup, setSup} = useChat();
    
    const [newSupplier, setNewSupplier] = useState({
        supplier_num: supplier.supplier_num,
        supplier_name: supplier.supplier_name,
        update_user: supplier.update_user,
        update_time: supplier.update_time,
        status:supplier.status,
      });

    const handleSupplierChange =(e) =>{
        const { name, value } = e.target;
        setNewSupplier({
            ...newSupplier,
            [name]: value,
        });
    }

    const editSupplier = (content) =>{
        console.log(forChange, placeHolder)
        setEditing(true)
        switch(content) {
          case "供應商名稱" :{
            setIndex(content)
            setPlaceHolder(newSupplier.supplier_name)
            setForChange('supplier_name')
            break;
          }
          case "供應商代碼" :{
            setPlaceHolder(newSupplier.supplier_num)
            setIndex(content)
            setForChange("supplier_num")
            break;
          }
          case "更新人員" :{
            setIndex(content)
            setPlaceHolder(newSupplier.update_user)
            setForChange("update_user")
            break;
          }
          case "更新日期" :{
            setIndex(content)
            setPlaceHolder(newSupplier.update_time)
            setForChange("update_time")
            break;
          }
          default:{
            break;
          }
        }
      }

      const handleDeleteSupplier = async()=>{
        const jsonData = {
          supplier_num: `${newSupplier.supplier_num}`
        };
        setSup(null)
        const response = await instance.post('/del_supplier', {
          ID:JSON.stringify(jsonData)
        }
      )
        alert(response.data);
        onHide()
        setEditing(false); //not to show the input bar
        setSup("del")
      }
      const handleEditSupplier = async()=>{
        const jsonData = {
          orig: `${origs}`,
          status: `${newSupplier.status}`,
          supplier_num: `${newSupplier.supplier_num}`,
          supplier_name: `${newSupplier.supplier_name}`,
          update_user: `${newSupplier.update_user}`,
          update_time: `${newSupplier.update_time}`,
          task :"modify"
        };
        setSup(null)
        const response = await instance.post('/update_supplier', {
          ID:JSON.stringify(jsonData)
        })

        setEditing(false); //not to show the input bar
        setPlaceHolder("") //placeholder in the modal input bar
        setForChange("")
        setIndex("選擇修改項目") //the index button in the 
        alert(response.data);
        setSup("edit")
        onHide()
      }

      
    const supplierArray = ['供應商代碼','供應商名稱']

    return(
    <Modal
        size="lg"
        aria-labelledby="contained-modal-title-vcenter"
        centered
        {...{ onHide, show }}
    >
      <Modal.Header closeButton>
        <Modal.Title id="contained-modal-title-vcenter">
          {states === "deleting" ? "刪除供應商" : "編輯供應商"}
        </Modal.Title>
      </Modal.Header>
      {states === "deleting"?
        <Modal.Body>
          供應商代碼 : {newSupplier.supplier_num} / 供應商名稱 : {newSupplier.supplier_name} <br></br> 更新時間 : {moment(newSupplier.update_time).format('YYYY-MM-DD HH:mm:ss')} / 更新人員 : {newSupplier.update_user}
        </Modal.Body>
        :
        <Modal.Body className="d-flex flex-wrap flex-md-nowrap align-items-center  py-4">
          <Dropdown className = "btn-group dropleft" id = "dropdown-button-drop-start" as={ButtonGroup}>
            <Dropdown.Toggle as={Button} split variant="link"  className="text-dark m-0 p-0" style ={{color :"red"}}>
              <Button variant="outline-primary" >{index}</Button>
            </Dropdown.Toggle>
            <Dropdown.Menu>
                {supplierArray.map((inv) =>  (
                    <Dropdown.Item onClick={() => {editSupplier(inv)}}>
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
              <Form.Control type="text" style ={{width : 500}} placeholder = {placeHolder} name={forChange}  onChange={handleSupplierChange} />
            </InputGroup>
          </Form>:null}
        </Modal.Body>
      }
      <Modal.Footer>
        {states === "deleting"?<Button variant="outline-secondary" onClick={handleDeleteSupplier}>確認</Button> :<Button variant="outline-secondary" onClick={handleEditSupplier}>修改</Button>  }
        <Button variant="outline-primary">取消</Button>
      </Modal.Footer>
    </Modal>
    )
  };

export default RemoveModal;
