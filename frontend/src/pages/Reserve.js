import React, { useState } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDownload, faFileAlt,  faPlus,  faUpload } from '@fortawesome/free-solid-svg-icons';
import { Container, Col, Row, Button, Form , Tab ,Nav } from '@themesberg/react-bootstrap';
import ExcelJs from "exceljs";
import axios from 'axios';
import { useEffect } from "react";

import { useChat } from "../api/context";

export default () =>  {
  const [activeTab, setActiveTab] = useState("voice");
  const [text, setText] = useState("");
  const [manualData, setManualData] = useState({
    name: "",
    restaurant: "",
    date: "",
    time: "",
    people: 1
  });
  const [result, setResult] = useState(null);
  const [status, setStatus] = useState("尚未開始");

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

  const handleManualSubmit = () => {
    setStatus("送出分析中...");
    fetch("http://localhost:5000/api/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text: `我想幫 ${manualData.name} 在 ${manualData.date} ${manualData.time} 在 ${manualData.restaurant} 訂位 ${manualData.people} 人`
      })
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

  return (
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
                placeholder="訂位人姓名"
                value={manualData.name}
                onChange={e => setManualData({ ...manualData, name: e.target.value })}
              /></Col>
            </Row>
            <Row className="mb-3">
              <Col>
                <Form.Select
                  value={manualData.restaurant}
                  onChange={e => setManualData({ ...manualData, restaurant: e.target.value })}
                >
                  <option value="">請選擇餐廳</option>
                  <option>永康街義大利餐廳</option>
                  <option>信義區壽司店</option>
                  <option>天母牛排館</option>
                </Form.Select>
              </Col>
            </Row>
            <Row className="mb-3">
              <Col>
                <Form.Control
                  type="date"
                  value={manualData.date}
                  onChange={e => setManualData({ ...manualData, date: e.target.value })}
                />
              </Col>
              <Col>
                <Form.Control
                  type="time"
                  value={manualData.time}
                  onChange={e => setManualData({ ...manualData, time: e.target.value })}
                />
              </Col>
            </Row>
            <Row className="mb-4">
              <Col>
                <Form.Select
                  value={manualData.people}
                  onChange={e => setManualData({ ...manualData, people: e.target.value })}
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8].map(num => (
                    <option key={num} value={num}>{num} 人</option>
                  ))}
                </Form.Select>
              </Col>
            </Row>
            <div className="text-center">
              <Button variant="success" size="lg" onClick={handleManualSubmit}>送出訂位</Button>
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
  );
}