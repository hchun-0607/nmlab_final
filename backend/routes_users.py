# Users/routes.py
from flask import Blueprint, request, jsonify, current_app
import os, json, random
import uuid, time

from Crypto.PublicKey import ECC
from Crypto.Signature import DSS
from Crypto.Hash import SHA256
from tinydb import TinyDB, Query


from connection import(
    find_user_by_account,
    create_user,
    update_user_password,
    send_otp_to_phone,
    verify_phone_code
)

users_bp = Blueprint('users_bp', __name__, url_prefix='/api/avm/users')

db = TinyDB('db.json')
User = Query()
phone_db = db.table('phone_codes')
Phone = Query()
nonce_db = db.table('nonces')
Nonce = Query()
bookings_db = db.table('bookings')
Booking = Query()

issuer_key_file = os.path.join(current_app.root_path, 'issuer_key.pem')
if os.path.exists(issuer_key_file):
    with open(issuer_key_file, 'rb') as f:
        issuer_key = ECC.import_key(f.read())
else:
    # 如果沒有 issuer_key.pem，則生成一個新的 ECC 金鑰
    issuer_key = ECC.generate(curve='P-256')
    with open(issuer_key_file, 'wb') as f:
        f.write(issuer_key.export_key(format='PEM'))
issuer_did = 'did:example:issuer'        
        
def sign_vc(vc_json, private_key):
    payload = json.dumps(vc_json, sort_keys=True).encode('utf-8')
    hash_obj = SHA256.new(payload)
    signer = DSS.new(private_key, 'fips-186-3')
    sig = signer.sign(hash_obj)
    return sig.hex()


@users_bp.route('/check_user', methods=['POST'])
def check_user():
    data = request.get_json()
    account = data.get('account')
    password = data.get('password')
    result = find_user_by_account(account)
    if not result :
        return jsonify({"status": "使用者不存在", "message" : "帳號不存在"}), 404
    
    user = result[0]
    if user.get('password') != password:
        return jsonify({"status": "密碼錯誤", "message" : "密碼錯誤"}), 401
    
    return jsonify({
        "status": "成功登入",
        "userdata": {
            "Account": user.get("account"),
            "Username": user.get("username"),
            "Email": user.get("email")
        }
    }), 200

@users_bp.route('/add_user', methods=['POST'])
def add_user():
    data = request.get_json()
    Account = data.get('account')
    Password = data.get('password')
    Username = data.get('username')
    Email = data.get('email')
    passkey = data.get('passkey', None)
    

    if not all([Account, Password, Username, Email]):
        return jsonify({"error": "資料不完整"}), 400
    
    if(find_user_by_account(Account)):
        return jsonify({"error": "帳號已存在"}), 400
    
    create_user(Account, Password, Username, Email, passkey,publickey,did)
    
    return jsonify({"message": "使用者新增成功"}), 200

    # base_dir = os.path.join(current_app.root_path, 'Users')
    # os.makedirs(base_dir, exist_ok=True)

    # user_folder = os.path.join(base_dir, Account)
    # if os.path.exists(user_folder):
    #     return jsonify({"error": "帳號已存在"}), 400
    # os.makedirs(user_folder)

    # user_info = {
    #     "Account": Account,
    #     "Password": Password,
    #     "Username": Username,
    #     "Email": Email
    # }
    # info_path = os.path.join(user_folder, 'info.txt')
    # with open(info_path, 'w', encoding='utf-8') as f:
    #     json.dump(user_info, f, indent=4, ensure_ascii=False)

    # return jsonify({"message": "註冊成功"}), 200

@users_bp.route('/send_verification_code', methods=['POST'])
def send_verification_code():
    print("[模擬簡訊] 收到驗證碼請求")
    data = request.get_json()
    phone = data.get('phone')
    
    if not phone:
        return jsonify({'success': False, 'message': '請提供手機號碼'}), 400

    existing = verify_phone_code(phone, 'verified') # 檢查是否已經驗證過
    if existing and existing[0].get('code') == 'verified':
        return jsonify({'success': False, 'message': '此號碼已被使用，請重新輸入'})

    otp = send_otp_to_phone(phone)  # 產生 OTP 並存入 phone_db

    print(f"[模擬簡訊] 驗證碼已發送至 {phone}，驗證碼為 {otp}")
    return jsonify({'success': True, 'message': '驗證碼已發送'})

@users_bp.route('/check_verification_code', methods=['POST'])
def check_verification_code():
    data = request.get_json()
    phone = data.get('phone')
    code = data.get('code')

    if not code:
        return jsonify({'success': False, 'message': '驗證碼缺失'}), 400

    if not verify_phone_code(phone, code):
        return jsonify({'success': False, 'message': '驗證碼錯誤或已過期'}), 400
    print(f"[模擬簡訊] 驗證碼 {code} 已驗證成功")
    
    key = ECC.generate(curve='P-256')
    did = f'did:example:{str(uuid.uuid4())}'
    db.update({'holder_did': did}, User.phone == phone)##用phone還是account? 
    
    vc = {
      '@context': ['https://www.w3.org/2018/credentials/v1'],
      'id': f'urn:uuid:{uuid.uuid4()}',
      'type': ['VerifiableCredential','UserCredential'],
      'issuer': issuer_did,
      'issuanceDate': time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime()),
      'credentialSubject': {
         'id': did,
         'phoneHash': SHA256.new((phone+'salt').encode()).hexdigest(),
         'registeredAt': time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime())
      }
    }
    vc['proof'] = {
      'type': 'EcdsaSecp256r1Signature2019',
      'verificationMethod': issuer_did+'#key-1',
      'proofPurpose': 'assertionMethod',
      'created': vc['issuanceDate'],
      'jws': sign_vc(vc, issuer_key)
    }
    db.update({'vc': vc}, User.phone == phone)  # 更新使用者的 VC 資訊
    return jsonify({
        'success': True,
        'message': '驗證碼正確',
        'did': did,
        'vc': vc
    }), 200
    

    



@users_bp.route('/reset_password', methods=['POST'])
def reset_password():
    data = request.get_json()
    account = data.get('Account')
    new_password = data.get('Password')
    if not find_user_by_account(account):
        return jsonify({"error": "帳號不存在"}), 404
    update_user_password(account, new_password)
    return jsonify({"message": "密碼已重設，請重新登入"}), 200
