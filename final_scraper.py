import asyncio
from playwright.async_api import async_playwright
from bs4 import BeautifulSoup
import time
import re

async def extract_clean_restaurants():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()
        
        try:
            print("Navigating to GoFood page...")
            await page.goto("https://gofood.co.id/en/jakarta/bekasi-restaurants/most_loved")
            await page.wait_for_load_state("networkidle")
            
            print("Scrolling to load all content...")
            for i in range(20):
                await page.evaluate("window.scrollTo(0, document.body.scrollHeight)")
                await page.wait_for_timeout(2000)
                
                try:
                    load_more = page.locator('button:has-text("Load more")')
                    if await load_more.is_visible():
                        await load_more.click()
                        print(f"Clicked 'Load more' button on scroll {i+1}")
                        await page.wait_for_timeout(3000)
                except:
                    pass
            
            content = await page.content()
            soup = BeautifulSoup(content, 'html.parser')
            
            restaurants = set()
            restaurant_links = soup.find_all('a', href=lambda x: x and '/restaurant/' in x)
            print(f"Found {len(restaurant_links)} restaurant links")
            
            for link in restaurant_links:
                try:
                    full_text = link.get_text(strip=True)
                    
                    text_no_rating = re.sub(r'^[\d\.]+', '', full_text)
                    
                    categories = ['Fast food', 'Chicken', 'Beverages', 'Rice', 'Snacks', 'Coffee', 'Sweets', 'Middle Eastern', 'Indonesian', 'Japanese', 'duck', 'Korean', 'Noodles', 'Bakery']
                    
                    name_location_text = text_no_rating
                    for category in categories:
                        if category in text_no_rating:
                            name_location_text = text_no_rating.split(category)[0].strip()
                            break
                    
                    if ',' in name_location_text:
                        parts = name_location_text.split(',')
                        if len(parts) >= 2:
                            name = parts[0].strip()
                            location = parts[1].strip()
                            
                            name = name.replace('&amp;', '&')
                            location = location.replace('&amp;', '&')
                            
                            for cat in categories:
                                location = location.replace(cat, '').strip()
                            
                            location = re.sub(r'\s*(Sweets|Snacks|Rice|Chicken|duck|Korean|Noodles|Bakery).*$', '', location).strip()
                            
                            location = re.sub(r'[^a-zA-Z\s\-]+$', '', location).strip()
                            
                            if name and location and len(name) > 1 and len(location) > 1:
                                restaurant_entry = f"{name}, {location}"
                                restaurants.add(restaurant_entry)
                                print(f"Extracted: {restaurant_entry}")
                
                except Exception as e:
                    print(f"Error processing link: {e}")
                    continue
            
            await browser.close()
            return list(restaurants)
            
        except Exception as e:
            print(f"Error during scraping: {e}")
            await browser.close()
            return []

def save_clean_results(restaurants, filename="gofood_restaurants_clean.txt"):
    with open(filename, 'w', encoding='utf-8') as f:
        f.write(f"GoFood Restaurants - Bekasi Most Loved\n")
        f.write(f"Extracted on: {time.strftime('%Y-%m-%d %H:%M:%S')}\n")
        f.write(f"Total restaurants: {len(restaurants)}\n")
        f.write("-" * 50 + "\n\n")
        
        for restaurant in sorted(restaurants):
            f.write(f"{restaurant}\n")
    
    print(f"Clean results saved to {filename}")

async def main():
    print("Starting final GoFood restaurant extraction...")
    restaurants = await extract_clean_restaurants()
    
    if restaurants:
        save_clean_results(restaurants)
        print(f"\nSuccessfully extracted {len(restaurants)} restaurants:")
        for i, restaurant in enumerate(sorted(restaurants), 1):
            print(f"{i}. {restaurant}")
    else:
        print("No restaurants were extracted")

if __name__ == "__main__":
    asyncio.run(main())
