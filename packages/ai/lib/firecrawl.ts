import Firecrawl from "@mendable/firecrawl-js";
import { keys } from "@/env";

const env = keys();

let firecrawlClient: Firecrawl | null = null;

function getFirecrawl(): Firecrawl {
  if (!env.FIRECRAWL_API_KEY) {
    throw new Error("FIRECRAWL_API_KEY is not configured");
  }

  if (!firecrawlClient) {
    firecrawlClient = new Firecrawl({ apiKey: env.FIRECRAWL_API_KEY });
  }

  return firecrawlClient;
}

export async function searchDocs(query: string, limit = 3) {
  const firecrawl = getFirecrawl();

  const results = await firecrawl.search(query, {
    limit,
    scrapeOptions: { formats: ["markdown"] },
  });

  return results;
}

export async function scrapePage(url: string) {
  const firecrawl = getFirecrawl();

  const doc = await firecrawl.scrape(url, {
    formats: ["markdown", "html"],
  });

  return doc;
}

export async function searchFrameworkDocs(
  framework: string,
  query: string,
  limit = 2
) {
  const firecrawl = getFirecrawl();

  const searchQuery = `${framework} ${query}`;
  const results = await firecrawl.search(searchQuery, {
    limit,
    scrapeOptions: { formats: ["markdown"] },
  });

  return results;
}

export async function scrapeMultiplePages(urls: string[]) {
  const firecrawl = getFirecrawl();

  const results = await Promise.all(
    urls.map((url) =>
      firecrawl.scrape(url, {
        formats: ["markdown"],
      })
    )
  );

  return results;
}
