from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
import logging
import os
from dotenv import load_dotenv

# Загрузка переменных окружения
load_dotenv()

app = Flask(__name__)
CORS(app)

# Настройка логгирования
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Конфигурация БД из переменных окружения
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv(
    'DATABASE_URL',
    'postgresql://postgres:postgres@localhost:5432/clicker_game'  # Дефолтные значения для разработки
)
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)
migrate = Migrate(app, db)

class GameSave(db.Model):
    __tablename__ = 'game_save'
    id = db.Column(db.Integer, primary_key=True)
    coins = db.Column(db.Integer, default=0)
    level = db.Column(db.Integer, default=1)
    damage = db.Column(db.Integer, default=1)
    monster_health = db.Column(db.Integer, default=100)
    damage_upgrade_price = db.Column(db.Integer, default=20)
    damage_upgrades = db.Column(db.Integer, default=0)
    coins_per_second = db.Column(db.Integer, default=0)
    cps_upgrades = db.Column(db.Integer, default=0)
    cps_upgrade_price = db.Column(db.Integer, default=20)

@app.route('/load', methods=['GET'])
def load_game():
    try:
        save = GameSave.query.first()
        if not save:
            save = GameSave()
            db.session.add(save)
            db.session.commit()
            logger.info("Created new game save")

        return jsonify({
            "coins": save.coins,
            "level": save.level,
            "damage": save.damage,
            "monster_health": save.monster_health,
            "damage_upgrade_price": save.damage_upgrade_price,
            "damage_upgrades": save.damage_upgrades,
            "coins_per_second": save.coins_per_second,
            "cps_upgrades": save.cps_upgrades,
            "cps_upgrade_price": save.cps_upgrade_price
        })
    except Exception as e:
        logger.error(f"Error loading game: {str(e)}")
        return jsonify({"error": "Failed to load game data"}), 500


@app.route('/save', methods=['POST'])
def save_game():
    try:
        data = request.get_json()
        save = GameSave.query.first()

        if not save:
            save = GameSave()

        save.coins = max(0, int(data.get('coins', save.coins)))
        save.level = max(1, int(data.get('level', save.level)))
        save.damage = max(1, int(data.get('damage', save.damage)))
        save.monster_health = max(1, int(data.get('monster_health', save.monster_health)))
        save.damage_upgrade_price = max(10, int(data.get('damage_upgrade_price', save.damage_upgrade_price)))
        save.damage_upgrades = max(0, int(data.get('damage_upgrades', save.damage_upgrades)))
        save.coins_per_second = max(0, int(data.get('coins_per_second', save.coins_per_second)))
        save.cps_upgrades = max(0, int(data.get('cps_upgrades', save.cps_upgrades)))
        save.cps_upgrade_price = max(10, int(data.get('cps_upgrade_price', save.cps_upgrade_price)))

        db.session.add(save)
        db.session.commit()
        return jsonify({"status": "success"})
    except Exception as e:
        db.session.rollback()
        logger.error(f"Error saving game: {str(e)}")
        return jsonify({"error": str(e)}), 500

class UserProfile(db.Model):
    __tablename__ = 'user_profiles'
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(20), nullable=False, default='Гость', unique=True)  # Уникальное имя
    total_clicks = db.Column(db.Integer, default=0)
    total_play_time = db.Column(db.Integer, default=0)
    last_login = db.Column(db.DateTime, default=db.func.now())
    username_set = db.Column(db.Boolean, default=False)

@app.route('/profile/save', methods=['POST', 'OPTIONS'])  # Добавляем OPTIONS
def save_profile():
    if request.method == 'OPTIONS':
        return jsonify({}), 200  # Возвращаем пустой ответ для OPTIONS

    try:
        data = request.get_json()
        print("Received profile data:", data)  # Для отладки

        profile = UserProfile.query.first()
        if not profile:
            profile = UserProfile()
            db.session.add(profile)

        # Всегда обновляем клики и время
        if 'total_clicks' in data:
            profile.total_clicks = max(0, int(data['total_clicks']))
            print("Updating clicks to:", profile.total_clicks)

        if 'total_play_time' in data:
            profile.total_play_time = max(0, int(data['total_play_time']))

        db.session.commit()
        return jsonify({"status": "success", "saved_clicks": profile.total_clicks})
    except Exception as e:
        db.session.rollback()
        logger.error(f"Error saving profile: {str(e)}")
        return jsonify({"error": str(e)}), 500


@app.route('/profile/load', methods=['GET'])
def load_profile():
    try:
        profile = UserProfile.query.first()
        if not profile:
            profile = UserProfile(username='Гость')
            db.session.add(profile)
            db.session.commit()

        return jsonify({
            "username": profile.username,
            "total_clicks": profile.total_clicks,
            "total_play_time": profile.total_play_time
        })
    except Exception as e:
        logger.error(f"Error loading profile: {str(e)}")
        return jsonify({"error": "Failed to load profile"}), 500

@app.route('/profile/save-clicks', methods=['POST'])
def save_clicks():
    try:
        data = request.get_json()
        profile = UserProfile.query.first()
        if not profile:
            profile = UserProfile()
            db.session.add(profile)

        profile.total_clicks = max(0, int(data.get('clicks', 0)))
        db.session.commit()
        return jsonify({"status": "success", "clicks": profile.total_clicks})
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


@app.cli.command()
def init_db():
    """Initialize the database."""
    db.create_all()

if __name__ == '__main__':
    port = int(os.getenv('PORT', 5001))
    app.run(host='0.0.0.0', port=port)