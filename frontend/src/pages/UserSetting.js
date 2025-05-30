import React, { useState } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDownload, faFileAlt,  faPlus,  faUpload } from '@fortawesome/free-solid-svg-icons';
import { Col, Row, Button, Form , Tab ,Nav } from '@themesberg/react-bootstrap';
import ExcelJs from "exceljs";
import axios from 'axios';
import { useEffect } from "react";

import AddBOMModal from './Modals/BomModal';
import { useChat } from "../api/context";
// import ProductTable from "../components/BomTable";



export default () => {
  const [excelFile, setExcelFile] = useState(null);
  const [showBomModal, setShowBomModal] = useState(false);
  const instance = axios.create({baseURL:'http://localhost:5000/api/avm'});
  const [result, setResult] = useState([]);
  const [bomdata, setBomdata] = useState(null);
  const {bom, setBom} = useChat();

  const handleExceldownload = async () => {
    const bom = new ExcelJs.Workbook();
    // const sheet = bom.addWorksheet('BOM表設定');
    
    // 表格裡面的資料都填寫完成之後，訂出下載的callback function
		// 異步的等待他處理完之後，創建url與連結，觸發下載
	  bom.xlsx.writeBuffer().then((content) => {
		const link = document.createElement("a");
	    const blobData = new Blob([content], {
	      type: "application/vnd.ms-excel;charset=utf-8;"
	    });
	    link.download = 'BOM.xlsx';
	    link.href = URL.createObjectURL(blobData);
	    link.click();
	  });
      
  }

  const [selectedFile, setSelectedFile] = useState(null);



  const handleFileChange = (e) => {
      setSelectedFile(e.target.files[0]);
  };

  const handleUpload = () => {
      if (!selectedFile) {
          alert('請選擇一個Excel檔案');
          return;
      }

      const formData = new FormData();
      formData.append('excelFile', selectedFile);

      
      instance.post('/upload_bom', formData, {
          headers: {
              'Content-Type': 'multipart/form-data'
          }
      })
      .then(function (response) {
          // 處理成功的回應
          alert('上傳成功');
          console.log('上傳成功', response.data);
      })
      .catch(function (error) {
          // 處理錯誤
          alert('上傳失敗，請重新上傳');
          console.error('上傳失敗', error);
      });
  };

  const handleSingleAdd = () => {
    setShowBomModal(true);
  };

  const handleCloseBomModal = () => {
    setShowBomModal(false);
  };

  const handleSaveBom = async () => {
    // Handle the logic to save the Bom data
    setResult(await instance.get('/get_bom'))
    console.log(result.data)
  };

  async function getBOMData() {
    try {
      const response = await instance.get('/get_bom');
      console.log(response.data);
      return response.data; // This should contain the data returned by the backend
    } catch (error) {
      console.error('Error fetching BOM data:', error);
      throw error; // Rethrow the error to handle it at a higher level if needed
    }
  }
  
  // Call the getBOMData function when needed
  async function handleViewBom() {
    try {
      const data = await getBOMData();
      console.log('BOM data:', data);
      setBom("BOM");
      setBomdata(data);
    } catch (error) {
      console.error('An error occurred:', error);
    }
  }

  useEffect(() => {
    handleViewBom();
    setBom(null);
  }, [bom]);

  const [remove , setRemove] = useState(false)
  const handleViewRemove = () => {
    setRemove(true)
  }

  return (
    <>
      <div className="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center py-3">
        <h2 className="fw-bold">
          使用者資訊
        </h2>
      </div>
      <Tab.Container defaultActiveKey="upload">
        <Row>
          <Col xs={12} xl={10}>
            {/* Nav for Tabs */}
            <Nav variant="tabs">
              <Nav.Item>
                <Nav.Link eventKey="upload">上傳</Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="browse" onClick={handleViewBom}>瀏覽</Nav.Link>
              </Nav.Item>
            </Nav>

            {/* Tab Content */}
            <Tab.Content>
              <Tab.Pane eventKey="upload">

                <div className="d-flex justify-content-center align-items-center mb-3">
                  <Col xs={12} xl={5}>
                    <Form.Group>
                      <Form.Label>上傳excel</Form.Label>
                      <Form.Control type="file" accept=".xlsx,.xls" onChange={handleFileChange} />
                    </Form.Group>
                  </Col>

                </div>
                <div className="d-flex justify-content-center align-items-center mb-3">
                <Col xs={12} xl={5}>
                <Button icon={faFileAlt} className="me-2" variant="primary" onClick={handleExceldownload}>
                  <FontAwesomeIcon icon={faDownload} className="me-2" />
                  下載範例
                </Button>
                <Button icon={faFileAlt} className="me-2" variant="primary" onClick={handleUpload}>
                    <FontAwesomeIcon icon={faUpload} className="me-2" />
                    上傳
                </Button>
                </Col>
                </div>
              </Tab.Pane>

              <Tab.Pane eventKey="browse">
              {/* Browse content here */}
              {/* You can display a table or a list of files here */}
              <div className="d-flex justify-content-between flex-wrap flex-md-nowrap py-2">
                {/* 單筆新增按鈕 */}
                <Button icon={faFileAlt} className="me-2" variant="primary" onClick={handleSingleAdd}>
                  <FontAwesomeIcon icon={faPlus} className="me-2" />
                  新增一階產品
                </Button>
                <Button className="me-2" variant="primary" onClick={handleViewRemove}>
                  <FontAwesomeIcon className="me-2" />
                  查看刪除紀錄
                </Button>
              </div>
              {/* <TransactionsTable /> */}
              {/* {bomdata !== null && <ProductTable data={bomdata} data2={remove}/>} */}
            </Tab.Pane>
            </Tab.Content>

          </Col>

        </Row>
      </Tab.Container>

      {/* Bom Form Modal */}
      <AddBOMModal
        show={showBomModal}
        onHide={handleCloseBomModal}
        onSave={handleViewBom}
      />
    </>
  );
};

 
