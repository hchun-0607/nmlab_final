# Restaurants/routes.py
from flask import Blueprint, request, jsonify, current_app
import os, json, time, random, string, shutil
from tinydb import TinyDB, Query
import datetime


db = TinyDB('db.json')
restaurants_bp = Blueprint('restaurants_bp', __name__, url_prefix='/api/avm/restaurants')
restaurants_table = db.table('restaurants') 
Restaurants = Query()
availability_table = db.table('availability') 
reservations_table = db.table('reservations')
Restaurants = Query()


def read_info_as_dict(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        return json.load(f)

@restaurants_bp.route('/add_restaurant', methods=['POST'])
def add_restaurant():
    data = request.get_json()
    name = data.get('name')
    description = data.get('description')
    category = data.get('category')
    if not all([name, description]):
        return jsonify({"error": "資料不完整，至少需要 name 和 description"}), 400

    ts = int(time.time() * 1000)
    rand = ''.join(random.choices(string.ascii_lowercase + string.digits, k=4))
    restaurant_id = f"r{ts}{rand}"

    base_dir = os.path.join(current_app.root_path, 'Restaurants')
    os.makedirs(base_dir, exist_ok=True)
    restaurant_folder = os.path.join(base_dir, restaurant_id)
    os.makedirs(restaurant_folder)

    restaurant_info = {
        "restaurant_id": restaurant_id,
        "name": name,
        "description": description,
        "category": category
    }
    info_path = os.path.join(restaurant_folder, 'info.txt')
    with open(info_path, 'w', encoding='utf-8') as f:
        json.dump(restaurant_info, f, indent=4, ensure_ascii=False)

    return jsonify({"message": "餐廳新增成功", "restaurant_id": restaurant_id}), 200

@restaurants_bp.route('/get_restaurants', methods=['GET'])
def get_restaurants():
    print("in")
    data = restaurants_table.all()
    return jsonify(data)    

# routes_reservations.py
from flask import Blueprint, request, jsonify
from tinydb import TinyDB




@restaurants_bp.route('/add_reservation', methods=['POST'])
def add_reservation():
    data = request.get_json()
    
    required_fields = [
        'restaurant_id', 'restaurant_name', 'date', 'time', 'people',
        'reserver_name', 'reserver_account', 'reserver_adress',
        'reserver_phone', 'reserver_email', 'VP', 'wallet_address', 'deposit'
    ]
    
    # 檢查必填欄位
    for field in required_fields:
        if field not in data:
            return jsonify({'error': f'缺少欄位：{field}'}), 400

    # 存入 DB
    reservations_table.insert(data)
    return jsonify({'message': '預約資料已儲存'}), 200

# 其餘 get_restaurant、update_restaurant、delete_restaurant 與之前示範相同

@restaurants_bp.route('/get_availability/<restaurant_id>/<date>', methods=['GET'])
def get_availability(restaurant_id, date): #to frontend
    # 餐廳根目錄
    base_dir = os.path.join(current_app.root_path, 'Restaurants', restaurant_id)
    if not os.path.isdir(base_dir):
        return jsonify({"error": "餐廳不存在"}), 404

    avail_file = os.path.join(base_dir, 'availability.json')
    if not os.path.isfile(avail_file):
        # 尚未設定任何預約，或尚未營業
        return jsonify({
            "date": date,
            "open": None,
            "close": None,
            "capacity": None,
            "booked_intervals": []
        }), 200

    try:
        availability = read_info_as_dict(avail_file)
    except:
        return jsonify({"error": "伺服器讀取檔案失敗"}), 500

    # 如果當天沒有營業資料，就回空
    day_data = availability.get(date)
    if not day_data:
        return jsonify({
            "date": date,
            "open": None,
            "close": None,
            "capacity": None,
            "booked_intervals": []
        }), 200

    # 成功回傳當日資訊
    return jsonify({
        "date": date,
        "open": day_data["open"],
        "close": day_data["close"],
        "capacity": day_data["capacity"],
        "booked_intervals": day_data.get("booked_intervals", [])
    }), 200
    
    
@restaurants_bp.route('/book_any_time', methods=['POST'])
def book_any_time():
    data = request.get_json()
    rid = data.get('restaurant_id')
    date = data.get('date')
    start_hour = data.get('start_hour')         # float，例如 13.0
    duration = data.get('duration_hours')       # float，例如 1.5

    # 1. 檢查參數完整度
    if not all([rid, date, start_hour, duration]):
        return jsonify({"error": "參數不完整"}), 400

    # 2. 確認該餐廳存在
    base_dir = os.path.join(current_app.root_path, 'Restaurants', rid)
    if not os.path.isdir(base_dir):
        return jsonify({"error": "餐廳不存在"}), 404

    # 3. 讀取 availability.json
    avail_file = os.path.join(base_dir, 'availability.json')
    if not os.path.isfile(avail_file):
        return jsonify({"error": "該日餐廳不營業或尚未設定"}), 400

    try:
        availability = read_info_as_dict(avail_file)
    except:
        return jsonify({"error": "伺服器讀取失敗"}), 500

    day_data = availability.get(date)
    if not day_data:
        return jsonify({"error": "該日餐廳不營業"}), 400

    open_h = float(day_data["open"])
    close_h = float(day_data["close"])
    capacity = int(day_data["capacity"])
    booked = day_data.get("booked_intervals", [])

    # 4. 確認新區間 [start_hour, end_hour) 在營業時間內
    end_hour = start_hour + float(duration)
    if start_hour < open_h or end_hour > close_h:
        return jsonify({"error": "超出營業時間"}), 400

    # 5. 計算新區間與已訂區間的重疊筆數
    overlap_count = 0
    for iv in booked:
        s2 = float(iv["start"])
        e2 = float(iv["end"])
        if intervals_overlap(start_hour, end_hour, s2, e2):
            overlap_count += 1
        if overlap_count >= capacity:
            break

    if overlap_count >= capacity:
        return jsonify({"error": "該時段已客滿"}), 409

    # 6. 沒滿，允許預約：把新區間加入 booked_intervals
    booked.append({"start": start_hour, "end": end_hour})
    day_data["booked_intervals"] = booked
    availability[date] = day_data

    # 7. 寫回 availability.json
    try:
        with open(avail_file, 'w', encoding='utf-8') as f:
            json.dump(availability, f, indent=4, ensure_ascii=False)
    except Exception as e:
        return jsonify({"error": f"伺服器寫入失敗：{str(e)}"}), 500

    # 8. 回傳成功與剩餘可用量
    return jsonify({
        "status": "預約成功",
        "start": start_hour,
        "end": end_hour,
        "remaining": capacity - (overlap_count + 1)
    }), 200

def intervals_overlap(s1, e1, s2, e2):
   return not (e1 <= s2 or e2 <= s1)

@restaurants_bp.route('/get_all_availability', methods=['GET'])
def get_all_availability():
    
    print("get_all_availability called")
    today = datetime.date.today()
    dates = [(today + datetime.timedelta(days=i)).strftime('%Y-%m-%d') for i in range(7)]
    
    slot_length = 0.5  # 時段長度，單位小時
    all_availability = []
    for restaurant in restaurants_table.all():
        restaurant_id = restaurant['restaurant_id']
        open_h = float(restaurant['open'])
        close_h = float(restaurant['close'])
        capacity = int(restaurant['capacity'])
        rating = float(restaurant.get('rating', 0))
        rest_type = restaurant['type']
        price = restaurant['price']
        location = restaurant['location']
        
        weekly = []
        for date in dates:
            rec = availability_table.search(
                (Restaurants.restaurant_id == restaurant_id) &
                (Restaurants.date == date)
            )
            rec = rec[0] if rec else None
            booked_intervals = rec.get('booked_intervals', []) if rec else []
            slots = []
            t = open_h
            while t + slot_length <= close_h:
                slots.append((t, t + slot_length))
                t += slot_length
            available_slots = []
            for start, end in slots:
                overlap = sum(
                    1 for iv in booked_intervals
                    if not (end <= iv["start"] or start >= iv["end"])
                )
                if overlap < capacity:
                    available_slots.append(start)
            weekly.append({
                "date": date,
                "available_slots": available_slots
            })
        all_availability.append({
            "restaurant_id": restaurant_id,
            "name": restaurant['name'],
            "rating": rating,
            "open": open_h,
            "close": close_h,
            "capacity": capacity,
            "weekly_availability": weekly,
            "type":rest_type,
            "price" :price,
            "location":location
        })
    return jsonify(all_availability), 200


