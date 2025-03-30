import os
import boto3
import logging
import uuid
import io

from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from app.models.images import Image
from app import db
from PIL import Image as PILImage

image_bp = Blueprint("image_upload", __name__)
debug_logger = logging.getLogger("debug")

ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg", "gif"}
S3_SECRET_KEY=os.getenv('S3_SECRET_KEY')
S3_ACCESS_KEY=os.getenv('S3_ACCESS_KEY')
S3_BUCKET_NAME=os.getenv('S3_BUCKET_NAME')
S3_REGION=os.getenv('S3_REGION', 'us-east-1')
s3_client = boto3.client(
    "s3",
    aws_access_key_id=S3_ACCESS_KEY,
    aws_secret_access_key=S3_SECRET_KEY,
    region_name=S3_REGION,
)

def allowed_file(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS

def is_file_size_valid(file_stream):
    MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB
    file_stream.seek(0, os.SEEK_END)
    file_size = file_stream.tell()
    file_stream.seek(0)
    return file_size <= MAX_FILE_SIZE

def sanitize_image(file_stream, s3_filename):
    try:
        img = PILImage.open(file_stream)
        original_format = img.format  # Store this for later use

        # Force loading the image data to ensure valid
        img.load()

        if img.mode == 'RGBA':
            background = PILImage.new('RGB', img.size, (255, 255, 255))
            background.paste(img, mask=img.split()[3])
            img = background
        elif img.mode not in ('RGB', 'L'):
            img = img.convert('RGB')

        # Remove EXIF and other metadata
        data = io.BytesIO()

        if original_format:
            img.save(data, format=original_format, optimize=True)
        else:
            img.save(data, format='JPEG', optimize=True)

        data.seek(0)

        return data
    except Exception as e:
        debug_logger.error(f"Error processing image: {e}")
        return None

@image_bp.route("/image-upload", methods=["POST"])
@jwt_required()
def upload_image():
    """
    POST /api/image-upload
    Uploads an image file to S3 and returns its URL
    """
    try:
        if "image" not in request.files:
            return jsonify({"error": "No file part"}), 400

        file = request.files["image"]
        if file.filename == "":
            return jsonify({"error": "No selected file"}), 400

        if not allowed_file(file.filename):
            return jsonify({"error": "Invalid file type"}), 400

        if not is_file_size_valid(file):
            return jsonify({"error": "File too big, max size 5MB"}), 400

        ext = file.filename.rsplit(".", 1)[1].lower()
        image_id = uuid.uuid4()
        s3_filename = f'{str(image_id)}.{ext}'
        s3_path = f"images/{s3_filename}"

        sanitized_image = sanitize_image(file, s3_filename)
        if sanitized_image is None:
            return jsonify({"error": "Could not process image"}), 400

        s3_client.upload_fileobj(sanitized_image, S3_BUCKET_NAME, s3_path, ExtraArgs={"ACL": "public-read", "ContentType": file.content_type})

        image_url = f"https://{S3_BUCKET_NAME}.s3.amazonaws.com/{s3_path}"
        image = Image(id=image_id, s3_url=image_url)
        db.session.add(image)
        db.session.commit()

        return jsonify({"id": image.id}), 201

    except Exception as e:
        db.session.rollback()  # does nothing if no transaction occured
        debug_logger.error(f"Error uploading image: {e}")
        return jsonify({"error": "An unexpected error occurred"}), 500

@image_bp.route("/image-delete/<image_id>", methods=["DELETE"])
@jwt_required()
def delete_image(image_id):
    """
    DELETE /api/image-delete
    Deletes an image from S3
    """
    try:
        if not image_id:
            return jsonify({"error": "Image id is required"}), 400

        image = Image.query.filter_by(id=image_id).first()
        if not image:
            return jsonify({"error": "Image id not found"}), 400

        s3_path = image.s3_url.split(f"https://{S3_BUCKET_NAME}.s3.amazonaws.com/")[-1]
        s3_client.delete_object(Bucket=S3_BUCKET_NAME, Key=s3_path)

        Image.query.filter_by(id=image_id).delete()
        db.session.commit()

        return jsonify({"message": "Image deleted successfully"}), 200

    except Exception as e:
        db.session.rollback()  # does nothing if no transaction occured
        debug_logger.error(f"Error deleting image: {e}")
        return jsonify({"error": "An unexpected error occurred"}), 500

@image_bp.route("/image/<image_id>", methods=["GET"])
def get_image(image_id):
    """
    GET /api/image/<image_id>
    Retrieves the actual image file from S3 based on image ID
    """
    try:
        if not image_id:
            return jsonify({"error": "Image id is required"}), 400

        image = Image.query.filter_by(id=image_id).first()
        if not image:
            return jsonify({"error": "Image not found"}), 404

        s3_path = image.s3_url.split(f"https://{S3_BUCKET_NAME}.s3.amazonaws.com/")[-1]

        # Get the file extension to determine content type
        file_extension = s3_path.split('.')[-1].lower()
        content_types = {
            'png': 'image/png',
            'jpg': 'image/jpeg',
            'jpeg': 'image/jpeg',
            'gif': 'image/gif'
        }
        content_type = content_types.get(file_extension, 'application/octet-stream')

        file_obj = s3_client.get_object(Bucket=S3_BUCKET_NAME, Key=s3_path)
        file_data = file_obj['Body'].read()

        from flask import send_file, Response
        return Response(
            file_data,
            mimetype=content_type,
            headers={"Content-Disposition": f"inline; filename={s3_path.split('/')[-1]}"}
        )

    except Exception as e:
        debug_logger.error(f"Error retrieving image: {e}")
        return jsonify({"error": "An unexpected error occurred"}), 500
