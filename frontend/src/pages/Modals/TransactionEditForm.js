
import React, { useState } from "react";
import axios from "axios";
import { useChat } from "../../api/context";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Modal, Form, Button, Dropdown, InputGroup, ButtonGroup } from '@themesberg/react-bootstrap';


const RemoveModal = ({ onHide,show, states, transaction, orig }) =>{

    const instance = axios.create({baseURL:'http://localhost:5000/api/avm'});
    const [placeHolder, setPlaceHolder] = useState("")
    const [editing, setEditing] = useState(false)
    const [index, setIndex] = useState("選擇修改項目")
    const {val, setVal, valType, setValType} = useChat()
    const [forChange, setForChange] = useState("")
    const [newTransaction, setNewTransaction] = useState({
        account_subjects_num:transaction.account_subjects_num,
        purchase_id:transaction.purchase_id,
        purchase_name:transaction.purchase_name,
        purchase_quantity:transaction.purchase_quantity,
        purchase_unit:transaction.purchase_unit,
        purchase_price:transaction.purchase_price,
        supplier_num :transaction.supplier_num,
        remark:transaction.remark,
        create_user:transaction.create_user
        
      });

    const handleTransactionChange =(e) =>{
        const { name, value } = e.target;
        // console.log(name, value)
        setNewTransaction({
            ...newTransaction,
            [name]: value,
        });
    }

    const editTransaction = (content) =>{
        console.log(forChange, placeHolder)

        setEditing(true)
        switch(content) {
          case "商品代碼" :{
            setIndex(content)
            setPlaceHolder(newTransaction.purchase_id)
            setForChange('purchase_id')
            break;
          }
          case "商品名稱" :{
            setPlaceHolder(newTransaction.purchase_name)
            setIndex(content)
            setForChange("purchase_name")
            break;
          }
          case "商品價格" :{
            setIndex(content)
            setPlaceHolder(newTransaction.purchase_price)
            setForChange("purchase_price")
            break;
          }
          case "商品數量" :{
            setIndex(content)
            setPlaceHolder(newTransaction.purchase_quantity)
            setForChange("purchase_quantity")
            break;
          }
          default:{
            break;
          }
        }
      }

      const handleDeleteTransaction = async()=>{
        const jsonData = {
          orig: orig,
        };
        console.log(jsonData)
        // setValType(null)
        const response = await instance.post('/del_transaction', {
          ID:JSON.stringify(jsonData)
        }
      )
        alert(response.data);
        onHide()
        setEditing(false); //not to show the input bar
        // setValType(newTransaction.category)
      }
    
      const handleEditTransaction = async()=>{
        const jsonData = {
          orig: `${orig}`,
          purchase_id: `${newTransaction.purchase_id}`,
          purchase_name: `${newTransaction.purchase_name}`,
          purchase_price: `${newTransaction.purchase_price}`,
          purchase_quantity: `${newTransaction.purchase_quantity}`,
        };
        setValType(null)

        const response = await instance.post('/mod_transaction', {
          ID:JSON.stringify(jsonData)
        }
      )
        // onSave(newTransaction.target_num, newTransaction.target_name)
        // setValType(newTransaction.category)
        setEditing(false); //not to show the input bar
        setPlaceHolder("") //placeholder in the modal input bar
        setForChange("")
        setIndex("選擇修改項目") //the index button in the 
        alert("已變更財會系統項目");
        // setMat("edit")
        onHide()
      }

    const transactionArray = ['商品代碼','商品名稱']

    return(
    <Modal
        size="lg"
        aria-labelledby="contained-modal-title-vcenter"
        centered
        {...{ onHide, show }}
    >
      <Modal.Header closeButton>
        <Modal.Title id="contained-modal-title-vcenter">
          {states === "deleting" ? "刪除商品" : "編輯商品"}
        </Modal.Title>
      </Modal.Header>
      {states === "deleting"?
        <Modal.Body>
          {/* 三階代碼 : {third} / 三階科目中文名稱 : {thirdCn} / 三階科目英文名稱 : {thirdEng} /<br></br> 四階代碼 : {fourth} / 四階科目中文名稱 : {fourthCn} / 四階科目英文名稱 :{fourthEng} */}
          商品代碼：{newTransaction.purchase_id} <br></br> 商品名稱 : {newTransaction.purchase_name}  
        </Modal.Body>
        :
        <Modal.Body className="d-flex flex-wrap flex-md-nowrap align-items-center  py-4">
          <Dropdown className = "btn-group dropleft" id = "dropdown-button-drop-start" as={ButtonGroup}>
            <Dropdown.Toggle as={Button} split variant="link"  className="text-dark m-0 p-0" style ={{color :"red"}}>
              <Button variant="outline-primary" >{index}</Button>
            </Dropdown.Toggle>
            <Dropdown.Menu>
                {transactionArray.map((inv) =>  (
                    <Dropdown.Item onClick={() => {editTransaction(inv)}}>
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
              <Form.Control type="text" style ={{width : 500}} placeholder = {placeHolder} name={forChange}  onChange={handleTransactionChange} />
            </InputGroup>
          </Form>:null}
        </Modal.Body>
      }
      <Modal.Footer>
        {states === "deleting"?<Button variant="outline-secondary" onClick={handleDeleteTransaction}>確認</Button> :<Button variant="outline-secondary" onClick={handleEditTransaction}>修改</Button>  }
        <Button variant="outline-primary">取消</Button>
      </Modal.Footer>
    </Modal>
    )
  };

export default RemoveModal;
