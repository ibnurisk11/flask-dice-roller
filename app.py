from flask import Flask, jsonify, request
from flask_cors import CORS # Untuk mengizinkan permintaan dari frontend di domain/port berbeda
import random

app = Flask(__name__)
CORS(app) # Mengaktifkan CORS untuk semua rute

@app.route('/roll', methods=['POST'])
def roll_dice():
    """
    Endpoint untuk melempar dadu.
    Menerima JSON dengan 'num_dice' dan 'num_sides'.
    """
    data = request.get_json()
    num_dice = data.get('num_dice', 1) # Default 1 dadu
    num_sides = data.get('num_sides', 6) # Default 6 sisi

    if not isinstance(num_dice, int) or num_dice <= 0:
        return jsonify({"error": "num_dice harus angka positif."}), 400
    if not isinstance(num_sides, int) or num_sides <= 1:
        return jsonify({"error": "num_sides harus angka lebih dari 1."}), 400

    results = []
    for _ in range(num_dice):
        roll = random.randint(1, num_sides)
        results.append(roll)

    total = sum(results)
    return jsonify({
        "rolls": results,
        "total": total
    })

@app.route('/')
def home():
    return "Backend Dice Roller berjalan. Akses frontend melalui file index.html."

if __name__ == '__main__':
    app.run(debug=True, port=5000) # Jalankan di port 5000