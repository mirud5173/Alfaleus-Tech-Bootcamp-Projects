import sqlite3
from datetime import datetime
from fastapi import APIRouter
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from playwright.async_api import async_playwright

app = APIRouter()

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
    conn.close()

init_db()

async def scrape_product(url: str) -> dict:
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(user_agent=(
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
            "AppleWebKit/537.36 (KHTML, like Gecko) "
            "Chrome/113.0.0.0 Safari/537.36"
        ))
        page = await context.new_page()

        try:
            print(f"[→] Navigating to {url}")
            await page.goto(url, timeout=60000, wait_until='domcontentloaded')

            await page.wait_for_selector("span#productTitle", timeout=15000)
            title = await page.locator("span#productTitle").inner_text()

            try:
                price = await page.locator("span.a-price > span.a-offscreen").first.inner_text()
            except:
                price = "Not Available"

            try:
                image_url = await page.locator("img#landingImage").get_attribute("src")
            except:
                image_url = ""

            print(f"[✓] Scraped: {title.strip()} — {price}")

            # Save to DB
            conn = sqlite3.connect("prices.db")
            c = conn.cursor()
            timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            c.execute("""
                INSERT INTO product_prices (url, product_name, price, timestamp)
                VALUES (?, ?, ?, ?)
            """, (url, title.strip(), price, timestamp))
            conn.commit()
            conn.close()

            return {
                "title": title.strip(),
                "price": price,
                "image_url": image_url
            }

        except Exception as e:
            print(f"[✗] Error scraping {url}: {e}")
            return {"error": str(e)}
        finally:
            await browser.close()

class URLItem(BaseModel):
    url: str

@app.post("/scrape")
async def scrape_endpoint(item: URLItem):
    result = await scrape_product(item.url)
    return JSONResponse(content=result)

@app.post("/history")
async def get_price_history(item: URLItem):
    try:
        conn = sqlite3.connect("prices.db")
        c = conn.cursor()
        c.execute("""
            SELECT timestamp, price FROM product_prices
            WHERE url = ?
            ORDER BY timestamp
        """, (item.url,))
        rows = c.fetchall()
        conn.close()

        history = []
        for timestamp, price in rows:
            try:
                numeric_price = float(price.replace("₹", "").replace(",", "").strip())
                history.append({
                    "timestamp": timestamp,
                    "price": numeric_price
                })
            except:
                # Skip if price conversion fails (e.g., "Not Available")
                continue

        return JSONResponse(content={"history": history})
    except Exception as e:
        return JSONResponse(content={"error": str(e)}, status_code=500)
