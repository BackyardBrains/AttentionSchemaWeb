# sudo systemctl start schema_backyardbrains.service
# sudo systemctl stop schema_backyardbrains.service
# defined in /etc/systemd/system/schema_backyardbrains.service

from flask import Flask, request, jsonify
import json
from flask_cors import CORS
import os

app = Flask(__name__)
CORS(app)

@app.route('/upload', methods=['POST'])
def upload_file():
    data = request.get_json()
    uuid = data['uuid']
    counter = 0
    filename = f"{uuid}.json"

    # Check if file exists and append a counter if it does
    while os.path.isfile(filename):
        counter += 1
        filename = f"{uuid}.{str(counter).zfill(2)}.json"

    with open(filename, 'w') as file:
        json.dump(data, file)

    return 'OK', 200

@app.route('/data', methods=['GET', 'POST'])
def data():
    if request.method == 'GET':
        return jsonify(message="GET request to /data")
    elif request.method == 'POST':
        data = request.get_json()
        return jsonify(message="POST request to /data", data=data)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8000)
