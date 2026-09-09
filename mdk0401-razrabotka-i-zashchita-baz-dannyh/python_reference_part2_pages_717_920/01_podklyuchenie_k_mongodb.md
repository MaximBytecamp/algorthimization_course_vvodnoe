# Подключение к MongoDB

### ПОДКЛЮЧЕНИЕ К MONGODB

Создание клиента (MongoClient)

MongoClient — это основной класс для подключения к MongoDB. Он позволяет взаимодействовать с сервером MongoDB.

Пример подключения:

```python
from pymongo import MongoClient
# Подключение к локальному серверу MongoDB
client = MongoClient("mongodb://localhost:27017/")

# Подключение к MongoDB Atlas (облачному сервису)
# client = MongoClient("mongodb+srv://username:password@cluster0.mongodb.net/")
```

localhost:27017 — адрес и порт локального сервера MongoDB.

mongodb+srv://... — строка подключения для MongoDB Atlas.

Выбор базы данных

В MongoDB база данных создается автоматически при первом обращении к ней. Вы можете выбрать базу данных с помощью атрибута или метода.

Пример выбора базы данных:

```python
# Выбор базы данных "mydatabase"
db = client["mydatabase"]

# Альтернативный способ (через метод)
# db = client.get_database("mydatabase")
```

Если база данных mydatabase не существует, она будет создана при первой вставке данных.

Выбор коллекции

Коллекция в MongoDB аналогична таблице в реляционных базах данных. Она также создается автоматически при первом обращении.

Пример выбора коллекции:

```python
# Выбор коллекции "mycollection"
collection = db["mycollection"]

# Альтернативный способ (через метод)
# collection = db.get_collection("mycollection")
```

Если коллекция mycollection не существует, она будет создана при первой вставке данных.

Получение списка баз данных и коллекций

Получение списка баз данных

MongoDB хранит список всех баз данных. Вы можете получить его с помощью метода list_database_names().

Пример:

```python
# Получение списка всех баз данных
database_names = client.list_database_names()
print("Базы данных:", database_names)
```

Этот метод возвращает список имен баз данных.

Получение списка коллекций

Вы можете получить список коллекций в конкретной базе данных с помощью метода list_collection_names().

Пример:

```python
# Получение списка коллекций в базе данных "mydatabase"
collection_names = db.list_collection_names()
print("Коллекции в базе данных:", collection_names)
```

Этот метод возвращает список имен коллекций.

Создание коллекций

В MongoDB коллекции создаются автоматически при первой вставке данных. Однако вы можете создать коллекцию явно, если хотите задать специфические параметры (например, валидацию схемы).

Неявное создание коллекции

Коллекция создается автоматически при первой вставке документа.

Пример:

```python
# Вставка документа в коллекцию "mycollection" (если её нет, она будет создана)
```

collection.insert_one({"name": "Alice", "age": 25})

Явное создание коллекции

Вы можете создать коллекцию вручную с помощью метода create_collection().

Пример:

```python
# Создание коллекции "mycollection" с валидацией схемы
```

db.create_collection("mycollection", {

```python
    "validator": {
        "$jsonSchema": {
            "bsonType": "object",
            "required": ["name", "age"],
            "properties": {
                "name": {
                    "bsonType": "string",
                    "description": "Имя должно быть строкой"
                },
                "age": {
                    "bsonType": "int",
                    "minimum": 0,
                    "description": "Возраст должен быть положительным числом"
                }
            }
        }
    }
})
```

validator — позволяет задать правила валидации для документов в коллекции.

Если коллекция уже существует, будет вызвано исключение.

Резюме

Создайте клиент (MongoClient) для подключения к MongoDB.

Выберите базу данных с помощью client["db_name"] или client.get_database("db_name").

Выберите коллекцию с помощью db["collection_name"] или db.get_collection("collection_name").

Получите список баз данных с помощью client.list_database_names().

Получите список коллекций с помощью db.list_collection_names().

Создайте коллекцию:

Неявно: При первой вставке документа.

Явно: С помощью db.create_collection().
