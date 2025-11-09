# Sophia Ling, sl4909
from flask import Flask
from flask import render_template
from flask import Response, request, jsonify
from data import defixiones
import copy
import re

app = Flask(__name__)

date_conversion = {-4:"4th c. BCE", -3:"3rd c. BCE", -2:"2nd c. BCE", -1:"1st c. BCE", 0:"Unknown",
                   5:"5th c. CE", 4:"4th c. CE", 3:"3rd c. CE", 2:"2nd c. CE", 1:"1st c. CE"}

# ROUTES

@app.route('/')
def index():
    keys = extract_keyval()
    return render_template('index.html', data=defixiones, keys=keys) 

@app.route('/defix/<id>')
def defix(id):
    # print(defixiones[id])
    return render_template('defix.html', data=defixiones[id]) 

@app.route('/edit/<id>')
def edit(id):
    keys = extract_keyval()
    return render_template('edit.html', data=defixiones[id], keys=keys) 

@app.route('/add')
def add():
    keys = extract_keyval()
    # print(keys)
    return render_template('add.html', keys=keys) 

def extract_keyval():
    key_values = {}
    exclude_list = ["translation", "id", "date", "date_val", "image"]
    for entry in defixiones.values():
        for key, value in entry.items():
            if key in exclude_list:
                continue
            if key not in key_values:
                key_values[key] = set()  # Use set to ensure uniqueness
            
            if isinstance(value, list):
                key_values[key].update(value)
            else:
                key_values[key].add(value)
    result = {key: list(values) for key, values in key_values.items()}
    result['date_val'] = [-4,-3,-2,-1,0,1,2,3,4,5]
    return result


@app.route("/add_item", methods=["POST"])
def add_item():
    data = request.json
    new_id = data["id"].strip()
    
    # Error handling: Ensure unique ID
    if new_id in defixiones:
        return jsonify({"error": "ID must be unique."}), 400

    try:
        date_from = int(data["date_from"].strip())
        date_to = int(data["date_to"].strip())
    except ValueError:
        return jsonify({"error": "Date values must be numbers."}), 400
    
    if date_to<date_from:
        return jsonify({"error": "'Date from' must be less than or equal to 'Date to'."}), 400

    # Creating the new entry
    new_entry = {
        "id": new_id,
        "provenance": data["provenance"].strip(),
        "location": data["location"].strip(),
        "area": data["area"].strip(),
        "image": data["image"].strip(),
        "date":data["date"].strip(),
        "date_val": [date_from, date_to],
        "material": [m.strip() for m in data["material"].split(",")],
        "language": data["language"].strip(),
        "grouping": data["grouping"],
        "translation": data["translation"].strip(),
    }
    # print(new_entry)

    defixiones[new_id] = new_entry  # Store in memory
    return jsonify({"success": "New item created.", "id": new_id})

@app.route("/edit_item/<item_id>", methods=["POST"])
def edit_item(item_id):
    # print(request.json)
    data = request.json

    if item_id not in defixiones:
        return jsonify({"error": "Item not found."}), 404

    try:
        date_from = int(data["date_from"].strip())
        date_to = int(data["date_to"].strip())
    except ValueError:
        return jsonify({"error": "Date values must be numbers."}), 400
    
    if date_to<date_from:
        return jsonify({"error": "'Date from' must be less than or equal to 'Date to'."}), 400

    # Update entry
    defixiones[item_id].update({
        "provenance": data["provenance"].strip(),
        "location": data["location"].strip(),
        "area": data["area"].strip(),
        "image": data["image"].strip(),
        "date":data["date"].strip(),
        "date_val": [date_from, date_to],
        "material": [m.strip() for m in data["material"].split(",")],
        "language": data["language"].strip(),
        "grouping": data["grouping"],
        "translation": data["translation"].strip(),
    })

    return jsonify({"success": "Item updated.", "id": item_id})

