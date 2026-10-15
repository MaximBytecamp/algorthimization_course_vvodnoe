"""Готовит кадры с закрашенными личными данными: shots/steps → shots/edited.

Прямоугольники заданы долями ширины и высоты кадра, поэтому не зависят от масштаба снимка.
Запуск: python3 prep_shots.py (нужен Pillow). Затем node build.mjs.
"""
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).parent
STEPS = ROOT / 'shots' / 'steps'
OUT = ROOT / 'shots' / 'edited'

# файл шага → список (x1, y1, x2, y2) в долях кадра
MASKS = {
    '038-google-choose-account.png': [(0.535, 0.37, 0.67, 0.435)],          # имя и почта аккаунта Google
    '039-google-consent.png': [(0.155, 0.465, 0.31, 0.51)],                # почта аккаунта Google
    '045-conn-leads-preview.png': [(0.494, 0.235, 0.67, 0.505)],          # name и email тестовых заявок
    '078-ds-leads-fields.png': [(0.43, 0.88, 0.645, 1.0)],                 # name и email в предпросмотре
    '164-share-org.png': [(0.26, 0.46, 0.39, 0.505)],                      # имя и почта автора в правах доступа
    '166-conn-credentials.png': [(0.494, 0.175, 0.67, 0.445)],            # name и email тестовых заявок
}


def pixelate(img, box):
    w, h = img.size
    x1, y1, x2, y2 = int(box[0] * w), int(box[1] * h), int(box[2] * w), int(box[3] * h)
    part = img.crop((x1, y1, x2, y2))
    small = part.resize((max(1, (x2 - x1) // 24), max(1, (y2 - y1) // 24)), Image.BILINEAR)
    img.paste(small.resize(part.size, Image.NEAREST), (x1, y1))


# файл шага → кадрирование (x1, y1, x2, y2) в долях кадра: пустые страницы с одной надписью
CROPS = {
    '002-lookerstudio-open.png': (0.3, 0.0, 0.7, 0.32),
}


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    for name, box in CROPS.items():
        img = Image.open(STEPS / name).convert('RGB')
        w, h = img.size
        img.crop((int(box[0] * w), int(box[1] * h), int(box[2] * w), int(box[3] * h))).save(OUT / name, optimize=True)
        print('обрезано:', name)
    for name, boxes in MASKS.items():
        img = Image.open(STEPS / name).convert('RGB')
        for box in boxes:
            pixelate(img, box)
        img.save(OUT / name, optimize=True)
        print('закрашено:', name)


if __name__ == '__main__':
    main()
