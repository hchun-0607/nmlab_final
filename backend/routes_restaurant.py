# Restaurants/routes.py
from flask import Blueprint, request, jsonify, current_app
import os, json, time, random, string, shutil
from tinydb import TinyDB, Query
import datetime

db = TinyDB('db.json')
restaurants_bp = Blueprint('restaurants', __name__, url_prefix='/api/avm/restaurants')
restaurants_table = db.table('restaurants') 
availability_table = db.table('availability')  # 用於存放餐廳的可用性資訊
Restaurants = Query()


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
    return jsonify(data), 200  


# 其餘 get_restaurant、update_restaurant、delete_restaurant 與之前示範相同

@restaurants_bp.route('/get_availability/<restaurant_id>/<date>', methods=['GET'])
def get_availability(restaurant_id, date): #to frontend
    restaurant = restaurants_table.get(Restaurants.restaurant_id == restaurant_id)
    if not restaurant:
        return jsonify({"error": "餐廳不存在"}), 404
    
    open_h = float(restaurant['open'])
    close_h = float(restaurant['close'])
    capacity = int(restaurant['capacity'])
    
    rec = availability_table.get(
        Restaurants.restaurant_id == restaurant_id and
        Restaurants.date == date
    )
    booked_intervals = rec['booked_intervals'] if rec else []
    
    slot_length = 0.5  # 時段長度，單位小時
    
    slots = []
    t = open_h
    while t + slot_length <= close_h:
        slots.append((t, t + slot_length))
        t += slot_length
        
    available_slots = []
    for start, end in slots:
        overlap = sum(
            1 for iv in booked_intervals
            if not (end<= iv["start"] or start >= iv["end"])
        )
        if overlap < capacity:
            available_slots.append(start)
            
    return jsonify({
        "restaurant_id": restaurant_id,
        "date": date,
        "open": open_h,
        "close": close_h,
        "available_slots": available_slots #[11.0 , 11.5, 12.0, ...]
    }), 200
    
    
@restaurants_bp.route('/book_any_time', methods=['POST'])
def book_any_time():
    data = request.get_json()
    rid = data['restaurant_id']
    date = data['date']
    start_hour = float(data['start_hour'])
    duration = 1.5 # 預設預約時段長度為 1.5 小時
    end_hour = start_hour + duration
    
    restaurant = restaurants_table.get(Restaurants.restaurant_id == rid)
    if not restaurant:
        return jsonify({"error": "餐廳不存在"}), 404
    if start_hour < float(restaurant['open']) or end_hour > float(restaurant['close']):
        return jsonify({"error": "預約時間不在餐廳營業時間內"}), 400
    
    capacity = int(restaurant['capacity'])
    rec = availability_table.search(
        (Restaurants.restaurant_id == rid) &
        (Restaurants.date == date)
    )
    booked = rec['booked_intervals'] if rec else []
    
    booked.append({
        "start": start_hour,
        "end": end_hour
    })
    booked.sort(key=lambda x: x['start'])
    
    if rec:
        availability_table.update(
            {"booked_intervals": booked},
            Restaurants.restaurant_id == rid and
            Restaurants.date == date
        )
    else:
        availability_table.insert({
            "restaurant_id": rid,
            "date": date,
            "booked_intervals": booked
        })
    return jsonify({
        "message": "預約成功",
        "restaurant_id": rid,
        "date": date,
        "start_hour": start_hour,
        "end_hour": end_hour
    }), 200
    
    
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
            "weekly_availability": weekly
        })
    return jsonify(all_availability), 200


