import cv2, json, os
from pyzbar.pyzbar import decode
from dotenv import load_dotenv
from eth_account.messages import encode_defunct
from web3 import Web3

#load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env'))

print("Opening camera, press q to quit")
cap = cv2.VideoCapture(0)
while True:
    ret, frame = cap.read()
    if not ret: break
    for bar in decode(frame):
        try:
            payload = json.loads(bar.data.decode())
            print("QR payload:", payload)
        except Exception as e:
            print("Invalid QR data:", e)
    cv2.imshow("QR Scanner", frame)
    if cv2.waitKey(1) & 0xFF == ord('q'):
        break
cap.release()
cv2.destroyAllWindows()



w3 = Web3(Web3.HTTPProvider(os.getenv("RPC_URL")))
abi = json.load(open("ReserveSBT_abi.json"))
contract = w3.eth.contract(address=os.getenv("CONTRACT_ADDR"), abi=abi)
