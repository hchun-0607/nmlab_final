import cv2, json, os
from pyzbar.pyzbar import decode
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env'))

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
