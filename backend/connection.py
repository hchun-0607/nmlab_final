# connection.py
import json
import random
import re
from tinydb import TinyDB, Query
from flask import Flask, request, jsonify
from flask_cors import CORS
from tinydb.storages import JSONStorage
from tinydb.middlewares import CachingMiddleware


app = Flask(__name__)
CORS(app)  # 允許跨來源請求（CORS）
db = TinyDB('db.json')
User = Query()
phone_db = db.table('phone_codes')  # 建立一個獨立的「手機驗證碼」表格
Phone = Query()
restaurants_table = db.table('restaurants') 
Restaurants = Query()

@app.route('/check_user', methods=['POST'])
def check_user():
    data = request.get_json()
    user_account = data.get('account')  
    user_password = data.get('password')  
    print("Raw ID from frontend:", user_account)

    result = db.search(User.account == user_account)
    print(db)
    # user_dir = os.path.join("Users", user_account)
    # info_file = os.path.join(user_dir, "info.txt")

    if not result:
        return jsonify({
            "status": "使用者不存在",
            "message": "此帳號不存在"
        })
        
    else:
        user = result[0]
        if user.get('password') != user_password:
            return jsonify({"status": "密碼有誤，請重新輸入", "message": "User not found"})
        else :
            return jsonify({"status": "成功登入", "userdata": result[0]  # TinyDB 傳回是 list
        })
        


@app.route('/add_user', methods=['POST'])
def add_user():
    data = request.get_json()
    print("Received data:", data)
    Account = data.get('account')
    Password = data.get('password')
    Username = data.get('username')
    Phone = data.get('phone')
    Email = data.get('email')
    Passkey = data.get('passkey')

    if not all([Account, Password, Username, Email, Passkey]):
        return jsonify({"error": "資料不完整"}), 400

    existing_user = db.search(User.account == Account)
    if existing_user:
        return jsonify({"error": "帳號已存在"}), 400


    user_info = {
        "account": Account,
        "password": Password,
        "username": Username,
        "email": Email,
        "phone":Phone,
        "passkey":Passkey,
        
    }

    insert_result = db.insert(user_info)
    if insert_result:
        return jsonify({"message": "註冊成功"}), 200
    else:
        return jsonify({"message": "註冊失敗"}), 500


@app.route('/send_verification_code', methods=['POST'])
def send_verification_code():
    data = request.get_json()
    phone = data.get('phone')
    if not phone:
        return jsonify({'success': False, 'message': '請提供手機號碼'}), 400
    
    existing = phone_db.search(Phone.phone == phone)
    if existing and existing[0].get('code') == 'verified':
        return jsonify({'success': False, 'message': '此號碼已被使用，請重新輸入'})
    
    otp = str(random.randint(100000, 999999))

    # 更新或新增
    if existing:
        phone_db.update({'code': otp}, Phone.phone == phone)
    else:
        phone_db.insert({'phone': phone, 'code': otp})

    print(f"[模擬簡訊] 驗證碼已發送至 {phone}，驗證碼為 {otp}")

    return jsonify({'success': True, 'message': '驗證碼已發送'})

@app.route('/check_verification_code', methods=['POST'])
def check_verification_code():
    data = request.get_json()
    phone = data.get('phone')
    code = data.get('code')
    print(phone+code)

    if not code:
        return jsonify({'success': False, 'message': '驗證碼缺失'}), 400

    entry = phone_db.search(Phone.phone == phone)
    if not entry:
        return jsonify({'success': False, 'message': '尚未請求驗證碼'}), 400

    expected_code = entry[0]['code']
    if expected_code == code:
        # 更新驗證碼狀態為 verified
        phone_db.update({'code': 'verified'}, Phone.phone == phone)
        return jsonify({'success': True, 'message': '驗證成功', 'phone':phone})
    else:
        return jsonify({'success': False, 'message': '驗證碼錯誤'}), 400
    
@app.route('/reset_password', methods=['POST'])
def reset_password():
    data = request.get_json()
    print("Received data:", data)

    account = data.get('Account')
    new_password = data.get('Password')
   
    user_list = db.search(User.account == account)
    if not user_list:
        return jsonify({'success': False, 'message': "此帳戶不存在"})

    # 修改密碼
    db.update({'password': new_password}, User.account == account)
    return jsonify({'success': True, 'message': "修改成功，請重新登入"})

@app.route('/get_restaurants', methods=['GET'])
def get_restaurants():
    print("in")
    data = restaurants_table.all()
    return jsonify(data)    

if __name__ == '__main__':
    app.run(port=5000, debug=True)
