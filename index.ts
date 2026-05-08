import * as cheerio from 'cheerio';
import { writeFile } from 'fs/promises';

const MAX_PAGES = 20; // So we don't somehow get stuck in an infinite loop.
const OUT_PATH = './dist/models.json';
const DELAY_MS = 1000;

const MAX_ATTEMPTS = 3;
const BACKOFF_MS = 15000; // 10 seconds if we get rate limited

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

let data: any[] = [];

async function fetchData(url: string): Promise<Response | null> {
    console.log(`Fetching page: ${url}`);
    
    for (let i = 0; i < MAX_ATTEMPTS; i++) {
        const res = await fetch(url, {
            headers: {
                'HX-Request': 'true',
                'User-Agent': 'OllamaLibraryAPI/1.0 (https://github.com/ImDarkTom/OllamaLibraryAPI)'
            },
        });

        if (res.status === 429) { // rate limit
            console.log(`Rate limited on attempt ${i}. Trying again...`);
            await sleep(BACKOFF_MS);
            continue;
        }

        if (!res.ok) {
            console.error(`Failed to fetch page: ${res.status}, stopping...`);
            return null;
        }

        return res;
    }

    throw new Error('Failed after max retries.');
}

for (let page = 1; page < MAX_PAGES; page++) {
    let url: string;
    if (page === 1) {
        url = `https://ollama.com/search?o=newest&q=`
    } else {
        url = `https://ollama.com/search?page=${page}&o=newest`;
    }

    const res = await fetchData(url);
    if (!res) {
        console.error(`Failed to fetch data on page`);
        break;
    }

    const html = await res.text();
    if (!html.trim()) { // once we're out of results, pages will return blank
        console.log(`Page ${page} is blank, exiting as finished.`)
        break;
    }

    const $ = cheerio.load(html);
    $('li[x-test-model]').each((i, el) => {
        const $item = $(el);

        const model = $item.find('span[x-test-search-response-title]').text();
        const description = $item.find(`div[title="${model}"] p`).text();

        const capabilities: string[] = [];
        $item.find('span[x-test-capability]').each((_ci, capEl) => {
            capabilities.push($(capEl).text());
        });

        const sizes: string[] = [];
        $item.find('span[x-test-size]').each((_si, sizeEl) => {
            sizes.push($(sizeEl).text());
        });

        const hasCloud = $item.find('span.text-cyan-500.sm\\:text-\\[13px\\]').length > 0;

        const lastUpdated = $item.find('span[x-test-updated]').parent().attr('title');

        const tagCount = $item.find('span[x-test-tag-count]').text();
        const pullCount = $item.find('span[x-test-pull-count]').text();

        
        data.push({
            model,
            description,
            capabilities,
            sizes,
            hasCloud,
            lastUpdated,
            tagCount,
            pullCount
        });
    });

    console.log(`Added items from page ${page} into list. Current length: ${data.length}`);

    console.log(`Wating ${DELAY_MS}ms before next request...`)
    await sleep(DELAY_MS);
}

if (data.length === 0) {
    console.error('Failed with no data');
    process.exit(1);
}

await writeFile(OUT_PATH, JSON.stringify(data));
