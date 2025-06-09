#!/usr/bin/env python3
import os
from reservation_wrapper import mint, return_reservation, buy, get_available, info
from web3 import Web3

# 1. 先加载 .env
from dotenv import load_dotenv
load_dotenv()

w3 = Web3(Web3.HTTPProvider(os.getenv("RPC_URL")))
assert w3.is_connected(), "连链失败"

OWNER = os.getenv("OWNER_ADDR")
assert OWNER, "请在 .env 填 OWNER_ADDR"

print("初始可购列表：", get_available())

# 2. mint 一笔
print("\n==> Mint 1 to", OWNER)
tx = mint(OWNER, slot_id=100, deposit_eth=0.01)
print("Tx hash:", tx)
receipt = w3.eth.wait_for_transaction_receipt(tx)
print("Mint status:", receipt.status)
assert receipt.status == 1

# 3. 查询 info
data = info(1)
print("Info(1):", data)
assert data["owner"].lower() == OWNER.lower()
assert data["slot"] == 100

# 4. return
print("\n==> Return token 1")
tx_ret = return_reservation(1)
print("Return tx:", tx_ret)
w3.eth.wait_for_transaction_receipt(tx_ret)
print("Available now:", get_available())

# 5. buy
print("\n==> Buy returned token 1")
tx_buy = buy(1)
print("Buy tx:", tx_buy)
w3.eth.wait_for_transaction_receipt(tx_buy)
print("Available after buy:", get_available())

print("\n✅ 全部操作完成且成功！")
