from flask import Flask, render_template, request, jsonify
from supabase import create_client # type: ignore
from dotenv import load_dotenv
import os
import uuid

load_dotenv()

app = Flask(__name__)

SUPABASE_URL = os.getenv("VITE_SUPABASE_URL")
SUPABASE_KEY = os.getenv("VITE_SUPABASE_ANON_KEY")
PRODUCT_BUCKET = os.getenv("PRODUCT_BUCKET")
CATEGORY_BUCKET = os.getenv("CATEGORY_BUCKET")

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)


def upload_image(bucket, image):
    name = f"{uuid.uuid4()}-{image.filename}"
    supabase.storage.from_(bucket).upload(name, image.read(), {"content-type": image.content_type})
    return f"{SUPABASE_URL}/storage/v1/object/public/{bucket}/{name}"


# ---------------------------
# HOME PAGE
# ---------------------------
@app.route('/')
def home():

    products_response = (
        supabase
        .table("products")
        .select("*, categories(name)")
        .order("id", desc=True)
        .execute()
    )

    categories_response = (
        supabase
        .table("categories")
        .select("*")
        .order("id", desc=True)
        .execute()
    )

    products = products_response.data
    categories = categories_response.data

    return render_template(
        "index.html",
        products=products,
        categories=categories
    )


# ---------------------------
# ADD CATEGORY
# ---------------------------
@app.route('/add-category', methods=['POST'])
def add_category():
    try:
        image = request.files.get("image")
        supabase.table("categories").insert({
            "name": request.form.get("name"),
            "slug": request.form.get("slug"),
            "image_url": upload_image(CATEGORY_BUCKET, image) if image else None
        }).execute()
        return jsonify({"success": True, "message": "Category added successfully"})
    except Exception as e:
        return jsonify({"success": False, "message": str(e)})


# ---------------------------
# ADD PRODUCT (single or bulk)
# ---------------------------
@app.route('/add-product', methods=['POST'])
def add_product():
    try:
        # Bulk insert via JSON: [{title, slug, description, price, discont_price, category_id, image_url}, ...]
        if request.is_json:
            products = request.get_json()
            if not isinstance(products, list):
                products = [products]
            supabase.table("products").insert(products).execute()
            return jsonify({"success": True, "message": f"{len(products)} product(s) added"})

        # Single product via form + image upload
        image = request.files.get('image')
        supabase.table("products").insert({
            "title": request.form.get('title'),
            "slug": request.form.get('slug'),
            "description": request.form.get('description'),
            "price": request.form.get('price'),
            "discont_price": request.form.get('discont_price'),
            "image_url": upload_image(PRODUCT_BUCKET, image),
            "category_id": request.form.get('category_id') or None
        }).execute()
        return jsonify({"success": True, "message": "Product added successfully"})

    except Exception as e:
        return jsonify({"success": False, "message": str(e)})


# ---------------------------
# DELETE PRODUCT
# ---------------------------
@app.route('/delete-product/<int:id>', methods=['DELETE'])
def delete_product(id):
    try:
        supabase.table("products").delete().eq("id", id).execute()
        return jsonify({"success": True})
    except Exception as e:
        return jsonify({"success": False, "message": str(e)})


if __name__ == "__main__":
    app.run(debug=True)