def truncate_translation(results, max_length=500):
    # print(results)
    results_copy = copy.deepcopy(results)  # Create a deep copy
    for value in results_copy:
        if "translation" in value:
            translation = value["translation"]
            if len(translation) > max_length:
                value["translation"] = translation[:max_length].rsplit(" ", 1)[0] + " [...]"
    return results_copy

def mod_translation(text, query, length=500):
    if len(text) <= length:
        return highlight_text(text, query)  # No need to truncate

    # Find first occurrence of query (case-insensitive)
    match = re.search(re.escape(query), text, re.IGNORECASE)

    start_index = 0

    if match:
        start_index = max(0, match.start() - 100)  # Show context before match

    # Ensure start_index begins at a full word
    if start_index > 0:
        start_index = text.rfind(" ", 0, start_index)  # Move back to nearest space

    truncated_text = text[start_index:start_index + length]

    # Ensure we don’t cut off mid-word
    if len(text) > length:
        last_space = truncated_text.rfind(" ")
        if last_space != -1:
            truncated_text = truncated_text[:last_space]

    if start_index > 0:
        truncated_text = "[...] " + truncated_text
    if start_index + length < len(text):
        truncated_text += " [...]"

    return highlight_text(truncated_text, query)

@app.route('/<key>/<value>')
def filter(key, value):
    results = []
    # Convert string input into a list
    value = [v.strip("['']") for v in value.split(",")]
    # print(value)
    if key == "date_val":
        value = [int(v) for v in value]
    
    for item in defixiones.values():
         if key in item:
            if key == "date_val":
                item_range = item[key]
                if len(value) == 1:
                    if value[0] in item_range:
                        results.append(item)
                elif len(value) == 2:
                    value_min, value_max = min(value), max(value)
                    item_min, item_max = min(item_range), max(item_range)
                    if not (item_max < value_min or item_min > value_max):
                        results.append(item)
            else:
                if isinstance(item[key], list):
                    if any(v in item[key] for v in value):
                        results.append(item)
                elif item[key] in value:
                    results.append(item)
    # print(results)
    if key == "date_val":
        key = "Date"
        if len(value)==2:
            value = date_conversion[value[0]] + " to " + date_conversion[value[1]]
        else:
            value = date_conversion[value[0]]
    elif len(value)==1:
        value = value[0]
    key = key[0].upper()+key[1:]
    results = truncate_translation(results)
    return render_template('filtered.html', key=key, value=value, results=results)

def highlight_text(text, query):
    """Highlight query matches in the given text."""
    if query:
        return re.sub(f"({re.escape(query)})", r'<span class="highlight">\1</span>', text, flags=re.IGNORECASE)
    return text

@app.route('/search', methods=['GET', 'POST'])
def search():
    q = request.form.get('search', '').strip().lower()  # Get search query
    results = []

    if q:
        for item in defixiones.values():
            title = f"{item['id']}. {item['area']}"
            search_fields = [
                title.lower(),
                item["provenance"].lower(),
                item["location"].lower(),
                item["date"].lower(),
                item["grouping"].lower(),
                item["translation"].lower()
            ]

            if any(q in field for field in search_fields):
                # Highlight matches
                highlighted_item = {
                    "id": item["id"],
                    "provenance": highlight_text(item["provenance"], q),
                    "location": highlight_text(item["location"], q),
                    "area": highlight_text(item["area"], q),
                    "date": highlight_text(item["date"], q),
                    "grouping": highlight_text(item["grouping"], q),
                    "translation": mod_translation(item["translation"], q),
                    "image": item["image"]
                }
                results.append(highlighted_item)

    return render_template('search.html', search_query=q, results=results)

@app.route('/browse_all')
def browse():
    results = [value for value in defixiones.values()]
    return render_template('browse.html', results=truncate_translation(results)) 

if __name__ == '__main__':
   app.run(debug = True, port=5001)




