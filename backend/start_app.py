import traceback
import sys

try:
    with open("server_error.log", "w") as f:
        f.write("Starting server...\n")
    
    from app.main import app
    import uvicorn

    with open("server_error.log", "a") as f:
        f.write("App imported successfully. Starting uvicorn...\n")

    uvicorn.run(app, host="127.0.0.1", port=8001, log_level="info")

except Exception as e:
    with open("server_error.log", "a") as f:
        f.write("EXCEPTION OCCURRED:\n")
        traceback.print_exc(file=f)
