from flask import Flask, jsonify, request
import nltk
import json
from flask_cors import CORS
from newspaper import Article
app = Flask(__name__)
CORS(app)
@app.route('/translation' , methods=['POST'])
def receive_data():
   data = request.data.decode('utf-8')
   print("Received data from JavaScript:", data)
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
    app.run(port=8000)


