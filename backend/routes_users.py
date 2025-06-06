# Users/routes.py
from flask import Blueprint, request, jsonify, current_app
import os, json
from connection import read_info_as_dict   # 從 connection.py 取得共用函式

users_bp = Blueprint('users', __name__, url_prefix='/api/avm')

@users_bp.route('/check_user', methods=['POST'])
def check_user():
    data = request.get_json()
    account = data.get('account')
    password = data.get('password')

    user_dir = os.path.join(current_app.root_path, 'Users', 'data', account)
    info_file = os.path.join(user_dir, 'info.txt')

    if os.path.isdir(user_dir) and os.path.isfile(info_file):
        try:
            info_data = read_info_as_dict(info_file)
        except json.JSONDecodeError:
            return jsonify({"status": "伺服器讀取使用者檔案失敗"}), 500

        if password == info_data.get("Password"):
            filtered = {
                "Account": info_data.get("Account"),
                "Username": info_data.get("Username"),
                "Email": info_data.get("Email"),
            }
            return jsonify({"status": "成功登入", "userdata": filtered})
        else:
            return jsonify({"status": "密碼錯誤"}), 401
    else:
        return jsonify({"status": "使用者不存在"}), 404

@users_bp.route('/add_user', methods=['POST'])
def add_user():
    data = request.get_json()
    Account = data.get('account')
    Password = data.get('password')
    Username = data.get('username')
    Email = data.get('email')

    if not all([Account, Password, Username, Email]):
        return jsonify({"error": "資料不完整"}), 400

    base_dir = os.path.join(current_app.root_path, 'Users')
    os.makedirs(base_dir, exist_ok=True)

    user_folder = os.path.join(base_dir, Account)
    if os.path.exists(user_folder):
        return jsonify({"error": "帳號已存在"}), 400
    os.makedirs(user_folder)

    user_info = {
        "Account": Account,
        "Password": Password,
        "Username": Username,
        "Email": Email
    }
    info_path = os.path.join(user_folder, 'info.txt')
    with open(info_path, 'w', encoding='utf-8') as f:
        json.dump(user_info, f, indent=4, ensure_ascii=False)

    return jsonify({"message": "註冊成功"}), 200
