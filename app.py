from flask import Flask, jsonify, request
import json
import nltk
from flask_cors import CORS
from newspaper import Article
nltk.download('punkt')
app = Flask(__name__)
CORS(app)
@app.route('/translation' , methods=['POST'])
def receive_data():
   data = request.data.decode('utf-8')
   jsonData = json.loads(data)
   url = jsonData['data']
   article = Article(url)
   article.download()
   article.parse()
   article.nlp()
   summary = article.text
   response_data={"summary":summary}
   return jsonify(response_data)

if __name__ == '__main__':
    app.run(host='0.0.0.0')


