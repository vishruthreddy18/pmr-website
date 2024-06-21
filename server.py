from flask import Flask, jsonify, request, render_template
import requests

app = Flask(__name__)

def fetch_crossref_data(author):
    url = f"https://api.crossref.org/works?query.author={author}&rows=100"
    response = requests.get(url)
    data = response.json()
    
    publications = []
    if 'message' in data and 'items' in data['message']:
        for item in data['message']['items']:
            publications.append({
                "title": item.get("title", ["No title"])[0],
                "link": item.get("URL", "No URL"),
                "year": item.get("issued", {}).get("date-parts", [[None]])[0][0],
                "citations": item.get("is-referenced-by-count", "Unknown")
            })
    return publications

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/fetch-publications', methods=['GET'])
def fetch_publications():
    author = request.args.get('author', 'Brad Dicianno')
    publications = fetch_crossref_data(author)
    return jsonify(publications)

if __name__ == '__main__':
    app.run(debug=True)
