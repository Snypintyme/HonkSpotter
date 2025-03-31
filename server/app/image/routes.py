import os
import boto3
import logging
import uuid
import io

from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required
from app.models.images import Image
from app import db
from PIL import Image as PILImage

image_bp = Blueprint("image_upload", __name__)
debug_logger = logging.getLogger("debug")

ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg", "gif"}

def get_client():
    is_prod = current_app.config['IS_PROD']
    s3_region = current_app.config['S3_REGION']
    s3_access_key = current_app.config['S3_ACCESS_KEY']
    s3_secret_key = get_secret() if is_prod else os.getenv('S3_SECRET_KEY')

    if not is_prod and not s3_secret_key:
        debug_logger.error(f"Local S3 secret key not set properly in environment variable")
        raise Exception('Local environment variables not set properly')

    return boto3.client(
        "s3",
        aws_access_key_id=s3_access_key,
        aws_secret_access_key=s3_secret_key,
        region_name=s3_region,
    )

def get_secret():
    secret_name = "honks3secret"
    region_name = "us-east-1"

    # Create a Secrets Manager client
    session = boto3.session.Session()
    client = session.client(
        service_name='secretsmanager',
        region_name=region_name
    )

    try:
        get_secret_value_response = client.get_secret_value(
            SecretId=secret_name
        )
    except ClientError as e:
        # For a list of exceptions thrown, see
        # https://docs.aws.amazon.com/secretsmanager/latest/apireference/API_GetSecretValue.html
        raise e

    secret = get_secret_value_response['SecretString']

    return secret

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
        s3_client = get_client()
        s3_bucket_name = current_app.config['S3_BUCKET_NAME']

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

        s3_client.upload_fileobj(sanitized_image, s3_bucket_name, s3_path)

        image_url = f"https://{s3_bucket_name}.s3.amazonaws.com/{s3_path}"
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
        s3_client = get_client()
        s3_bucket_name = current_app.config['S3_BUCKET_NAME']

        if not image_id:
            return jsonify({"error": "Image id is required"}), 400

        image = Image.query.filter_by(id=image_id).first()
        if not image:
            return jsonify({"error": "Image id not found"}), 400

        s3_path = image.s3_url.split(f"https://{s3_bucket_name}.s3.amazonaws.com/")[-1]
        s3_client.delete_object(Bucket=s3_bucket_name, Key=s3_path)

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
        s3_client = get_client()
        s3_bucket_name = current_app.config['S3_BUCKET_NAME']

        if not image_id:
            return jsonify({"error": "Image id is required"}), 400

        image = Image.query.filter_by(id=image_id).first()
        if not image:
            return jsonify({"error": "Image not found"}), 404

        s3_path = image.s3_url.split(f"https://{s3_bucket_name}.s3.amazonaws.com/")[-1]

        # Get the file extension to determine content type
        file_extension = s3_path.split('.')[-1].lower()
        content_types = {
            'png': 'image/png',
            'jpg': 'image/jpeg',
            'jpeg': 'image/jpeg',
            'gif': 'image/gif'
        }
        content_type = content_types.get(file_extension, 'application/octet-stream')

        file_obj = s3_client.get_object(Bucket=s3_bucket_name, Key=s3_path)
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
