# Шрифты дисциплины

## Haipapikuseru — пиксельный шрифт заголовков

В Google Fonts этого шрифта нет, поэтому он не подключается ссылкой,
а лежит здесь файлом. Положите в эту папку:

    Haipapikuseru.woff2      (предпочтительно)
    Haipapikuseru.ttf        (запасной формат)

Скачать: https://fonts-online.ru/fonts/haipapikuseru-finale
Лицензия: GNU GPL 3.0, кириллица поддерживается.

Конвертация ttf → woff2 (файл легче примерно втрое):

    pip install fonttools brotli
    python3 -c "from fontTools.ttLib import TTFont; f=TTFont('Haipapikuseru.ttf'); f.flavor='woff2'; f.save('Haipapikuseru.woff2')"

Пока файла нет, заголовки набираются запасным Handjet из Google Fonts —
колода работает, но выглядит иначе. Подключение — в `../styles.css`,
блок `@font-face` в начале файла.

## Что чем набирается

- заголовки и мелкие подписи — Haipapikuseru, запасной Handjet;
- основной текст — IBM Plex Sans;
- **всё числовое — JetBrains Mono**: у Handjet перечёркнутый ноль,
  и «90» читается как «98». Не переводите числа на пиксельный шрифт,
  не проверив цифры 0, 8 и 9.
