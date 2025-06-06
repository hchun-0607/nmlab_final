import React, { useState } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDownload, faFileAlt,  faPlus,  faUpload } from '@fortawesome/free-solid-svg-icons';
import { Container, Col, Row, Button, Form , Tab ,Nav } from '@themesberg/react-bootstrap';
import ExcelJs from "exceljs";
import axios from 'axios';
import { useEffect } from "react";

import { useChat } from "../api/context";
import AddBOMModal from './Modals/BomModal';



export default () =>  {
  const [activeTab, setActiveTab] = useState("voice");
  const [text, setText] = useState("");
  const {restaurantList, setRestaurantList} = useChat();
  const {reservationData, setReservationData} = useChat();
  const {userData, setUserData} = useChat();
  const [result, setResult] = useState(null);
  const [status, setStatus] = useState("尚未開始");
  const instance = axios.create({baseURL:'http://localhost:5000'});
  const [showBomModal, setShowBomModal] = useState(false);
  const [bomdata, setBomdata] = useState(null);
  const {bom, setBom} = useChat();
  
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
  
  const handleCloseBomModal = () => {
    setShowBomModal(false);
  };

  const handleSingleAdd = () => {
    setShowBomModal(true);
    console.log(userData)
    const restaurant = restaurantList.find(r => r.name === reservationData.restaurant_name);

    // if (restaurant) {
    //     setReservationData({
    //     ...reservationData,
    //     restaurant_name: restaurant.name,
    //     restaurant_id: restaurant.id
    //     });
    setReservationData(prev => ({
            ...prev,
            restaurant_id: restaurant.restaurant_id ||'',
            reserver_phone: userData.Phone,
            reserver_email : userData.Email,
            reserver_account: userData.Account
      }))
    console.log(reservationData)
    handleManualSubmit()
  };


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

  const startRecognition = () => {
    const recognition = new window.webkitSpeechRecognition();
    recognition.lang = 'zh-TW';
    recognition.continuous = false;

    recognition.onresult = (event) => {
      const speech = event.results[0][0].transcript;
      setText(speech);
      setStatus("辨識完成");
    };

    recognition.onerror = (e) => {
      setStatus("辨識錯誤：" + e.error);
    };

    recognition.start();
    setStatus("錄音中...");
  };

  const resetVoice = () => {
    setText("");
    setStatus("尚未開始");
  };

  const submitVoice = () => {
    setStatus("分析中...");
    fetch("http://localhost:5000/api/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text })
    })
      .then(res => res.json())
      .then(data => {
        setResult(data);
        setStatus("完成 ✅");
      })
      .catch(err => {
        setStatus("發生錯誤 ❌");
        console.error(err);
      });
  };
  const handleRestaurantChange = (e) => {
    const selectedName = e.target.value;
    const restaurant = restaurantList.find(r => r.name === selectedName);

    if (restaurant) {
        setReservationData({
        ...reservationData,
        restaurant_name: restaurant.name,
        restaurant_id: restaurant.id
        });
    } else {
        setReservationData({
        ...reservationData,
        restaurant_name: '',
        restaurant_id: ''
        });
    }
    console.log(reservationData)
    };

  const handleManualSubmit = () => {
    // alert(reservationData)
    // setStatus("送出分析中...");
    // fetch("http://localhost:5000/api/analyze", {
    //   method: "POST",
    //   headers: { "Content-Type": "application/json" },
    //   body: JSON.stringify({
    //     text: `我想幫 ${reservationData.reserver_name} 在 ${reservationData.date} ${reservationData.time} 在 ${reservationData.restaurant_id} 訂位 ${reservationData.people} 人`
    //   })
    // })
    //   .then(res => res.json())
    //   .then(data => {
    //     setResult(data);
    //     setStatus("完成 ✅");
    //   })
    //   .catch(err => {
    //     setStatus("發生錯誤 ❌");
    //     console.error(err);
    //   });
  };

  useEffect(() => {
    async function fetchRestaurants() {
      try {
        const response = await instance.get('/get_restaurants');
        console.log(response.data)
        setRestaurantList(response.data);
      } catch (error) {
        console.error('無法取得餐廳資料:', error);
      }
    }
    fetchRestaurants();
      }, []);

  return (
    <div>
    <Container fluid className="p-4" style={{ minHeight: "100vh", backgroundColor: "#f7f9fc" }}>
      <h2 className="text-center mb-4">語音與手動輸入訂位</h2>

      <Nav variant="tabs" className="mb-3 d-flex">
        <Nav.Item className="flex-fill text-center">
          <Nav.Link active={activeTab === "voice"} onClick={() => setActiveTab("voice")}>
            🎤 語音輸入
          </Nav.Link>
        </Nav.Item>
        <Nav.Item className="flex-fill text-center">
          <Nav.Link active={activeTab === "manual"} onClick={() => setActiveTab("manual")}>
            📝 手動輸入
          </Nav.Link>
        </Nav.Item>
      </Nav>

      {activeTab === "voice" && (
        <div className="bg-white rounded-4 shadow p-5 text-center">
          <Button
            onClick={startRecognition}
            variant="primary"
            className="rounded-circle mb-4"
            style={{ width: 100, height: 100, fontSize: 30 }}
          >
            🎤
          </Button>
          <p className="mb-3"><strong>辨識結果：</strong>{text || "尚無辨識內容"}</p>
          <div className="d-flex justify-content-center gap-3">
            <Button variant="outline-secondary" onClick={resetVoice}>重新辨識</Button>
            <Button variant="success" onClick={submitVoice}>送出結果</Button>
          </div>
        </div>
      )}

      {activeTab === "manual" && (
        <div className="bg-white rounded-4 shadow p-4">
          <Form>
            <Row className="mb-3">
              <Col><Form.Control
                type="text"
                placeholder={userData.Username}
                value={reservationData.reserver_name}
                onChange={e => setReservationData({ ...reservationData, reserver_name: e.target.value })}
              /></Col>
            </Row>
            <Row className="mb-3">
              <Col>
                <Form.Select
                    value={reservationData.restaurant_name || ''}
                    onChange={handleRestaurantChange}
                    >
                    <option value="" disabled hidden>
                        {reservationData.restaurant_name || '請選擇餐廳'}
                    </option>

                    {restaurantList.map((r) => (
                        <option key={r.id} value={r.name}>
                        {r.name}
                        </option>
                    ))}
                </Form.Select>
              </Col>
            </Row>
            <Row className="mb-3">
              <Col>
                <Form.Control
                  type="date"
                  value={reservationData.date}
                  onChange={e => setReservationData({ ...reservationData, date: e.target.value })}
                />
              </Col>
              <Col>
                <Form.Control
                  type="time"
                  value={reservationData.time}
                  onChange={e => setReservationData({ ...reservationData, time: e.target.value })}
                />
              </Col>
            </Row>
            <Row className="mb-4">
              <Col>
                <Form.Select
                  value={reservationData.people}
                  onChange={e => setReservationData({ ...reservationData, people: e.target.value })}
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8].map(num => (
                    <option key={num} value={num}>{num} 人</option>
                  ))}
                </Form.Select>
              </Col>
            </Row>
            <div className="text-center">
              <Button variant="success" size="lg" onClick={handleSingleAdd}>送出訂位</Button>
            </div>
          </Form>
        </div>
      )}

      <p className="mt-4 text-muted text-center">狀態：{status}</p>

      {result && (
        <div className="bg-light border rounded-4 mt-4 p-3">
          <h5>擷取結果：</h5>
          <pre>{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}
    </Container>
    <AddBOMModal
        show={showBomModal}
        onHide={handleCloseBomModal}
        onSave={handleViewBom}
      />
    </div>
  );

}