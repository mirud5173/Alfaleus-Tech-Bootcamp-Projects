from fastapi import FastAPI
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from scraper import scrape_endpoint  # Importing the scrape endpoint
import scraper

app = FastAPI()

# Mount static frontend files (CSS, JS)
app.mount("/static", StaticFiles(directory="../frontend"), name="static")

# Route to serve index.html
@app.get("/")
async def serve_index():
    return FileResponse("../frontend/index.html")

# Register the /scrape POST route
app.include_router(scraper.app)
