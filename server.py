from flask import Flask, jsonify, request, render_template
import requests
import re

app = Flask(__name__)

CROSSREF_API_URL = "https://api.crossref.org/works"
AUTHOR_NAME = "Brad Dicianno"

def clean_title(title):
    # Remove superscript footnote indicators
    title = re.sub(r'\d+\u00A0.*', '', title).strip()  # Non-breaking space specific case
    title = re.sub(r'\d+\s*No.*', '', title).strip()  # General case for "No" footnotes
    return title

def fetch_all_crossref_data(author):
    all_publications = []
    offset = 0
    rows = 1000

    while True:
        params = {
            'query.author': author,
            'rows': rows,
            'offset': offset
        }
        response = requests.get(CROSSREF_API_URL, params=params)
        data = response.json()
        
        if 'message' in data and 'items' in data['message']:
            items = data['message']['items']
            for item in items:
                authors = item.get("author", [])
                if any("dicianno" in author.get("family", "").lower() and "brad" in author.get("given", "").lower() for author in authors):
                    title = clean_title(item.get("title", ["No title"])[0])
                    link = item.get("URL", "No URL")
                    year_parts = item.get("issued", {}).get("date-parts", [[None]])
                    year = year_parts[0][0] if year_parts[0][0] is not None else "Unknown"
                    citations = item.get("is-referenced-by-count", "Unknown")
                    all_publications.append({
                        "title": title,
                        "link": link,
                        "year": year,
                        "citations": citations
                    })
            if len(items) < rows:
                break
            offset += rows
        else:
            break

    return all_publications

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/fetch-publications', methods=['GET'])
def fetch_publications():
    author = request.args.get('author', AUTHOR_NAME)
    publications = fetch_all_crossref_data(author)
    return jsonify(publications)

if __name__ == '__main__':
    app.run(debug=True)
