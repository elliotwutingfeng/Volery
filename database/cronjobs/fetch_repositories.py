import asyncio
import json
import logging
import os
from collections import defaultdict
from datetime import datetime

from http_requests import backoff_delay_async, get_async
from more_itertools import chunked
from postgrest import APIError
from supabase import Client, create_client


def fetch_arch_official_repositories(
    sbp: Client, current_timestamp: datetime, max_retries: int, logger: logging.Logger
) -> bool:
    """Get all Arch Official API packages metadata

    Args
    ----
        sbp (Client): Supabase client class.
        current_timestamp (datetime): Time when metadata was fetched.
        max_retries (int): Maximum retries for asyncio operations.
        logger (logging.Logger): Standard Python Logger.

    Returns
    -------
        bool: True if operation is successful, otherwise False.
    """
    page_one_endpoint = "https://archlinux.org/packages/search/json/?page=1"
    response = asyncio.run(get_async([page_one_endpoint]))[page_one_endpoint]
    body = json.loads(response)
    results_pages = []

    if "results" not in body:
        logger.error("First page has no 'results' field")
        return False
    results_pages.append(body["results"])

    if "num_pages" not in body:
        logger.error("First page has no 'num_pages' field")
        return False
    num_pages = body["num_pages"]

    if num_pages > 1:
        responses = asyncio.run(
            get_async(
                [
                    f"https://archlinux.org/packages/search/json/?page={page}"
                    for page in range(2, num_pages + 1)
                ]
            )
        )

        for endpoint, response in sorted(responses.items(), key=lambda x: int(x[0].split("=")[1])):
            body = json.loads(response)
            if "results" in body:
                results_pages.append(body["results"])
            else:
                logger.warning("Page at %s has no 'results' field", endpoint)
    logger.info("arch_official data downloaded")
    for page_number, results_page in enumerate(results_pages, start=1):
        for row in results_page:
            row["volery_last_synced"] = str(current_timestamp)
        # Upsert packages metadata to database
        for number_of_retries_made in range(max_retries):
            try:
                sbp.table("arch_official").upsert(results_page).execute()
                logger.info(
                    "arch_official | Page %d out of %d updated", page_number, len(results_pages)
                )
                break
            except APIError as error:
                logger.warning(
                    "Upsert arch official repositories page %d | %s | Attempt %d failed",
                    page_number,
                    error,
                    number_of_retries_made + 1,
                )
                if number_of_retries_made != max_retries - 1:  # No delay if final attempt fails
                    asyncio.run(backoff_delay_async(1, number_of_retries_made))
                else:
                    logger.warning("Failed to upsert page %d metadata to database", page_number)
    return True


def fetch_aur(
    sbp: Client, current_timestamp: datetime, max_retries: int, logger: logging.Logger
) -> bool:
    """Get all AUR API packages metadata

    Args
    ----
        sbp (Client): Supabase client class.
        current_timestamp (datetime): Time when metadata was fetched.
        max_retries (int): Maximum retries for asyncio operations.
        logger (logging.Logger): Standard Python Logger.

    Returns
    -------
        bool: True if operation is successful, otherwise False.
    """
    endpoint = "https://aur.archlinux.org/packages-meta-ext-v1.json.gz"
    response = asyncio.run(get_async([endpoint]))[endpoint]
    if response == b"{}":
        logger.error("%s is empty", endpoint)
        return False
    all_results = json.loads(response)
    logger.info("aur data downloaded")

    # Workaround for https://github.com/supabase/postgrest-js/issues/173
    # Each row in all_results has a combination of keys
    # Categorise rows in all_results by the combinations of keys they have
    # Then perform a batch update for each category
    categories = defaultdict(list)
    for row in all_results:
        row["volery_last_synced"] = str(current_timestamp)
        keys_combination = frozenset(row.keys())
        categories[keys_combination].append(row)

    for category_results in categories.values():
        for page_number, chunk in enumerate(chunked(category_results, 1000), start=1):
            # Upsert packages metadata to database
            for number_of_retries_made in range(max_retries):
                try:
                    sbp.table("aur").upsert(chunk).execute()
                    break
                except APIError as error:
                    logger.warning(
                        "Upsert AUR page %d | %s | Attempt %d failed",
                        page_number,
                        error,
                        number_of_retries_made + 1,
                    )
                    if number_of_retries_made != max_retries - 1:  # No delay if final attempt fails
                        asyncio.run(backoff_delay_async(1, number_of_retries_made))
                    else:
                        logger.warning("Failed to upsert page %d metadata to database", page_number)
    return True


def main() -> None:
    logger = logging.getLogger()
    current_timestamp = datetime.utcnow()

    url: str | None = os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
    key: str | None = os.environ.get("SUPABASE_SERVICE_KEY")

    if type(url) is not str:
        raise Exception("Cannot access NEXT_PUBLIC_SUPABASE_URL")
    if type(key) is not str:
        raise Exception("Cannot access SUPABASE_SERVICE_KEY")

    max_retries = 5

    for number_of_retries_made in range(max_retries):
        try:
            sbp: Client = create_client(url, key)
            break
        except Exception as error:
            logger.warning(
                "Create supabase Client | %s | Attempt %d failed", error, number_of_retries_made + 1
            )
            if number_of_retries_made != max_retries - 1:  # No delay if final attempt fails
                asyncio.run(backoff_delay_async(1, number_of_retries_made))
            else:
                raise Exception("Create supabase Client failed")

    if not fetch_arch_official_repositories(sbp, current_timestamp, max_retries, logger):
        raise Exception("Fetch Arch official repositories metadata failed")
    if not fetch_aur(sbp, current_timestamp, max_retries, logger):
        raise Exception("Fetch AUR metadata failed")


if __name__ == "__main__":
    main()
