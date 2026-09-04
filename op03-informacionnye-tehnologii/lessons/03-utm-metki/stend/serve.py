#!/usr/bin/env python3
"""Локальный сервер учебного стенда.

Отличие от `python3 -m http.server`: этот сервер знает адрес `/g/collect`
и отвечает на него кодом `204 No Content` — так же, как настоящий сервер
системы аналитики. Строки запросов в панели Network будут зелёными.

Встроенный сервер Python и Live Server такого адреса не знают и отвечают
`404` или `405 Method Not Allowed`. Разбору это не мешает — параметры запроса
читаются на вкладке Payload при любом коде ответа, — но красные строки
отвлекают, поэтому на занятии удобнее запускать этот файл.

Запуск из папки stend:

    python3 serve.py            # http://localhost:8000
    python3 serve.py 8080       # другой порт, если 8000 занят
"""

import sys
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

STEND = Path(__file__).resolve().parent


class StendHandler(SimpleHTTPRequestHandler):
    """Отдаёт файлы стенда и принимает события на /g/collect."""

    def _is_collect(self):
        # Текущий стенд шлёт событие запросом картинки g/collect.gif;
        # адрес /g/collect оставлен для совместимости со старыми копиями.
        return self.path.split('?')[0] in ('/g/collect', '/g/collect.gif')

    def _accept_event(self):
        # 204 No Content: запрос принят, тела ответа нет — норма для аналитики.
        self.send_response(204)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()

    # sendBeacon шлёт POST; fetch с keepalive — тоже POST.
    def do_POST(self):
        if self._is_collect():
            return self._accept_event()
        self.send_error(405, 'Method Not Allowed')

    # Часть счётчиков отправляет события обычным GET — принимаем и его.
    def do_GET(self):
        # Картинку отдаём как обычный файл — просто отмечаем событие в журнале.
        if self.path.split('?')[0] == '/g/collect':
            return self._accept_event()
        super().do_GET()

    def log_message(self, fmt, *args):
        # В консоли показываем только события, чтобы не тонуть в запросах файлов.
        if self._is_collect():
            name = self.path.split('en=')[-1].split('&')[0] if 'en=' in self.path else '—'
            sys.stderr.write(f'  событие: {name}\n')


def main():
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8000
    handler = partial(StendHandler, directory=str(STEND))
    with ThreadingHTTPServer(('127.0.0.1', port), handler) as httpd:
        print(f'Учебный стенд: http://localhost:{port}/')
        print(f'С метками:     http://localhost:{port}/'
              f'?utm_source=vk&utm_medium=social&utm_campaign=sept_open_2026')
        print('Остановить — Ctrl + C\n')
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print('\nСервер остановлен.')


if __name__ == '__main__':
    main()
