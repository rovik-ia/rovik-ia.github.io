#!/usr/bin/env python3
"""Averigua el chat_id de Telegram a partir del token del bot.

Uso: python3 scripts/telegram_chat_id.py <TOKEN>
Antes hay que abrir el chat del bot en Telegram y pulsar Empezar (o escribirle algo).
"""
import json, ssl, sys, urllib.request
try:
    import certifi; CTX = ssl.create_default_context(cafile=certifi.where())
except ImportError:
    CTX = ssl.create_default_context()

token = (sys.argv[1] if len(sys.argv) > 1 else "").strip()
if not token:
    sys.exit("Falta el token del bot")

with urllib.request.urlopen(f"https://api.telegram.org/bot{token}/getUpdates", timeout=30, context=CTX) as r:
    data = json.load(r)

if not data.get("ok"):
    sys.exit(f"Token rechazado: {data}")
chats = {}
for u in data.get("result", []):
    msg = u.get("message") or u.get("channel_post") or {}
    chat = msg.get("chat") or {}
    if chat.get("id"):
        chats[chat["id"]] = chat.get("title") or " ".join(filter(None, [chat.get("first_name"), chat.get("last_name")])) or chat.get("username", "")
if not chats:
    sys.exit("Sin mensajes todavía: abre el chat del bot en Telegram, pulsa Empezar y vuelve a ejecutar esto.")
for cid, name in chats.items():
    print(f"chat_id={cid}  ({name})")
