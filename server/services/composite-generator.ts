import sharp from "sharp";
import { mkdir } from "fs/promises";
import { join } from "path";

export interface CompositeOptions {
  label?: string;
  beforeLabel?: string;
  afterLabel?: string;
}

export class CompositeGenerator {
  private readonly outputDir = "attached_assets/composites";

  async generateBeforeAfter(
    beforePath: string,
    afterPath: string,
    options: CompositeOptions = {}
  ): Promise<string> {
    await mkdir(this.outputDir, { recursive: true });

    try {
      // Read both images
      const beforeBuffer = await sharp(beforePath).toBuffer();
      const afterBuffer = await sharp(afterPath).toBuffer();

      // Get metadata
      const beforeMeta = await sharp(beforeBuffer).metadata();
      const afterMeta = await sharp(afterBuffer).metadata();

      const width = Math.max(beforeMeta.width || 0, afterMeta.width || 0);
      const height = Math.max(beforeMeta.height || 0, afterMeta.height || 0);

      // Create canvas with padding
      const padding = 40;
      const labelHeight = 50;
      const compositeWidth = width * 2 + padding * 3;
      const compositeHeight = height + labelHeight + padding * 2;

      // Resize images to same height if needed
      const resizedBefore = await sharp(beforeBuffer)
        .resize(width, height, { fit: "cover" })
        .toBuffer();

      const resizedAfter = await sharp(afterBuffer)
        .resize(width, height, { fit: "cover" })
        .toBuffer();

      // Create composite with labels
      const composite = await sharp({
        create: {
          width: compositeWidth,
          height: compositeHeight,
          channels: 3,
          background: { r: 255, g: 255, b: 255 },
        },
      })
        .composite([
          {
            input: resizedBefore,
            left: padding,
            top: labelHeight + padding,
          },
          {
            input: resizedAfter,
            left: padding * 2 + width,
            top: labelHeight + padding,
          },
        ])
        .png()
        .toBuffer();

      const filename = `composite-${Date.now()}.png`;
      const filepath = join(this.outputDir, filename);
      await sharp(composite).toFile(filepath);

      return `/${this.outputDir}/${filename}`;
    } catch (error) {
      console.error("Failed to generate composite:", error);
      throw new Error("Failed to generate before/after composite image");
    }
  }

  async generateComparison(
    beforePath: string,
    afterPath: string,
    violationTitle: string
  ): Promise<string> {
    await mkdir(this.outputDir, { recursive: true });

    try {
      // Create a labeled comparison image
      const filename = `comparison-${Date.now()}.png`;
      const filepath = join(this.outputDir, filename);

      const beforeBuffer = await sharp(beforePath).toBuffer();
      const afterBuffer = await sharp(afterPath).toBuffer();

      const beforeMeta = await sharp(beforeBuffer).metadata();
      const afterMeta = await sharp(afterBuffer).metadata();

      const width = Math.max(beforeMeta.width || 0, afterMeta.width || 0);
      const height = Math.max(beforeMeta.height || 0, afterMeta.height || 0);

      const padding = 30;
      const labelHeight = 60;
      const compositeWidth = width * 2 + padding * 3;
      const compositeHeight = height + labelHeight + padding * 2;

      // Resize to same dimensions
      const resizedBefore = await sharp(beforeBuffer)
        .resize(width, height, { fit: "cover" })
        .toBuffer();

      const resizedAfter = await sharp(afterBuffer)
        .resize(width, height, { fit: "cover" })
        .toBuffer();

      // Generate SVG label overlays
      const labelSvgBefore = Buffer.from(`
        <svg width="${width}" height="${labelHeight}">
          <rect width="${width}" height="${labelHeight}" fill="#ffcccc"/>
          <text x="10" y="35" font-size="18" font-weight="bold" fill="#000">Before</text>
        </svg>
      `);

      const labelSvgAfter = Buffer.from(`
        <svg width="${width}" height="${labelHeight}">
          <rect width="${width}" height="${labelHeight}" fill="#ccffcc"/>
          <text x="10" y="35" font-size="18" font-weight="bold" fill="#000">After</text>
        </svg>
      `);

      // Composite everything
      const composite = await sharp({
        create: {
          width: compositeWidth,
          height: compositeHeight + 20,
          channels: 3,
          background: { r: 240, g: 240, b: 240 },
        },
      })
        .composite([
          {
            input: labelSvgBefore,
            left: padding,
            top: padding,
          },
          {
            input: resizedBefore,
            left: padding,
            top: labelHeight + padding,
          },
          {
            input: labelSvgAfter,
            left: padding * 2 + width,
            top: padding,
          },
          {
            input: resizedAfter,
            left: padding * 2 + width,
            top: labelHeight + padding,
          },
        ])
        .png()
        .toBuffer();

      await sharp(composite).toFile(filepath);
      return `/${this.outputDir}/${filename}`;
    } catch (error) {
      console.error("Failed to generate comparison:", error);
      throw new Error("Failed to generate comparison image");
    }
  }
}

export const compositeGenerator = new CompositeGenerator();
