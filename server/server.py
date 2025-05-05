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
            "damage_upgrades": save.damage_upgrades
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

        # Обновляем данные с проверками
        save.coins = max(0, int(data.get('coins', save.coins)))
        save.level = max(1, int(data.get('level', save.level)))
        save.damage = max(1, int(data.get('damage', save.damage)))
        save.monster_health = max(1, int(data.get('monster_health', save.monster_health)))
        save.damage_upgrade_price = max(10, int(data.get('damage_upgrade_price', save.damage_upgrade_price)))
        save.damage_upgrades = max(0, int(data.get('damage_upgrades', save.damage_upgrades)))

        db.session.add(save)
        db.session.commit()
        return jsonify({"status": "success"})

    except Exception as e:
        db.session.rollback()
        logger.error(f"Error saving game: {str(e)}")
        return jsonify({"error": "Failed to save game data"}), 500

@app.cli.command()
def init_db():
    """Initialize the database."""
    db.create_all()

if __name__ == '__main__':
    port = int(os.getenv('PORT', 5001))
    app.run(host='0.0.0.0', port=port)