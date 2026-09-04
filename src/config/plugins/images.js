const crypto = require("node:crypto");
const fs = require("node:fs/promises");
const path = require("node:path");
const sharp = require("sharp");

const generatedImages = new Map();
const supportedFormats = new Set(["avif", "webp", "jpeg"]);

function updateTransform(value, transform) {
    const current = typeof value === "string" ? { inputPath: value } : value;

    if (!current || typeof current.inputPath !== "string") {
        throw new TypeError("The image shortcode requires an image path.");
    }

    return {
        ...current,
        ...transform,
    };
}

function resolveSource(inputPath) {
    const sourceRoot = path.resolve("src");
    const relativePath = inputPath.replace(/^[/\\]+/, "");
    const sourcePath = path.resolve(sourceRoot, relativePath);
    const relativeToRoot = path.relative(sourceRoot, sourcePath);

    if (relativeToRoot.startsWith("..") || path.isAbsolute(relativeToRoot)) {
        throw new Error(`Image path must stay inside the src directory: ${inputPath}`);
    }

    return sourcePath;
}

function imageOptions(format) {
    switch (format) {
        case "avif":
            return { quality: 75, effort: 4 };
        case "webp":
            return { quality: 80, effort: 4 };
        case "jpeg":
            return { quality: 85, progressive: true };
        default:
            throw new Error(`Unsupported image format: ${format}`);
    }
}

module.exports = function imagePlugin(eleventyConfig, options = {}) {
    const outputDir = path.resolve(options.outputDir || "public/assets/images");
    const urlPath = `/${(options.urlPath || "/assets/images").replace(/^\/+|\/+$/g, "")}`;

    eleventyConfig.addFilter("resize", (value, resize) => updateTransform(value, { resize }));

    for (const format of supportedFormats) {
        eleventyConfig.addFilter(format, (value) => updateTransform(value, { format }));
    }

    eleventyConfig.addAsyncShortcode("getUrl", async (value) => {
        const transform = typeof value === "string" ? { inputPath: value } : value;
        const format = transform?.format || "jpeg";
        const width = Number(transform?.resize?.width);
        const height = Number(transform?.resize?.height);

        if (!supportedFormats.has(format)) {
            throw new Error(`Unsupported image format: ${format}`);
        }

        if (!Number.isInteger(width) || width <= 0 || !Number.isInteger(height) || height <= 0) {
            throw new Error(`Image width and height must be positive integers: ${transform?.inputPath}`);
        }

        const sourcePath = resolveSource(transform.inputPath);
        const sourceStats = await fs.stat(sourcePath);
        const transformKey = JSON.stringify({ inputPath: transform.inputPath, width, height, format });
        const cacheKey = JSON.stringify({
            sourcePath,
            width,
            height,
            format,
            sourceSize: sourceStats.size,
            sourceModified: sourceStats.mtimeMs,
        });

        if (!generatedImages.has(cacheKey)) {
            generatedImages.set(cacheKey, (async () => {
                const source = await fs.readFile(sourcePath);
                const hash = crypto
                    .createHash("sha256")
                    .update(source)
                    .update(transformKey)
                    .digest("hex")
                    .slice(0, 8);
                const parsedPath = path.parse(sourcePath);
                const filename = `${parsedPath.name}-${hash}.${format === "jpeg" ? "jpg" : format}`;
                const outputPath = path.join(outputDir, filename);

                await fs.mkdir(outputDir, { recursive: true });
                await sharp(source)
                    .rotate()
                    .resize(width, height, { fit: "cover", position: "centre" })
                    .toFormat(format, imageOptions(format))
                    .toFile(outputPath);

                return `${urlPath}/${filename}`;
            })());
        }

        return generatedImages.get(cacheKey);
    });
};
