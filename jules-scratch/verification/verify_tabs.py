from playwright.sync_api import sync_playwright, TimeoutError

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context()
    page = context.new_page()
    try:
        page.goto("http://localhost:5173", wait_until="networkidle")
        page.screenshot(path="jules-scratch/verification/01_initial_page.png")
        page.click("text=Candidates")
        page.screenshot(path="jules-scratch/verification/02_candidates_tab.png")
        page.click("text=Pipeline & Interviews")
        page.screenshot(path="jules-scratch/verification/03_pipeline_tab.png")
        page.click("text=Automation & Integrations")
        page.screenshot(path="jules-scratch/verification/04_automation_tab.png")
        page.click("text=Team & Community")
        page.screenshot(path="jules-scratch/verification/05_team_tab.png")
        page.click("text=Analytics & Compliance")
        page.screenshot(path="jules-scratch/verification/06_analytics_tab.png")
        page.click("text=Quality & Ethics")
        page.screenshot(path="jules-scratch/verification/07_quality_tab.png")
    except TimeoutError as e:
        print(f"Timeout error: {e}")
        page.screenshot(path="jules-scratch/verification/error.png")
    finally:
        context.close()
        browser.close()

with sync_playwright() as playwright:
    run(playwright)
