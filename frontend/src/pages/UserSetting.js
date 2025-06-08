import React, { useState } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDownload, faFileAlt,  faPlus,  faUpload } from '@fortawesome/free-solid-svg-icons';
import { Col, Row, Button, Form , Tab ,Nav } from '@themesberg/react-bootstrap';
import ExcelJs from "exceljs";
import axios from 'axios';
import { useEffect } from "react";

// import AddBOMModal from './Modals/BomModal';
import { useChat } from "../api/context";

function App() {
  const [activeTab, setActiveTab] = useState("voice");
  const [text, setText] = useState("");
  const [manualText, setManualText] = useState("");
  const instance = axios.create({baseURL:'http://localhost:5000/api/avm/users'});
  const [result, setResult] = useState(null);
  const [status, setStatus] = useState("尚未開始");

  const startRecognition = () => {
    const recognition = new window.webkitSpeechRecognition();
    recognition.lang = 'zh-TW';
    recognition.continuous = false;

    recognition.onresult = (event) => {
      const speech = event.results[0][0].transcript;
      setText(speech);
      setStatus("辨識完成，送出分析中...");

      fetch("http://localhost:5000/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: speech })
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

    recognition.onerror = (e) => {
      setStatus("辨識錯誤：" + e.error);
    };

    recognition.start();
    setStatus("錄音中...");
  };

  const handleManualSubmit = () => {
    setStatus("送出分析中...");

    fetch("http://localhost:5000/api/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: manualText })
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
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-xl mx-auto bg-white rounded-2xl shadow-xl p-6">
        <h1 className="text-2xl font-bold text-center text-gray-800 mb-6">📋 語音／手動 訂位分析</h1>

        <div className="flex justify-center space-x-4 mb-6">
          <button
            onClick={() => setActiveTab("voice")}
            className={`px-4 py-2 rounded-full font-medium transition ${
              activeTab === "voice" ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-600"
            }`}
          >
            🎤 語音輸入
          </button>
          <button
            onClick={() => setActiveTab("manual")}
            className={`px-4 py-2 rounded-full font-medium transition ${
              activeTab === "manual" ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-600"
            }`}
          >
            📝 手動輸入
          </button>
        </div>

        {activeTab === "voice" && (
          <div className="space-y-4">
            <button
              onClick={startRecognition}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-xl font-semibold shadow"
            >
              點我開始語音辨識
            </button>
            <p className="text-gray-700"><strong>辨識結果:</strong> {text}</p>
          </div>
        )}

        {activeTab === "manual" && (
          <div className="space-y-4">
            <textarea
              rows="4"
              className="w-full border rounded-xl p-3 text-gray-700"
              value={manualText}
              onChange={(e) => setManualText(e.target.value)}
              placeholder="請輸入：我想幫張小姐週五晚上六點訂位在永康街的義大利餐廳，總共3人"
            />
            <button
              onClick={handleManualSubmit}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-xl font-semibold shadow"
            >
              送出分析
            </button>
          </div>
        )}

        <p className="mt-4 text-sm text-gray-500">狀態：{status}</p>

        {result && (
          <div className="mt-6 bg-gray-100 p-4 rounded-xl text-sm">
            <h3 className="font-semibold mb-2">🧠 擷取結果：</h3>
            <pre className="whitespace-pre-wrap">{JSON.stringify(result, null, 2)}</pre>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
