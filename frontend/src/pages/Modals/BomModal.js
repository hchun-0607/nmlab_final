import React, { useState } from 'react';
import { Button, Modal, Form, Card } from 'react-bootstrap';
import axios from 'axios';
import moment from 'moment';
import { useChat } from '../../api/context';

function AddBOMModal({ show, onHide }) {
    const instance = axios.create({ baseURL: 'http://localhost:5000/api/avm' });
    const { userData , setSup} = useChat();
    const [formData, setFormData] = useState({
        product_id: '',
        product_name: '',
        product_second_id: '',
        use_quantity: '',
        update_user: '',
        update_time: '',
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });
    };

    const handleAddBOM = async (e) => {
        e.preventDefault();
        // 檢查是否有欄位未填寫
        if (formData.product_id === '') {
            alert('尚未輸入產品代碼');
            return;
        }
        if (formData.product_name === '') {
            alert('尚未輸入產品名稱');
            return;
        }
        // 設定更新人員


        // 設定更新時間
        formData.update_time = moment(new Date()).format('YYYY-MM-DD HH:mm:ss');
        formData.update_user = userData.Username;
        formData.status = 1;
        // 將 formData 中的值發送到後端
        console.log('新增 BOM 第一階', formData);
        instance.post('/add_bom_first', {ID:JSON.stringify(formData)})
            .then((response) => {
                console.log('新增成功', response.data);
                alert('新增成功');
                onHide(); // 關閉 modal
            })
            .catch((error) => {
                alert('新增失敗，請稍後再試');
                console.error('新增失敗', error);
            });
    };

    return (
        <Modal show={show} onHide={onHide}>
            <Modal.Header closeButton>
                <Modal.Title>新增 BOM 第一階</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form>
                    <Form.Group controlId="product_id">
                        <Form.Label>產品代碼</Form.Label>
                        <Form.Control
                            type="text"
                            name="product_id"
                            value={formData.product_id}
                            onChange={handleInputChange}
                        />
                    </Form.Group>
                    <Form.Group controlId="product_name">
                        <Form.Label>產品名稱</Form.Label>
                        <Form.Control
                            type="text"
                            name="product_name"
                            value={formData.product_name}
                            onChange={handleInputChange}
                        />
                    </Form.Group>
                </Form>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={onHide}>
                    取消
                </Button>
                <Button variant="primary" onClick={handleAddBOM}>
                    新增
                </Button>
            </Modal.Footer>
        </Modal>
    );
}

export default AddBOMModal;


export function AddBOMModal2({ show, onHide , product_in}) {
    const instance = axios.create({ baseURL: 'http://localhost:5000/api/avm' });

    const [formData, setFormData] = useState({
        products: [{
            product_id: product_in.product_id,
            product_second_name: product_in.product_name,
            product_second_id: '',
            product_second_quantity: '',
            update_user: '',
            update_time: '',
        }], // Store an array of products with initial empty product
    });

    const handleInputChange = (e, index) => {
        const { name, value } = e.target;
        const updatedProducts = [...formData.products];
        updatedProducts[index][name] = value;
        setFormData({
            ...formData,
            products: updatedProducts,
        });
    };

    const handleAddProduct = () => {
        // Add a new empty product object to the array
        setFormData({
            ...formData,
            products: [...formData.products, {
                product_first_id: product_in.product_id,
                product_second_name: product_in.product_name,
                product_second_id: '',
                product_second_quantity: '',
                update_user: '',
                update_time: '',
            }],
        });
    };

    const CleanForm = () => {
        setFormData({
            products: [{
                product_first_id: product_in.product_id,
                product_second_name: product_in.product_name,
                product_second_id: '',
                product_second_quantity: '',
                update_user: '',
                update_time: '',
            }],
        });
        onHide();
    };

    const handleAddBOM = async (e) => {
        e.preventDefault();
        // Loop through the products array and send each product data to the backend
        for (const product of formData.products) {
            if (
                product.product_second_name === '' ||
                product.product_second_id === '' ||
                product.product_second_quantity === '' 
            ) {
                alert('請填寫完整的產品資訊');
                return;
            }
            // Set update time for each product
            product.update_time = moment(new Date()).format('YYYY-MM-DD HH:mm:ss');
        }

        // Send all products to the backend
        for (const product of formData.products) {
            // 將product_id 設成 product_in.product_id
            product.product_first_id = product_in.product_id;
            // 將product_name 設成 product_in.product_name
            product.product_second_name = product_in.product_name;
            console.log('新增 BOM 第二階', product);
            instance.post('/add_bom_second', {ID:JSON.stringify(product)})
                .then((response) => {
                    console.log('新增成功', response.data);
                    alert('新增成功');
                    CleanForm();
                })
                .catch((error) => {
                    alert('新增失敗，請稍後再試');
                    console.error('新增失敗', error);
                });
        }
    };

    return (
        <Modal show={show} onHide={onHide}>
            <Modal.Header closeButton>
                <Modal.Title>新增 {product_in.product_name} BOM 第二階 </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {formData.products.map((product, index) => (
                    <Form key={index}>
                        <Card>
                        <div class="container px-4">
                        <label class="col-sm-2 col-form-label col-form-label-lg">產品 {index + 1} </label>
                        <Form.Group controlId={`product_second_name_${index}`} class="col-sm-10 center">
                            <Form.Label>二階產品名稱</Form.Label>
                            <Form.Control
                                type="text"
                                name="product_second_name"
                                value={product.product_second_name}
                                onChange={(e) => handleInputChange(e, index)}
                            />
                        </Form.Group>
                        <Form.Group controlId={`product_second_id_${index}`} class="col-sm-10 center">
                            <Form.Label>二階產品代碼</Form.Label>
                            <Form.Control
                                type="text"
                                name="product_second_id"
                                value={product.product_second_id}
                                onChange={(e) => handleInputChange(e, index)}
                            />
                        </Form.Group>
                        <Form.Group controlId={`product_second_quantity_${index}`} class="col-sm-10 center">
                            <Form.Label>使用數量</Form.Label>
                            <Form.Control
                                type="text"
                                name="product_second_quantity"
                                value={product.product_second_quantity}
                                onChange={(e) => handleInputChange(e, index)}
                            />
                        </Form.Group>
                        <br></br>
                        </div>
                        </Card>
                       
                    </Form>
                ))}
                <br></br>
                <Button variant="primary" onClick={handleAddProduct}>
                    新增二階產品
                </Button>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={CleanForm}>
                    取消
                </Button>
                <Button variant="primary" onClick={handleAddBOM}>
                    新增
                </Button>
            </Modal.Footer>
        </Modal>
    );
}

