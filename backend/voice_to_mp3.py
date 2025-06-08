import tkinter as tk
import speech_recognition as sr
from gtts import gTTS
from openai import OpenAI
import json
import re

recognizer = sr.Recognizer()
audio_data = None




def word_to_json(text):
        # 語音辨識（雙語自動）
        # text = recognizer.recognize_google(audio_data, language="zh-TW")
        # completion = client.chat.completions.create(
        completion = client.chat.completions.create(
            model="gpt-4o-mini",
            store=True,
            messages = [{
                    'role': 'user', 
                    'content': """
                        Please extract the following information from the given text and return it as a JSON object, Just give me the Json part, don't say anything else:

                        restaurant_name
                        date
                        time
                        number_of_people
                    """+text
                }],
                max_tokens=1800
        )

        json_str = re.search(r"\{.*\}", completion.choices[0].message.content, re.DOTALL).group(0)
        data = json.loads(json_str)
        return data
     

