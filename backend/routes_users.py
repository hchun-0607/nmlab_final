# Users/routes.py
from flask import Blueprint, request, jsonify, current_app
import os, json, random
import uuid, time
from voice_to_mp3 import word_to_json

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
from web3 import Web3

users_bp = Blueprint('users_bp', __name__, url_prefix='/api/avm/users')

db = TinyDB('db.json')
users_db = db.table('users')
User = Query()
phone_db = db.table('phone_codes')
Phone = Query()
nonce_db = db.table('nonces')
Nonce = Query()
bookings_db = db.table('bookings')
Booking = Query()

_module_dir = os.path.dirname(os.path.abspath(__file__))
_issuer_key_file = os.path.join(_module_dir, 'issuer_key.pem')
with open(_issuer_key_file, 'rb') as f:
    issuer_key = ECC.import_key(f.read())
    
issuer_did = 'did:example:issuer'  # 固定的 DID
w3 = Web3()
#issuer_key, issuer_did = gernerate_isser_key()     
        
def sign_vc(vc_json, private_key):
    payload = json.dumps(
        {k: vc_json[k] for k in vc_json if k != 'proof'},
        sort_keys=True
    ).encode('utf-8')
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
        return jsonify({"status": "使用者不存在", "message" : "帳號不存在"})
    
    user = result[0]
    if user.get('password') != password:
        return jsonify({"status": "密碼錯誤", "message" : "密碼錯誤"})
    
    return jsonify({
        "status": "成功登入",
        "userdata": {
            "Account": user.get("account"),
            "Username": user.get("username"),
            "Email": user.get("email"),
            "Password": user.get("password"),
            "Phone": user.get("phone"),
            "Wallet":   user.get("wallet_address"),
            "Did":user.get("did"),
            "CredDid":user.get("credid")
        }
    }), 200

@users_bp.route('/add_user', methods=['POST'])
def add_user():
    data = request.get_json()
    print(data)
    Account = data.get('account')
    Password = data.get('password')
    Username = data.get('username')
    Email = data.get('email')
    passkey = data.get('passkey', None)
    publickey = data.get('publickey', None)
    did = data.get('did', None)
    credid = data.get('credid', None)

    

    if not all([Account, Password, Username, Email]):
        return jsonify({"error": "資料不完整"}), 400
    
    if(find_user_by_account(Account)):
        return jsonify({"error": "帳號已存在"}), 400
    
    acct            = w3.eth.account.create()
    wallet_address  = acct.address           # 公鑰地址 (0x...)
    private_key_hex = acct.key.hex()         # 私鑰 hex 字串
    # create_user(Account, Password, Username, Email, passkey, publickey, did, credid)
    
    create_user(Account, Password, Username, Email, passkey,publickey,did, credid, wallet_address, private_key_hex)
    
    users_db.update(
        {
            'wallet_address': wallet_address,
            'private_key':    private_key_hex
        },
        User.account == Account
    )
    
    return jsonify({
        "message":        "使用者新增成功",
        "wallet_address": wallet_address
    }), 200

    

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
    
    users = db.table('users')
    users.update({'holder_did': did}, User.phone == phone)  # 更新使用者的 DID 資訊

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

@users_bp.route('/verify_presentation', methods=['POST'])
def verify_presentation():
    vp = request.get_json()
    print(vp)
    
    record = nonce_db.get(Query().challenge == vp.get('challenge'))
    if not record or record['expired_at'] < time.time():
        return jsonify({'success': False, 'message': '無效或過期的挑戰碼'}), 400
    nonce_db.remove(Query().challenge == vp.get('challenge'))  # 驗證後刪除挑戰碼
    
    holder_signature = vp.get('holder_signature')
    if not holder_signature or not verify_holder_signature(vp, holder_signature):
        return jsonify({'success': False, 'message': '簽名驗證失敗'}), 400
    
    vcs = vp.get('verifiableCredential', [])
    for vc in vcs:
        if not verify_vc(vc):
            return jsonify({'success': False, 'message': 'VC 驗證失敗'}), 400
    return jsonify({'success': True, 'message': '驗證成功'}), 200

@users_bp.route('/request_challenge', methods=['GET'])
def request_challenge():
    """產生一個新的挑戰碼"""
    challenge = str(uuid.uuid4())
    nonce_db.insert({'challenge': challenge, 'expired_at': time.time() + 300})  # 5 分鐘有效
    return challenge

@users_bp.route('/analyze_words', methods=['POST'])
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
def verify_holder_signature(vp_json: dict, holder_signature_hex: str) -> bool:
    holder_did = vp_json.get('holder_did')
    user = users_db.get(User.did == holder_did)
    if not user or 'publickey' not in user:
        return False
    public_key = ECC.import_key(user['publickey'].encode('utf-8'))
    payload = json.dumps(
        {k: vp_json[k] for k in vp_json if k != 'holder_signature'},
        sort_keys=True
    ).encode('utf-8')
    hash_obj = SHA256.new(payload)
    verifier = DSS.new(public_key, 'fips-186-3')
    sig = bytes.fromhex(holder_signature_hex)
    try:
        verifier.verify(hash_obj, sig)
        return True
    except ValueError:
        return False
    
def verify_vc(vc: dict) -> bool:
    proof = vc.pop('proof', None)
    if not proof or 'type' not in proof or 'jws' not in proof:
        return False
    payload = json.dumps(vc, sort_keys=True).encode('utf-8')
    hash_obj = SHA256.new(payload)
        
    public_key = issuer_key.public_key()
    verifier = DSS.new(public_key, 'fips-186-3')
    sig = bytes.fromhex(proof['jws'])
    try:
        verifier.verify(hash_obj, sig)
        return True
    except ValueError:
        return False
