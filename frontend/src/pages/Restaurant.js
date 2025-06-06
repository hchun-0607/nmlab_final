import React, { useState } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDownload, faFileAlt,  faPlus,  faStar,  faUpload } from '@fortawesome/free-solid-svg-icons';
import { Col, Row, Button, Form , Tab ,Nav } from '@themesberg/react-bootstrap';
import ExcelJs from "exceljs";
import axios from 'axios';
import { useEffect } from "react";

// import AddBOMModal from './Modals/BomModal';
import { useChat } from "../api/context";
import '../css/restaurant.css';
// import ProductTable from "../components/BomTable";



export default () => {
  const instance = axios.create({baseURL:'http://localhost:5000'});
  const {restaurantList, setRestaurantList} = useChat();


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

    const handleReserve = (e) => {
    //   setSelectedFile(e.target.files[0]);
      alert("Reserve")

    };

    const handleFavorite = (e) => {
    //   setSelectedFile(e.target.files[0]);
        alert("testFav")
    };


  return (
    <div className="container mt-4">
        <h2 className="text-center mb-4">餐廳列表</h2>

        {restaurantList.map((restaurant, index) => (
        <div key={index} className="restaurant-card d-flex justify-content-between align-items-center p-4 mb-4 shadow-sm border rounded-3 bg-white">
            {/* 左半部：資訊 */}
            <div className="restaurant-info">
            <h4 className="fw-bold mb-3">{restaurant.name}</h4>
            <p className="mb-1">營業時間：週一至週日 {restaurant.hours}</p>
            <p className="mb-1">評價：{restaurant.rating} / 5</p>
            <p className="mb-0">價位：{"$".repeat(restaurant.price)}</p>
            </div>

            {/* 右半部：按鈕區域 */}
           <div className="d-flex flex-column gap-3 align-items-end">
            <button icon={faStar} className="btn btn-outline-danger w-100 px-4 py-2  btn-sm">加到最愛</button>
            <button className="btn btn-outline-dark w-100 px-4 py-2  btn-sm">立即訂位</button>
            </div>
        </div>
        ))}
    </div>
    );
};

 
