from concurrent.futures import ThreadPoolExecutor

import arxiv
import requests


class ArxivDownloader:
    def __init__(self, query: str, max_results: int, sort_by: arxiv.SortCriterion.Relevance):
        """
        Initializes the ArxivDownloader with a search query, maximum results, and sorting criterion.

        Parameters:
        - query (str): The search query to use in the arXiv search.
        - max_results (int): The maximum number of results to retrieve from the search.
        - sort_by (arxiv.SortCriterion): The criterion used to sort the search results. Relevance by default. 
        """
        self.query = query
        self.max_results = max_results
        self.sort_by = sort_by

        self.search = arxiv.Search(
            query=self.query,
            max_results=self.max_results,
            sort_by=self.sort_by
        )

        self.search_results = []

        self._get_search_results()

    def _get_search_results(self):
        for result in self.search.results():
            self.search_results.append((result.title, result.pdf_url))


def download_pdf(title: str, link: str) -> str:
    """
    Downloads the PDF associated with a given arXiv article.

    Parameters:
    - title (str): The title of the article to download.
    - link (str): The URL to the PDF.

    Returns:
    - str: A message indicating whether the download was successful or not.
    """
    link = link.strip()
    try:
        response = requests.get(link, timeout=10)
        response.raise_for_status()
        pdf_path = f"arxiv_pdfs/{title}.pdf"
        with open(pdf_path, "wb") as pdf_file:
            pdf_file.write(response.content)
        return f"Скачано: {title}"
    except requests.exceptions.RequestException as e:
        return f"Ошибка для {title}: {e}"


if __name__ == "__main__":
    query = "machine learning"
    max_results = 10
    sort_by = arxiv.SortCriterion.Relevance

    downloader = ArxivDownloader(query, max_results, sort_by)
    search_results = downloader.search_results

    titles = []
    links = []

    with ThreadPoolExecutor(max_workers=5) as executor:
        for obj in search_results:
            titles.append(obj[0])
            links.append(obj[1])
        results = executor.map(download_pdf, titles, links)

    for result in results:
        print(result)
