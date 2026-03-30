from openai import OpenAI
client = OpenAI()

stream = client.responses.create(
    model="gpt-5.4-mini",
    input=[
        {
            "role": "user",
            "content": "Give me 5 questions to ask someone you don't know but would like to get talking. (Not exactly get to know just to get the person you're talking to to enjoy talking)",
        },
    ],
    stream=True,
)

for event in stream:
    if event.type == "response.output_text.delta":
        print(event.delta, end="", flush=True)
    elif event.type == "response.completed":
        print()