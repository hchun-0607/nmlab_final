import os
from Crypto.PublicKey import ECC

# 假設 routes_users.py 跟 issuer_key.pem 同資料夾
_module_dir = os.path.dirname(os.path.abspath(__file__))
_issuer_key_file = os.path.join(_module_dir, 'issuer_key.pem')

# 讀私鑰
with open(_issuer_key_file, 'rb') as f:
    issuer_key = ECC.import_key(f.read())

# 固定的 DID
issuer_did = 'did:example:issuer'

