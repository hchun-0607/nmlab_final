import React, { useState } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDownload, faFileAlt,  faMicrophone,  faPlus,  faUpload } from '@fortawesome/free-solid-svg-icons';
import { Container, Col, Row, Button, Form , Tab ,Nav } from '@themesberg/react-bootstrap';
import ExcelJs from "exceljs";
import axios from 'axios';
import { useEffect } from "react";
import { FaMicrophone } from "react-icons/fa";

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
  const instance = axios.create({baseURL:'http://localhost:5000/api/avm/users'});

  
  const [showBomModal, setShowBomModal] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [analyze, setAnalyze] = useState(false);
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
    console.log(userData)
    console.log(reservationData)
    const matchedRestaurant = restaurantList.find(
        r => r.name === reservationData.restaurant_name
    );
    // setReservationData(prev => ({
    //         ...prev,
    //         restaurant_id: '0000',
    //         restaurant_name: "test",
    //   }))

    
    console.log(reservationData)
    if (!reservationData.date || !reservationData.time || !reservationData.people || !reservationData.restaurant_name) {
        alert("尚有欄位未填");
        // return;
        setReservationData(prev => ({
            ...prev,
            restaurant_id: '0000',
            restaurant_name: "test",
            restaurant_id: matchedRestaurant ? matchedRestaurant.restaurant_id || '' : '0000',
            reserver_phone: userData.Phone,
            reserver_email : userData.Email,
            reserver_account: userData.Account,
            reserver_name:userData.Username,
         }))
        setShowBomModal(true);
    }
    else{
        setReservationData(prev => ({
            ...prev,
            restaurant_id: '0000',
            restaurant_name: "test",
            restaurant_id: matchedRestaurant ? matchedRestaurant.restaurant_id || '' : '0000',
            reserver_phone: userData.Phone,
            reserver_email : userData.Email,
            reserver_account: userData.Account,
            reserver_name:userData.Username,
         }))
        setShowBomModal(true);
    }
    
  };


  const startRecognition = () => {
    const recognition = new window.webkitSpeechRecognition();
    recognition.lang = 'zh-TW';
    recognition.continuous = false;
    setIsRecording(true);
    setResult("")



    recognition.onresult = (event) => {
      const speech = event.results[0][0].transcript;
      setText(speech);
      setStatus("辨識完成，分析中...");
      setIsRecording(false);

    };

    recognition.onerror = (e) => {
      setStatus("辨識錯誤：" + e.error);
    };

    recognition.start();
    setStatus("錄音中...");
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


   

  useEffect(() => {
    async function fetchRestaurants() {
      try {
        const response = await instance.get('/get_restaurants');
        console.log(response.data)
        setRestaurantList(response.data);
      } catch (error) {
        console.error('無法取得餐廳資料:', error);
        setStatus("發生錯誤 ❌");
      }
    }
    fetchRestaurants();
      }, []);

   useEffect(() => {
    async function Analyze() {
        try {
        const response = await instance.post('/analyze_words', {
            text: text  // 把 analyze 變數（你輸入的文字）傳給後端
        });
        console.log(response.data);
        setReservationData(prev => ({
            ...prev,
            restaurant_name: response.data.result.restaurant_name ||'',
            date: response.data.result.date,
            time : response.data.result.time,
            people: response.data.result.number_of_people,
         })); // 或其他 setXXX 根據你實際用途
        setResult(response.data.result);
        setStatus("完成 ✅");
        } catch (error) {
        console.error('無法分析文字:', error);
        }
    }

    if (text.trim() !== '') {
        console.log("called : " , text)
        Analyze();
    }
    }, [text]);

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
            variant={isRecording ? "danger" : "outline-primary"}
            className="rounded-circle mb-4"
            style={{ width: 100, height: 100, fontSize: 30 }}
          >
            <FaMicrophone color={isRecording ? "white" : "black"} size={40} />
          </Button>
          <div className="mb-1">
            <strong>辨識結果：</strong>
            {result ? (
                <>
                <p>餐廳名稱：{result.restaurant_name}</p>
                <p>日期：{result.date}</p>
                <p>時間：{result.time}</p>
                <p>人數：{result.number_of_people}</p>
                </>
            ) : (
                <p>尚無辨識內容</p>
            )}
            </div>
          <div className="d-flex justify-content-center gap-3">
            <Button variant="outline-primary" onClick={startRecognition}>重新辨識</Button>
            <Button 
                variant="success" 
                onClick={handleSingleAdd} 
                disabled={!result}
                >
                確認
            </Button>
          </div>
        </div>
      )}

      {activeTab === "manual" && (
        <div className="bg-white rounded-4 shadow p-4">
          <Form>
            {/* <Row className="mb-3">
              <Col><Form.Control
                type="text"
                placeholder={userData.Username}
                value={reservationData.reserver_name}
                onChange={e => setReservationData({ ...reservationData, reserver_name: e.target.value })}
              /></Col>
            </Row> */}
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
              <Button variant="success" onClick={handleSingleAdd}>確認</Button>
            </div>
          </Form>
        </div>
      )}

      <p className="mt-4 text-muted text-center">狀態：{status}</p>

      {/* {result && (
        <div className="bg-light border rounded-4 mt-4 p-3">
          <h5>擷取結果：</h5>
          <pre>{JSON.stringify(result, null, 2)}</pre>
        </div>
      )} */}
    </Container>
    <AddBOMModal
        show={showBomModal}
        onHide={handleCloseBomModal}
      />
    </div>
  );

}