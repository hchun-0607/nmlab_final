# backend/connection.py
import random
from tinydb import TinyDB, Query
from flask import Flask, request, jsonify
from flask_cors import CORS
from tinydb.storages import JSONStorage
from tinydb.middlewares import CachingMiddleware
from voice_to_mp3 import word_to_json


db = TinyDB('db.json')
User = Query()
phone_db = db.table('phone_codes')
Phone = Query()
restaurants_table = db.table('restaurants') 
Restaurants = Query()

def read_info_as_dict(filepath):
    """
    讀取指定路徑的 JSON 檔案，並回傳 Python dict。
    """
    with open(filepath, 'r', encoding='utf-8') as f:
        for line in f:
            if ':' in line:
                key, value = line.strip().split(':', 1)
                info_dict[key.strip()] = value.strip()
    return info_dict

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
        "account": account,
        "password": password,
        "username": username,
        "email": email,
        "passkey": passkey,
        "public_key": public_key,
        "did": did,
        
    }
    return db.insert(user_info)

def update_user_password(account, new_password):
    """修改某個帳號的密碼，回傳更新筆數"""
    return db.update({'password': new_password}, User.account == account)

def send_otp_to_phone(phone):
    """產生 OTP 並存入 phone_db，回傳 otp (純模擬)"""
    otp = str(random.randint(100000, 999999))
    existing = phone_db.search(Phone.phone == phone)
    if existing:
        phone_db.update({'code': otp}, Phone.phone == phone)
    else:
        phone_db.insert({'phone': phone, 'code': otp})
    return otp

def verify_phone_code(phone, code):
    """檢查 OTP 是否正確，正確後把該筆 code 更新成 'verified'"""
    entry = phone_db.search(Phone.phone == phone)
    if not entry:
        return False  # 尚未請求驗證碼
    if entry[0]['code'] == code:
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
    data = [
        {"restaurant_id": 1, "name": "幸福餐廳", "hours": "11:00 - 22:00", "rating": 4.3, "price": 3},
        {"restaurant_id": 2, "name": "美味小館", "hours": "10:00 - 20:00", "rating": 4.7, "price": 2},
    ]
    return jsonify(data)
        

@app.route('/analyze_words', methods=['POST'])
def analyze_words():
    data = request.get_json()
    print(data)
    text = data.get('text', '')
    # 做分析，例如 NLP 處理或關鍵字比對
    print(text)
    result = word_to_json(text)
    if all(result.get(key) for key in ['restaurant_name', 'date', 'time', 'number_of_people']):
        return jsonify({'success': True, 'message': '辨識辨識成功', 'result':result})
    else:
        return jsonify({'success': False, 'message': '辨識錯誤'}), 400

if __name__ == '__main__':
    app.run(port=5000, debug=True)
