# app.py
from flask import Flask
from flask_cors import CORS

# 把 users、restaurants 的 routes Blueprint 都 import 進來
from routes_users import users_bp
from routes_restaurant import restaurants_bp

app = Flask(__name__)
CORS(app)

# 註冊 Blueprint：URL prefix 都是 /api/avm，底下就對應到不同的 endpoint
app.register_blueprint(users_bp)
app.register_blueprint(restaurants_bp)

if __name__ == '__main__':
    app.run(port=5000, debug=True)
# app.py