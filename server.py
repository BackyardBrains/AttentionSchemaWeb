from flask import Flask, request
import json
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

import os

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

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8000)
