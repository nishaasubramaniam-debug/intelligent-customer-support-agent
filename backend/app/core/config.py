import os
from dotenv import load_dotenv

load_dotenv()


class Settings:
    APP_NAME = os.getenv(
        "APP_NAME",
        "Intelligent Customer Support Agent"
    )

    APP_VERSION = os.getenv(
        "APP_VERSION",
        "1.0.0"
    )

    GOOGLE_API_KEY = os.getenv(
        "GOOGLE_API_KEY",
        ""
    )

    MONGODB_URI = os.getenv(
        "MONGODB_URI",
        ""
    )

    MONGODB_DATABASE = os.getenv(
        "MONGODB_DATABASE",
        "intelligent_customer_support"
    )

    CHROMA_PERSIST_DIRECTORY = os.getenv(
        "CHROMA_PERSIST_DIRECTORY",
        "./chroma_db"
    )


settings = Settings()