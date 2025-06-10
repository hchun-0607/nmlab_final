import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faWallet, faSearch, faSpinner } from "@fortawesome/free-solid-svg-icons";
import { Col, Row, Button, Form, Card, Alert } from "@themesberg/react-bootstrap";
import axios from "axios";

export default function WalletBalance() {
  const instance = axios.create({baseURL:'http://localhost:5000/api/avm/users'});
  
  const [account, setAccount] = useState("");
  const [balance, setBalance] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    setAccount(e.target.value.trim());
    setError("");
    setBalance(null);
  };

  const handleCheckBalance = async () => {
    if (!account) {
      setError("請輸入使用者帳號");
      setBalance(null);
      return;
    }

    setLoading(true);
    setError("");
    setBalance(null);

    try {
      const response = await instance.post("/balance", { account });
      if (response.data.success) {
        setBalance(response.data.balance_eth);
      } else {
        setError(response.data.message || "查詢失敗");
      }
    } catch (err) {
      setError("伺服器錯誤，請稍後再試");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Row className="justify-content-center mt-5">
      <Col xs={12} md={8} lg={6}>
        <Card className="shadow-sm">
          <Card.Body>
            <h3 className="mb-4 text-center">
              <FontAwesomeIcon icon={faWallet} className="me-2 text-primary" />
              錢包餘額查詢
            </h3>

            <Form.Group className="mb-3">
              <Form.Label>使用者帳號</Form.Label>
              <Form.Control
                type="text"
                placeholder="請輸入使用者帳號"
                value={account}
                onChange={handleInputChange}
                isInvalid={!!error}
              />
              <Form.Control.Feedback type="invalid">{error}</Form.Control.Feedback>
            </Form.Group>

            <div className="d-grid gap-2 mb-3">
              <Button
                variant="primary"
                onClick={handleCheckBalance}
                disabled={loading || account === ""}
              >
                {loading ? (
                  <>
                    <FontAwesomeIcon icon={faSpinner} spin className="me-2" />
                    查詢中...
                  </>
                ) : (
                  <>
                    <FontAwesomeIcon icon={faSearch} className="me-2" />
                    查詢餘額
                  </>
                )}
              </Button>
            </div>

            {balance !== null && (
              <Alert variant="success" className="text-center">
                <strong>餘額：</strong> {balance} ETH
              </Alert>
            )}
          </Card.Body>
        </Card>
      </Col>
    </Row>
  );
}
