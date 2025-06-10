import React, { useState } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDownload, faFileAlt,  faPlus,  faUpload } from '@fortawesome/free-solid-svg-icons';
import { Col, Row, Button, Form , Tab ,Nav } from '@themesberg/react-bootstrap';
import axios from 'axios';
import { useEffect } from "react";
import { useChat } from "../api/context";
import '../css/restaurant.css';




export default () => {
  const instance = axios.create({baseURL:'http://localhost:5000/api/avm/users'});
  const {reservationList, setReservationList} = useChat();
  const {userData, setUserData} = useChat();

  useEffect(() => {
    async function fetchHistoricalReservations() {
      console.log(userData)
      if (!userData.Wallet_address) {
        console.warn('未提供錢包地址');
        return;
      }

      try {
        console.log(userData.Wallet_address)
        const response = await instance.get('/mine/reservations', {
          params: {
            wallet: userData.Wallet_address
          },
          headers: {
            'Content-Type': 'application/json'
          }
        });

        // 可以處理 response，例如：setHistoricalReservations(response.data);
        console.log('歷史訂位資料：', response.data);
        setReservationList(response.data)

      } catch (error) {
        console.error('無法取得歷史訂位資料:', error);
      }
    }
      console.log(userData)
    fetchHistoricalReservations();
  }, []);

  



  return (
    <>
      <div className="container mt-4">
      <h2 className="text-center mb-4">訂位資訊</h2>
      </div>
      <Tab.Container defaultActiveKey="upload">
        <Row>
          <Col xs={12} xl={12}>
            {/* Nav for Tabs */}
            <Nav variant="tabs">
              <Nav.Item>
                <Nav.Link eventKey="upload">待用餐</Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="browse" >已用餐</Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="unsuccessful" >未成功</Nav.Link>
              </Nav.Item>
            </Nav>

            {/* Tab Content */}
            <Tab.Content>
              <Tab.Pane eventKey="upload">
                  <div className="container-fluid mt-4">
                    {Array.isArray(reservationList) && reservationList
                      .filter(reservation => reservation.reserver_account === userData.Account)
                      .map((reservation, index) => (
                        
                        <div
                          key={index}
                          className="reservation-card d-flex justify-content-between align-items-center p-4 mb-4 shadow-sm border rounded-4 bg-white"
                          style={{ flexWrap: "nowrap" }} // 不換行，確保三欄水平排
                        >
                          {/* 左邊：圖片 */}
                          <div style={{ flex: "0 0 260px", marginRight: "20px" }}>
                            {reservation.nft_picture && (
                              <img src="http://feitalks.com/wp-content/uploads/2019/11/20106568_1893392504261408_6372724982151887580_n-500x381.png" alt="NFT" style={{ maxWidth: "250px", borderRadius: "12px" }} />
                            )}
                          </div>

                          {/* 中間：訂位資訊 */}
                          <div style={{ flex: "1 1 auto", marginRight: "20px" }}>
                            <h4 className="fw-bold mb-3">{reservation.restaurant_name}</h4>
                            <p className="mb-1">訂位時間：{reservation.date} {reservation.time}</p>
                            <p className="mb-1">用餐人數：{reservation.people} 人</p>
                            <p className="mb-1">
                              狀態：訂位成功
                            </p>
                            {reservation.nft_id && (
                              <>
                                <p className="mb-1">NFT ID：{reservation.nft_id}</p>
                                <p className="mb-1">NFT 說明：{reservation.nft_content}</p>
                              </>
                            )}
                          </div>

                          {/* 右邊：按鈕 */}
                          <div style={{ flex: "0 0 auto", textAlign: "right" }}>
                              <button className="btn btn-outline-danger px-4 py-2 btn-sm">
                                取消訂位
                              </button>
                          </div>
                        </div>
                      ))}
                </div>
              </Tab.Pane>

              
            
            </Tab.Content>

          </Col>

        </Row>
      </Tab.Container>


    </>
  );
};

 
