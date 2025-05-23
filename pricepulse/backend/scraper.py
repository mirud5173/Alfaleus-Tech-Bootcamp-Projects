import asyncio
import sqlite3
from datetime import datetime
from fastapi import FastAPI, Request
from pydantic import BaseModel
from playwright.async_api import async_playwright
from fastapi import APIRouter
app = APIRouter()  

# DB init (reuse your code)
def init_db():
    conn = sqlite3.connect("prices.db")
    c = conn.cursor()
    c.execute('''
        CREATE TABLE IF NOT EXISTS product_prices (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            url TEXT,
            product_name TEXT,
            price TEXT,
            timestamp TEXT
        )
    ''')
    conn.commit()
    return conn

conn = init_db()  # open once

# Scrape function
async def scrape_product(url, conn):
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(user_agent="Mozilla/5.0")
        page = await context.new_page()

        try:
            await page.goto(url, timeout=60000)
            await page.wait_for_selector("span#productTitle", timeout=15000)
            
            title = await page.locator("span#productTitle").inner_text()
            try:
                price = await page.locator("span.a-price > span.a-offscreen").first.inner_text()
            except:
                price = "Not Available"

            print(f"[✓] Scraped: {title.strip()} — {price}")
            
            # Store in DB
            timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            c = conn.cursor()
            c.execute("INSERT INTO product_prices (url, product_name, price, timestamp) VALUES (?, ?, ?, ?)",
                      (url, title.strip(), price, timestamp))
            conn.commit()

            return {"title": title.strip(), "price": price}

        except Exception as e:
            print(f"[✗] Error scraping {url}: {e}")
            return {"error": str(e)}
        finally:
            await browser.close()

# Pydantic model for incoming JSON
class URLItem(BaseModel):
    url: str

# POST endpoint to receive URL and scrape
@app.post("/scrape")
async def scrape_endpoint(item: URLItem):
    result = await scrape_product(item.url, conn)
    return result
