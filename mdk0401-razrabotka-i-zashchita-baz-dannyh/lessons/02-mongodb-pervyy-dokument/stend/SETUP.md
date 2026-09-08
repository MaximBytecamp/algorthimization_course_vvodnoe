# Откуда Compass берёт данные и обязателен ли Docker

Короткий ответ: **Docker не обязателен**. Compass — это клиент, он ничего
не хранит. Всё, что ему нужно, — адрес работающего сервера MongoDB, который
он получает строкой подключения вида `mongodb://localhost:27017`. Откуда
взялся сервер по этому адресу, Compass не проверяет.

Способов дать ему такой адрес три, и у каждого своя цена.

| Способ | Что ставится | Плюс | Цена |
|---|---|---|---|
| **Docker** (курсовой) | Docker Desktop | одна и та же версия `mongo:7` у всей группы; полный сброс одной командой; в этот же стенд позже дописываются PostgreSQL и остальные | Docker Desktop весит несколько гигабайт и должен быть запущен |
| **Локальная установка** | MongoDB Community Server | сервер стартует вместе с системой, Docker не нужен | версия у каждого своя; удалять базу и ставить рядом второй сервер сложнее |
| **Atlas** (облако) | ничего | работает даже на слабой машине; ставится за пять минут | нужна сеть на паре и учётная запись; `docker compose down -v` уже не сработает, сброс делается руками |

На занятиях мы идём через Docker: год заканчивается стендом из пяти хранилищ,
и собирать их пятью разными установщиками — не то же самое, что дописать
десять строк в `docker-compose.yml`. Но если Docker у вас не встаёт, работа
на паре не останавливается: берите второй или третий способ, запросы и данные
от этого не меняются.

---

## Способ 1. Docker — как в курсе

```bash
cd stend
docker compose up -d      # поднять сервер
docker compose ps         # ждём статус healthy
```

Подключение в Compass: `mongodb://localhost:27017`.

Загрузка учебных данных — через Compass (**ADD DATA → Import JSON or CSV
file**, файл `seed/resumes.json`). Если Compass ещё не установлен, те же
восемь резюме кладутся командой:

```bash
docker exec -i hh-mongo mongoimport \
  --db hh --collection resumes --jsonArray < seed/resumes.json
```

Сброс до пустой базы:

```bash
docker compose down -v && docker compose up -d
```

## Способ 2. MongoDB Community Server прямо в систему

Ставится один раз, дальше сервер поднимается службой.

**macOS** (Homebrew):

```bash
brew tap mongodb/brew
brew install mongodb-community@7.0
brew services start mongodb-community@7.0   # запустить и добавить в автозапуск
brew services stop  mongodb-community@7.0   # остановить
```

**Windows**: установщик с
[mongodb.com/try/download/community](https://www.mongodb.com/try/download/community),
в мастере оставить галочку **Install MongoDB as a Service**. Сервер поднимется
сам и будет подниматься при каждом входе в систему.

**Linux (Ubuntu)**: пакет `mongodb-org` из репозитория MongoDB, затем
`sudo systemctl enable --now mongod`.

Адрес тот же — `mongodb://localhost:27017`, потому что порт по умолчанию
одинаковый. Загрузка данных без Compass — утилитой `mongoimport`
из пакета [MongoDB Database Tools](https://www.mongodb.com/try/download/database-tools):

```bash
mongoimport --db hh --collection resumes --jsonArray --file seed/resumes.json
```

Сброс базы здесь делается изнутри, тома удалять нечего:

```bash
mongosh hh --eval 'db.dropDatabase()'
```

## Способ 3. Atlas — сервер в облаке

1. Завести учётную запись на [cloud.mongodb.com](https://cloud.mongodb.com)
   и создать бесплатный кластер **M0** (0 ₽, 512 МБ — на курс хватает).
2. **Database Access** → создать пользователя с паролем.
3. **Network Access** → добавить свой IP (или `0.0.0.0/0` на время пары,
   если сеть колледжа меняет адрес).
4. **Connect → Compass** → скопировать строку вида
   `mongodb+srv://<user>:<пароль>@cluster0.xxxxx.mongodb.net/` и вставить
   её в Compass.

Данные грузятся тем же **ADD DATA → Import JSON or CSV file**.

Строку подключения с паролем в репозиторий не кладём: она идёт в `.env`,
а `.env` — в `.gitignore`. В `README.md` пишем только, что стенд у вас
в Atlas и какой пользователь нужен.

---

## Проверка, что сервер живой

Одинаково полезна при любом способе. Если эта команда отвечает `1`,
проблема не в сервере, а в строке подключения:

```bash
docker exec hh-mongo mongosh --quiet --eval "db.adminCommand('ping').ok"   # способ 1
mongosh --quiet --eval "db.adminCommand('ping').ok"                        # способ 2
```

| Сообщение Compass | Причина | Что делать |
|---|---|---|
| `connect ECONNREFUSED 127.0.0.1:27017` | сервера по адресу нет | способ 1 — `docker compose up -d`; способ 2 — запустить службу |
| `Server selection timed out` | адрес недоступен | проверить, что в строке `localhost`, а для Atlas — что ваш IP добавлен в Network Access |
| `port is already allocated` | порт 27017 занят другим стендом | поменять левое число в `docker-compose.yml` на `27018` и подключаться к нему |
| `Authentication failed` | Atlas, неверный пароль | пересоздать пользователя в Database Access; спецсимволы в пароле нужно кодировать |

## Запросы занятия — файлом

`queries.mongodb.js` — те же фильтры, что на экранах, только исполняемые.
Запускаются без Compass:

```bash
docker exec -i hh-mongo mongosh hh --quiet --file /dev/stdin < queries.mongodb.js
mongosh hh --quiet --file queries.mongodb.js                       # способ 2
mongosh "<строка подключения Atlas>/hh" --quiet --file queries.mongodb.js
```

Ожидаемые числа — в комментариях рядом с каждым запросом. В Compass
из файла берётся содержимое фигурных скобок: оно вставляется в строку
**FILTER** целиком, вместе со скобками.
