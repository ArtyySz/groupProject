from flask import Flask, jsonify, request
from flask_cors import CORS
import json
import os

app = Flask(__name__)
CORS(app)  # Разрешаем CORS для разработки

SAVE_FILE = os.path.join(os.path.dirname(__file__), 'game_save.json')

def get_default_save():
    return {"coins": 0, "level": 1, "damage": 1, "health": 100}

@app.route('/load', methods=['GET'])
def load_game():
    try:
        if os.path.exists(SAVE_FILE):
            with open(SAVE_FILE, 'r') as f:
                return jsonify(json.load(f))
        return jsonify(get_default_save())
    except Exception as e:
        print(f"Ошибка загрузки: {e}")
        return jsonify(get_default_save()), 500

@app.route('/save', methods=['POST'])
def save_game():
    try:
        data = request.json
        with open(SAVE_FILE, 'w') as f:
            json.dump(data, f, indent=2)
        return jsonify({"status": "success"})
    except Exception as e:
        print(f"Ошибка сохранения: {e}")
        return jsonify({"status": "error"}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)