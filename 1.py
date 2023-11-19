import requests

res = requests.post("http://localhost:3000/send_msg", headers={"header": ""},json = {
    "id": "wxid_s1epg7j4rred22",
    "type": "test",
    "content": "hello2"
})