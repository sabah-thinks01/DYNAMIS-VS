import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    FEASIBILITY_DATA_SOURCE: str = os.getenv("FEASIBILITY_DATA_SOURCE", "mock")
    FEASIBILITY_SYNTHESIS: str = os.getenv("FEASIBILITY_SYNTHESIS", "template")
    
    MAPPLS_API_KEY: str = os.getenv("MAPPLS_API_KEY", "")
    
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")

    # Comma-separated list of allowed frontend origins for CORS.
    # Example: "https://your-app.vercel.app,http://localhost:3000"
    CORS_ORIGINS: str = os.getenv("CORS_ORIGINS", "")

settings = Settings()
