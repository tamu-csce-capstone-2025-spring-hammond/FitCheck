from openai import OpenAI

import environment

client = OpenAI(api_key=environment.get("OPENAI_API_KEY"))
completion = client.chat.completions.create(
    model="gpt-4o-mini",
    messages=[
        {
            "role": "user",
            "content": [
                {"type": "text", "text": "What clothes are in this image?"},
                {
                    "type": "image_url",
                    "image_url": {
                        "url": "https://www.linkedin.com/in/naveen-iyer",
                    },
                },
            ],
        }
    ],
    max_tokens=300,
)

print(completion.choices[0].message.content)

