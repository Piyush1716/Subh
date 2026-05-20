from flask import Flask, render_template, request, jsonify
from supabase import create_client
from dotenv import load_dotenv
import os
import uuid

load_dotenv()

app = Flask(__name__)

SUPABASE_URL = os.getenv("VITE_SUPABASE_URL")
SUPABASE_KEY = os.getenv("VITE_SUPABASE_ANON_KEY")
BUCKET_NAME = os.getenv("BUCKET_NAME")

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

@app.route('/')
def home():
    response = supabase.table("products").select("*").order("id", desc=True).execute()
    products = response.data
    return render_template("index.html", products=products)

@app.route('/add-product', methods=['POST'])
def add_product():
    try:
        title = request.form.get('title')
        description = request.form.get('description')
        price = request.form.get('price')
        discount_price = request.form.get('discount_price')

        image = request.files.get('image')

        image_name = f"{uuid.uuid4()}-{image.filename}"

        # Upload image to Supabase Storage
        supabase.storage.from_(BUCKET_NAME).upload(
            image_name,
            image.read(),
            {"content-type": image.content_type}
        )

        image_url = f"{SUPABASE_URL}/storage/v1/object/public/{BUCKET_NAME}/{image_name}"

        # Insert product
        supabase.table("products").insert({
            "title": title,
            "description": description,
            "price": price,
            "discont_price": discount_price,
            "image_url": image_url
        }).execute()

        return jsonify({
            "success": True,
            "message": "Product added successfully"
        })

    except Exception as e:
        return jsonify({
            "success": False,
            "message": str(e)
        })

@app.route('/delete-product/<int:id>', methods=['DELETE'])
def delete_product(id):
    try:
        supabase.table("products").delete().eq("id", id).execute()

        return jsonify({
            "success": True
        })

    except Exception as e:
        return jsonify({
            "success": False,
            "message": str(e)
        })

if __name__ == "__main__":
    app.run(debug=True)