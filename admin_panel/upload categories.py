import os
from supabase import create_client, Client
import os
from dotenv import load_dotenv

# matebe9704@bitmah.com
# =========================================
# SUPABASE CONFIG
# =========================================

load_dotenv()  # Load environment variables from .env file

SUPABASE_URL = os.getenv("VITE_SUPABASE_URL")
SUPABASE_KEY = os.getenv("VITE_SUPABASE_ANON_KEY")


supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# =========================================
# LOCAL IMAGE FOLDER
# =========================================
FOLDER_PATH = r"C:\Users\mortal\Downloads\ga8b5hcenaihth8rhkdr1mtmd1_2026-05-20_23-38-41"

# =========================================
# CATEGORY DATA
# =========================================
categories = [
    {
        "file": "agate-watch.jpg",
        "name": "Agate Watches",
    },
    {
        "file": "Bracelet.jpg",
        "name": "Crystal Bracelets",
    },
    {
        "file": "chips-1.jpg",
        "name": "Crystal Chips",
    },
    {
        "file": "geode1.jpg",
        "name": "Geodes",
    },
    {
        "file": "pendant.jpg",
        "name": "Crystal Pendants",
    },
    {
        "file": "pyrite-cluster.jpg",
        "name": "Pyrite Clusters",
    },
    {
        "file": "Raw-new.jpg",
        "name": "Raw Stones",
    },
    {
        "file": "Shubhanjali-Evil-Eye-Hanging-Wall-Hanging_3-1.jpg",
        "name": "Evil Eye Wall Hangings",
    },
    {
        "file": "sphere1.jpg",
        "name": "Crystal Spheres",
    },
    {
        "file": "towr-2.jpg",
        "name": "Crystal Towers",
    },
    {
        "file": "tree-1.jpg",
        "name": "Crystal Trees",
    },
    {
        "file": "tumble.jpg",
        "name": "Tumbled Stones",
    },
]

# =========================================
# SLUG FUNCTION
# =========================================
def make_slug(text):
    return (
        text.lower()
        .replace("&", "and")
        .replace(" ", "-")
    )

# =========================================
# MAIN UPLOAD FUNCTION
# =========================================
def upload_categories():

    for item in categories:
        try:
            file_name = item["file"]
            category_name = item["name"]

            local_file_path = os.path.join(FOLDER_PATH, file_name)

            print(f"\nUploading: {file_name}")

            # =================================
            # READ IMAGE
            # =================================
            with open(local_file_path, "rb") as f:
                file_data = f.read()

            # =================================
            # STORAGE PATH
            # =================================
            storage_path = f"categories/{file_name}"

            # =================================
            # UPLOAD TO SUPABASE STORAGE
            # =================================
            supabase.storage.from_("categories").upload(
                path=storage_path,
                file=file_data,
                file_options={
                    "content-type": "image/jpeg",
                    "upsert": "true"
                }
            )

            # =================================
            # GET PUBLIC URL
            # =================================
            public_url = (
                supabase.storage
                .from_("categories")
                .get_public_url(storage_path)
            )

            # =================================
            # CREATE SLUG
            # =================================
            slug = make_slug(category_name)

            # =================================
            # INSERT INTO DATABASE
            # =================================
            data = {
                "name": category_name,
                "slug": slug,
                "image_url": public_url
            }

            response = (
                supabase.table("categories")
                .insert(data)
                .execute()
            )

            print(f"✅ Added: {category_name}")

        except Exception as e:
            print(f"❌ Error with {file_name}")
            print(e)

    print("\n🎉 All categories uploaded successfully!")


# =========================================
# RUN
# =========================================
upload_categories()