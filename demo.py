# signup_and_reserve.py
from web3 import Web3
from python_dotenv import load_dotenv
import reservation_wrapper as rs
import os

# 1. 讀環境變數 (裡面已經有餐廳合約、RPC、OWNER PK 等設定)
load_dotenv()

# 2. 當使用者註冊時，幫他生成一組新錢包
acct = Web3().eth.account.create()  
user_private_key = acct.key.hex()     # 新私鑰
user_address     = acct.address       # 新地址

# 3. （可選）把私鑰＋地址存到你們後端資料庫

# 4. 用他的新錢包去呼叫合約：mint 一筆訂位 NFT
#    假設 slot_id = 202506081830, deposit = 0.02 ETH
tx_hash = rs.mint(
    guest=user_address,
    slot_id=202506081830,
    deposit_eth=0.02
)
print("訂位交易已送出，tx hash =", tx_hash)

# 5. 查詢目前可購買清單
available = rs.get_available()
print("目前可買 tokenId =", available)
