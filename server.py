from flask import Flask, request
import json
from flask_cors import CORS

app = Flask(__name__)
CORS(app)


@app.route('/data', methods=['POST'])
def receive_data():
    data = request.get_json()

    # Get the filename from the JSON data. If it doesn't exist, use 'data_log.json' as a default
    filename = data.get('UUID', 'data_log.json')
    expname = data.get('experiment', 'exp')
    filepath = f'/var/www/schema.backyardbrains.com/uploads/{expname}_{filename}.json'

    with open(filepath, 'a') as f:

        f.write(json.dumps(data, indent=4))
        f.write("\n")

    return 'OK', 200

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8000)
