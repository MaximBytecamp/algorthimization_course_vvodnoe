# Логические операторы и операторы массивов

#### $and: Все условия истинны.

#### $or: Хотя бы одно условие истинно.

#### $not: Отрицание условия.

#### $nor: Ни одно из условий не истинно.

Пример программного кода:

```python
from pymongo import MongoClient
# Подключение к MongoDB
client = MongoClient("mongodb://localhost:27017/")
db = client["mydatabase"]
collection = db["mycollection"]

# Очистка коллекции перед началом (для чистоты эксперимента)
collection.delete_many({})
# Вставка тестовых данных
collection.insert_many([
    {"name": "Alice", "age": 25, "tags": ["python", "mongodb"]},
    {"name": "Bob", "age": 30, "tags": ["java", "mongodb"]},
    {"name": "Charlie", "age": 35, "tags": ["python", "javascript"]},
    {"name": "David", "age": 40, "tags": ["java", "javascript"]},
    {"name": "Eve", "age": 25, "tags": ["python", "java"]}
])
# 1. Оператор $and (Все условия истинны)
print("Документы, где age > 25 И tags содержит 'python':")
for doc in collection.find({
    "$and": [
        {"age": {"$gt": 25}},
        {"tags": "python"}
    ]
}):
    print(doc)
# 2. Оператор $or (Хотя бы одно условие истинно)
print("Документы, где age = 25 ИЛИ tags содержит 'java':")
for doc in collection.find({
    "$or": [
        {"age": 25},
        {"tags": "java"}
    ]
}):
    print(doc)
# 3. Оператор $not (Отрицание условия)
print("Документы, где age НЕ равен 25:")
for doc in collection.find({
    "age": {"$not": {"$eq": 25}}
}):
    print(doc)
# 4. Оператор $nor (Ни одно из условий не истинно)
print("Документы, где age НЕ равен 25 И tags НЕ содержит 'python':")
for doc in collection.find({
    "$nor": [
        {"age": 25},
        {"tags": "python"}
    ]
}):
    print(doc)
client.close()

```

Пример вывода

```python
Документы, где age > 25 И tags содержит 'python':
{'_id': ObjectId('...'), 'name': 'Charlie', 'age': 35, 'tags': ['python', 'javascript']}
Документы, где age = 25 ИЛИ tags содержит 'java':
{'_id': ObjectId('...'), 'name': 'Alice', 'age': 25, 'tags': ['python', 'mongodb']}
{'_id': ObjectId('...'), 'name': 'Bob', 'age': 30, 'tags': ['java', 'mongodb']}
{'_id': ObjectId('...'), 'name': 'David', 'age': 40, 'tags': ['java', 'javascript']}
{'_id': ObjectId('...'), 'name': 'Eve', 'age': 25, 'tags': ['python', 'java']}
Документы, где age НЕ равен 25:
{'_id': ObjectId('...'), 'name': 'Bob', 'age': 30, 'tags': ['java', 'mongodb']}
{'_id': ObjectId('...'), 'name': 'Charlie', 'age': 35, 'tags': ['python', 'javascript']}
{'_id': ObjectId('...'), 'name': 'David', 'age': 40, 'tags': ['java', 'javascript']}
Документы, где age НЕ равен 25 И tags НЕ содержит 'python':
{'_id': ObjectId('...'), 'name': 'Bob', 'age': 30, 'tags': ['java', 'mongodb']}
{'_id': ObjectId('...'), 'name': 'David', 'age': 40, 'tags': ['java', 'javascript']}
```

------------------------------------------------------------------------------------------------

1.3. Операторы для работы с массивами

#### $all: Все указанные значения присутствуют в массиве.

#### $elemMatch: Хотя бы один элемент массива соответствует условию.

#### $size: Размер массива равен указанному значению.

Пример программного кода:

```python
from pymongo import MongoClient
# Подключение к MongoDB
client = MongoClient("mongodb://localhost:27017/")
db = client["mydatabase"]
collection = db["mycollection"]

# Очистка коллекции перед началом (для чистоты эксперимента)
collection.delete_many({})
# Вставка тестовых данных
collection.insert_many([
    {"name": "Alice", "age": 25, "tags": ["python", "mongodb"]},
    {"name": "Bob", "age": 30, "tags": ["java", "mongodb"]},
    {"name": "Charlie", "age": 35, "tags": ["python", "javascript"]},
    {"name": "David", "age": 40, "tags": ["java", "javascript", "mongodb"]},
    {"name": "Eve", "age": 25, "tags": ["python", "java"]}
])
# 1. Оператор $all (Все указанные значения присутствуют в массиве)
print("Документы, где tags содержит 'python' и 'mongodb':")
for doc in collection.find({
    "tags": {"$all": ["python", "mongodb"]}
}):
    print(doc)
# 2. Оператор $elemMatch (Хотя бы один элемент массива соответствует условию)
print("Документы, где хотя бы один элемент tags начинается с 'java':")
for doc in collection.find({
    "tags": {"$elemMatch": {"$regex": "^java"}}
}):
    print(doc)
# 3. Оператор $size (Размер массива равен указанному значению)
print("Документы, где количество элементов в tags равно 2:")
for doc in collection.find({
    "tags": {"$size": 2}
}):
    print(doc)
client.close()

```

Вывод:

```python
Документы, где tags содержит 'python' и 'mongodb':
{'_id': ObjectId('...'), 'name': 'Alice', 'age': 25, 'tags': ['python', 'mongodb']}
Документы, где хотя бы один элемент tags начинается с 'java':
{'_id': ObjectId('...'), 'name': 'Bob', 'age': 30, 'tags': ['java', 'mongodb']}
{'_id': ObjectId('...'), 'name': 'David', 'age': 40, 'tags': ['java', 'javascript', 'mongodb']}
{'_id': ObjectId('...'), 'name': 'Eve', 'age': 25, 'tags': ['python', 'java']}
Документы, где количество элементов в tags равно 2:
{'_id': ObjectId('...'), 'name': 'Alice', 'age': 25, 'tags': ['python', 'mongodb']}
{'_id': ObjectId('...'), 'name': 'Bob', 'age': 30, 'tags': ['java', 'mongodb']}
{'_id': ObjectId('...'), 'name': 'Charlie', 'age': 35, 'tags': ['python', 'javascript']}
{'_id': ObjectId('...'), 'name': 'Eve', 'age': 25, 'tags': ['python', 'java']}
```

------------------------------------------------------------------------------------------------

1.4. Операторы для работы с полями
