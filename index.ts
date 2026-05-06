import * as cheerio from 'cheerio';
import { writeFile } from 'fs/promises';

const MAX_PAGES = 20; // So we don't somehow get stuck in an infinite loop.
const OUT_PATH = './data.json';

let data: any[] = [];

for (let page = 0; page < MAX_PAGES; page++) {
    let url: string;
    if (page === 0) {
        url = `https://ollama.com/search?o=newest&q=`
    } else {
        url = `https://ollama.com/search?page=${page}&o=newest`;
    }

    const res = await fetch(url, {
        headers: {
            'HX-Request': 'true',
        }
    });

    if (!res.ok) {
        console.error(`Failed to fetch page: ${res.status}, stopping...`);
        break;
    }

    const html = await res.text();
    if (!html.trim()) { // once we're out of results, pages will return blank
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

    page++;
}

await writeFile(OUT_PATH, JSON.stringify(data));