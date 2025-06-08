import React, { useState } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDownload, faFileAlt,  faPlus,  faStar,  faUpload } from '@fortawesome/free-solid-svg-icons';
import { Col, Row, Button, Form , Tab ,Nav } from '@themesberg/react-bootstrap';
import axios from 'axios';
import { useEffect } from "react";
import { useChat } from "../api/context";
import '../css/restaurant.css';
import {useHistory} from "react-router-dom"


export default () => {
  const instance = axios.create({baseURL:'http://localhost:5000/api/avm/restaurants'});
  const {restaurantList, setRestaurantList} = useChat();
  const {reservationData, setReservationData} = useChat();
  let history = useHistory();
    
  const handleGoReserve = (restaurant_name, restaurant_id) => {
      setReservationData(prev => ({
            ...prev,
            // restaurant_id: restaurant_id,
            restaurant_name: restaurant_name
      }))
      console.log(reservationData)
    //   history.push("/reserve")
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

    const handleFavorite = (e) => {
    //   setSelectedFile(e.target.files[0]);
        alert("testFav")
    };
    useEffect(() => {
        if (reservationData.restaurant_name) {
            history.push("/reserve");
        }
        }, [reservationData.restaurant_name, history]);


  return (
    <div className="container mt-4">
        <h2 className="text-center mb-4">餐廳列表</h2>

        {restaurantList.map((restaurant, index) => (
            <div key={index} className="restaurant-card d-flex flex-wrap justify-content-between align-items-center p-4 mb-4 shadow-sm border rounded-4 bg-white">
            
            {/* 左半部：資訊 */}
            <div className="restaurant-info" style={{ flex: '1 1 60%' }}>
                <h4 className="fw-bold mb-3">{restaurant.name}</h4>
                <p className="mb-1">營業時間：週一至週日 {restaurant.open}:00 - {restaurant.close}:00</p>
                <p className="mb-1">評價：{restaurant.rating} / 5</p>
                <p className="mb-1">類型：{restaurant.type}</p>
                <p className="mb-1">價位：{"$".repeat(restaurant.price)}</p>
                <p className="mb-0">位置：{restaurant.location}</p>
            </div>

            {/* 右半部：按鈕區域 */}
            <div className="d-flex flex-column gap-2 align-items-end mt-3 mt-md-0" style={{ flex: '1 1 30%', minWidth: '180px' }}>
                <button className="btn btn-outline-danger px-4 py-2 btn-sm ">加到最愛</button>
                <button className="btn btn-outline-dark px-4 py-2 btn-sm  mt-3"
                    onClick={() => handleGoReserve(restaurant.name, restaurant.restaurant_id)}>立即訂位
                </button>
            </div>
            </div>
        ))}
    </div>
    );
};

 
