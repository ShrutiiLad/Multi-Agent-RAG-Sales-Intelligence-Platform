from jsonpath_ng import  parse
import requests


# TODO: WORK ON ERROR HANDLING and NULL EXCEPTIONS, ETC
class NotionHandler:
    def __init__(self, token):
        self.token = token
        self.headers = {
            'Authorization': 'Bearer ' + self.token,
            'Content-Type': 'application/json',
            'Notion-Version': '2022-06-28',
        }


    def get_page(self, page_id):
        response = requests.get(f'https://api.notion.com/v1/pages/{page_id}', headers=self.headers)
        page = response.json()
        return {
            "id": page["id"],
            "title": page["properties"]["title"]["title"][0]["text"]["content"],
            "url": page["url"],
            "created_time": page["created_time"],
            "last_edited_time": page["last_edited_time"],
            "created_by": page["created_by"]["id"],
        }


    def extract_page_info(self, pages):
        results = pages.get('results', [])
        extracted_dicts = []
        for result in results:
            extracted_dict = {
                "id": result.get('id', ''),
                "title": result.get('properties', {}).get('title', {}).get('title', [{}])[0].get('plain_text', ''),
                "url": result.get('url', ''),
                "created_time": result.get('created_time', ''),
                "last_edited_time": result.get('last_edited_time', ''),
                "created_by": result.get('created_by', {}).get('id', '')
            }
            extracted_dicts.append(extracted_dict)
        return extracted_dicts


    def get_all_pages(self):
        payload = {
            "filter": {
                "value": "page",
                "property": "object"
            },
        }
        response = requests.post('https://api.notion.com/v1/search', headers=self.headers, json=payload)
        pages = response.json()
        return self.extract_page_info(pages)


    def get_page_blocks(self, page_id):
        response = requests.get(f'https://api.notion.com/v1/blocks/{page_id}', headers=self.headers)
        blocks = response.json()

        if blocks.get("has_children") == False:
            return None
        
        response = requests.get(f'https://api.notion.com/v1/blocks/{page_id}/children?page_size=100', headers=self.headers)
        blocks = response.json()

        plain_text_data = []

        for block in blocks["results"]:
            data = self.extract_plain_text(block)
            if data != []:
                plain_text_data.append(data)

        # Join all the plain text data
        plain_text_data = "\n\n".join(plain_text_data)
        return plain_text_data


    def extract_plain_text(self, json_data):
        pattern = parse("*.rich_text..plain_text")
        matches = pattern.find(json_data)
        plain_text =  [match.value for match in matches]
        return " ".join(plain_text)


# NOTION_TOKEN = "xxxxx"

# notion = NotionHandler(token=NOTION_TOKEN)

# # print(notion.get_page("4a0ff31bf69d4e21b8948a2d12d1640a"))

# # print(notion.get_all_pages())

# data = notion.get_page_blocks("4a0ff31bf69d4e21b8948a2d12d1640a")

# print(data)


