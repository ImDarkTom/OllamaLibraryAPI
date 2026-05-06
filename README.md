# OllamaLibraryAPI

> [!IMPORTANT]
> **Not affiliated with [Ollama](https://github.com/ollama/ollama) or its creators in any way.**

## About

This repository was created to provide an easy way to access the information on the [Ollama website's](https://ollama.com/) model library page.

It currently:
- Runs a GitHub Actions script every 3 days to fetch the list of models (ordered by newest) by fetching HTML responses from the website.
- Parses the HTML using Cheerio.
- Creates a JSON list of the model data.
- Publishes the list to GitHub Pages.

## Usage

The list can be accessed at https://imdarktom.github.io/OllamaLibraryAPI/models.json

If you are using this list in a project, please include a reference back to this repository and note that the data originates from [ollama.com](https://ollama.com/).

Example attribution:
> Model info sourced from [ollama.com](https://ollama.com/), aggregated by [OllamaLibraryAPI](https://github.com/ImDarkTom/OllamaLibraryAPI).

## Disclaimer

This project is not affiliated with Ollama or its creators. All model data belongs to their respective owners. This repository simply provides a structured view of publicly available information on [ollama.com/models](https://ollama.com/models). This tool should not be used in any way that violates Ollama's  [Terms of Service](https://ollama.com/terms). 

## License

This project is [MIT](LICENSE). 
