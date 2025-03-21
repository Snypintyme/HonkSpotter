from app import create_app
import os

app = create_app()

if __name__ == "__main__":
    debug_mode = os.getenv('FLASK_DEBUG') == '1'
    app.run(debug=debug_mode)
