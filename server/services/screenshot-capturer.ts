import puppeteer, { Browser, Page } from "puppeteer";
import { createWriteStream } from "fs";
import { mkdir } from "fs/promises";
import { join } from "path";

export interface ScreenshotOptions {
  selector?: string;
  highlight?: boolean;
  highlightColor?: string;
}

export class ScreenshotCapturer {
  private browser: Browser | null = null;
  private readonly outputDir = "attached_assets/screenshots";

  async initialize() {
    if (!this.browser) {
      this.browser = await puppeteer.launch({
        headless: true,
        args: [
          "--no-sandbox",
          "--disable-setuid-sandbox",
          "--disable-dev-shm-usage",
          "--disable-gpu",
        ],
      });
    }
  }

  async close() {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }

  async captureScreenshot(
    url: string,
    options: ScreenshotOptions = {}
  ): Promise<string> {
    await mkdir(this.outputDir, { recursive: true });
    await this.initialize();

    if (!this.browser) {
      throw new Error("Browser failed to initialize");
    }

    const page = await this.browser.newPage();
    try {
      await page.setViewport({ width: 1920, height: 1080 });
      await page.goto(url, { waitUntil: "networkidle0", timeout: 30000 });

      // Highlight element if selector provided
      if (options.selector && options.highlight) {
        await page.evaluate(
          (selector, color) => {
            const el = document.querySelector(selector);
            if (el) {
              (el as HTMLElement).style.border = `5px solid ${color}`;
              (el as HTMLElement).style.boxShadow = `0 0 12px ${color}`;
              (el as HTMLElement).scrollIntoView({ behavior: "smooth" });
            }
          },
          options.selector,
          options.highlightColor || "#ff0000"
        );

        // Wait for scroll to complete
        await new Promise((r) => setTimeout(r, 500));
      }

      const filename = `screenshot-${Date.now()}.png`;
      const filepath = join(this.outputDir, filename);
      await page.screenshot({ path: filepath, fullPage: true });

      await page.close();
      return `/${this.outputDir}/${filename}`;
    } catch (error) {
      await page.close();
      throw error;
    }
  }

  async captureElementScreenshot(
    url: string,
    selector: string
  ): Promise<string> {
    await mkdir(this.outputDir, { recursive: true });
    await this.initialize();

    if (!this.browser) {
      throw new Error("Browser failed to initialize");
    }

    const page = await this.browser.newPage();
    try {
      await page.setViewport({ width: 1920, height: 1080 });
      await page.goto(url, { waitUntil: "networkidle0", timeout: 30000 });

      const elementHandle = await page.$(selector);
      if (!elementHandle) {
        throw new Error(`Element not found: ${selector}`);
      }

      const filename = `element-${Date.now()}.png`;
      const filepath = join(this.outputDir, filename);
      await elementHandle.screenshot({ path: filepath });

      await page.close();
      return `/${this.outputDir}/${filename}`;
    } catch (error) {
      await page.close();
      throw error;
    }
  }
}

export const screenshotCapturer = new ScreenshotCapturer();
