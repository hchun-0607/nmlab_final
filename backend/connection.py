from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import os
import json

app = Flask(__name__)
CORS(app)  # 允許跨來源請求（CORS）

def read_info_as_dict(filepath):
    info_dict = {}
    with open(filepath, 'r', encoding='utf-8') as f:
        for line in f:
            if ':' in line:
                key, value = line.strip().split(':', 1)
                info_dict[key.strip()] = value.strip()
    return info_dict

@app.route('/api/avm/check_user', methods=['POST'])
def check_user():
    data = request.get_json()

    # 從前端取得的資料：
    user_account = data.get('account')  
    print("Raw ID from frontend:", user_account)
   
    user_dir = os.path.join("Users", user_account)
    info_file = os.path.join(user_dir, "info.txt")

    if os.path.isdir(user_dir) and os.path.isfile(info_file):
        info_data = read_info_as_dict(info_file)
        return jsonify({"status": "成功登入", "userdata": info_data})
    else:
        return jsonify({"status": "密碼有誤，請重新輸入", "message": "User not found"})


@app.route('/api/avm/add_user', methods=['POST'])
def add_user():
    data = request.get_json()
    print("Received data:", data)
    Account = data.get('account')
    Password = data.get('password')
    Username = data.get('username')
    Email = data.get('email')

    if not all([Account, Password, Username, Email]):
        return jsonify({"error": "資料不完整"}), 400

    # 確保有 User 資料夾
    user_dir = os.path.join(os.getcwd(), 'Users')
    os.makedirs(user_dir, exist_ok=True)

    # 建立以帳號名稱為名的子資料夾
    user_folder_path = os.path.join(user_dir, Account)
    if not os.path.exists(user_folder_path):
        os.makedirs(user_folder_path)
    else:
        return jsonify({"error": "帳號已存在"}), 400

    # 準備存的資料
    user_info = {
        "Account": Account,
        "Password": Password,  # 注意：實際上不要用明碼存密碼！
        "Username": Username,
        "Email": Email
    }

    # 存到 info.txt
    info_path = os.path.join(user_folder_path, 'info.txt')
    with open(info_path, 'w', encoding='utf-8') as f:
        json.dump(user_info, f, indent=4, ensure_ascii=False)

    return jsonify({"message": "註冊成功"}), 200


if __name__ == '__main__':
    app.run(port=5000, debug=True)
