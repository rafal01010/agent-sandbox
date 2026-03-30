from openai import OpenAI
client = OpenAI()

response = client.responses.create(
    model="gpt-5.4-mini",
    tools=[{"type": "web_search"}],
    input="How did the Cleveland Cavaliers won their most recent finished game? Just give me your best answer."
)

print(response.output_text)