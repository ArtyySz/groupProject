from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
import logging

app = Flask(__name__)
CORS(app)

# Настройка логгирования
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://artyyy:artyyy@localhost:5432/clicker_game'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)
migrate = Migrate(app, db)  # Важно: после создания app и db

class GameSave(db.Model):
    __tablename__ = 'game_save'
    id = db.Column(db.Integer, primary_key=True)  # Обязательно должен быть первичный ключ
    coins = db.Column(db.Integer, default=0)
    level = db.Column(db.Integer, default=1)
    damage = db.Column(db.Integer, default=1)
    monster_health = db.Column(db.Integer, default=100)
    damage_upgrade_price = db.Column(db.Integer, default=20)
    damage_upgrades = db.Column(db.Integer, default=0)

@app.route('/load', methods=['GET'])
def load_game():
    save = GameSave.query.first()
    if not save:
        save = GameSave()
        db.session.add(save)
        db.session.commit()

    return jsonify({
        "coins": save.coins,
        "level": save.level,
        "damage": save.damage,
        "monster_health": save.monster_health,
        "damage_upgrade_price": save.damage_upgrade_price,
        "damage_upgrades": save.damage_upgrades
    })

@app.route('/save', methods=['POST'])
def save_game():
    data = request.get_json()
    save = GameSave.query.first()

    if not save:
        save = GameSave()

    save.coins = data.get('coins', 0)
    save.level = data.get('level', 1)
    save.damage = data.get('damage', 1)
    save.monster_health = data.get('monster_health', 100)
    save.damage_upgrade_price = data.get('damage_upgrade_price', 20)
    save.damage_upgrades = data.get('damage_upgrades', 0)

    db.session.add(save)
    db.session.commit()
    return jsonify({"status": "success"})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001, debug=True)