# backend/connection.py
import random
from tinydb import TinyDB, Query

db = TinyDB('db.json')
User = Query()
phone_db = db.table('phone_codes')
Phone = Query()

def find_user_by_account(account):
    """回傳 list(符合條件的 user dict)，或空 list"""
    return db.search(User.account == account)

def create_user(account, password, username, email, passkey,public_key, did, credid, wallet_address, private_key_hex, phone):
    """新增使用者到 TinyDB，回傳 insert_id 或 None"""
    user_info = {
        "account": account,
        "password": password,
        "username": username,
        "email": email,
        "passkey": passkey,
        "public_key": public_key,
        "did": did,
        "phone":phone,
        "wallet_address":"0xc8cf4A387217abb2878808A3b21f24b79EF83B9e",
        "private_key_hex":private_key_hex,
        "credid":credid,
        
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
        return True
    return False

# 其他共用的 DB helper function 也都放這裡就好
