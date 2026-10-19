
from core.functions.globalFunctions import EchoLogging

# TODO: Create a pricing module for OpenAI API
class OpenAIPricing():
    def __init__(self):
        self.logger = EchoLogging()
        self.logger.log("OpenAIPricing initialized")
        
    def openai_api_calculate_cost(usage,model="gpt-3.5-turbo-16k"):
        pricing = {
            'gpt-3.5-turbo-0125': {
                'prompt': 0.5,
                'completion': 1.5,
            },
            'gpt-4-turbo': {
                'prompt': 10.0,
                'completion': 30.0,
            },
            'gpt-4-1106-preview': {
                'prompt': 10.0,
                'completion': 30.0,
            },
            'gpt-4o': {
                'prompt': 5.0,
                'completion': 15.0,
            },
            'text-embedding-ada-002-v2': {
                'prompt': 0.0001,
                'completion': 0.0001,
            }
        }

        try:
            model_pricing = pricing[model]
        except KeyError:
            print(f"Model {model} not found in pricing table")
            return 0

        prompt_cost = usage['prompt_tokens'] * model_pricing['prompt'] / 1000000
        completion_cost = usage['completion_tokens'] * model_pricing['completion'] / 1000000

        total_cost = prompt_cost + completion_cost
        print(f"Total cost for {model}: ${total_cost:.4f}\n")

        return total_cost