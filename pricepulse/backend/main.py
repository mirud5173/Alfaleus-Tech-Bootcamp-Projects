from fastapi import FastAPI
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from scraper import app as scraper_app  # Import router from scraper

app = FastAPI()

# Mount static frontend files (CSS, JS)
app.mount("/static", StaticFiles(directory="../frontend"), name="static")

# Route to serve index.html
@app.get("/")
async def serve_index():
    return FileResponse("../frontend/index.html")

# Register the /scrape and /history endpoints
app.include_router(scraper_app)
