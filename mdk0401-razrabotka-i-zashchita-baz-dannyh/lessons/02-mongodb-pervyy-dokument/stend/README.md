# Стенд занятия 1 · MongoDB

Один узел MongoDB 7 в Docker и набор учебных резюме для загрузки через Compass.

## Запуск

```bash
docker compose up -d      # поднять сервер
docker compose ps         # убедиться, что статус healthy
```

Сервер слушает `localhost:27017`, проверки подлинности нет.
Строка подключения для Compass:

```
mongodb://localhost:27017
```

## Данные

`seed/resumes.json` — массив из восьми резюме. Загружается через Compass:
**ADD DATA → Import JSON or CSV file**, формат JSON определяется автоматически.
Даты записаны в расширенном виде `{"$date": "..."}`, поэтому попадают в базу
типом Date, а не строкой.

Первый документ студент создаёт руками — через **ADD DATA → Insert document**,
поэтому в коллекции после занятия оказывается девять документов.

Формы документов намеренно разные: у одного есть `portfolio`, у другого `courses`,
у третьего `experience` — пустой массив. На этом строится разбор `$exists`
и разговор про schema validation на занятии 3.

## Сброс

```bash
docker compose down -v    # удалить контейнер вместе с данными
docker compose up -d      # поднять заново, база пустая
```

Ключ `-v` обязателен: без него том `mongo-data` переживёт перезапуск,
и коллекция останется заполненной.

## Проверка без Compass

```bash
docker exec hh-mongo mongosh hh --quiet --eval 'db.resumes.countDocuments()'
docker exec hh-mongo mongosh hh --quiet --eval 'db.resumes.find({ city: "Ярославль" }).count()'
```
