# Операторы сравнения MongoDB

### ОПЕРАТОРЫ MongoDB

Все операторы MongoDB

1.1. Операторы сравнения

#### $eq: Равно.

#### $ne: Не равно.

#### $gt: Больше.

#### $gte: Больше или равно.

#### $lt: Меньше.

#### $lte: Меньше или равно.

#### $in: Значение находится в массиве.

#### $nin: Значение не находится в массиве.

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


# 1. Оператор $eq (Равно)
print("Документы, где age = 25:")
for doc in collection.find({"age": {"$eq": 25}}):
    print(doc)
# 2. Оператор $ne (Не равно)
print("Документы, где age != 25:")
for doc in collection.find({"age": {"$ne": 25}}):
    print(doc)
# 3. Оператор $gt (Больше)
print("Документы, где age > 30:")
for doc in collection.find({"age": {"$gt": 30}}):
    print(doc)
# 4. Оператор $gte (Больше или равно)
print("Документы, где age >= 30:")
for doc in collection.find({"age": {"$gte": 30}}):
    print(doc)
# 5. Оператор $lt (Меньше)
print("Документы, где age < 30:")
for doc in collection.find({"age": {"$lt": 30}}):
    print(doc)
# 6. Оператор $lte (Меньше или равно)
print("Документы, где age <= 30:")
for doc in collection.find({"age": {"$lte": 30}}):
    print(doc)
# 7. Оператор $in (Значение находится в массиве)
print("Документы, где age находится в [25, 35]:")
for doc in collection.find({"age": {"$in": [25, 35]}}):
    print(doc)
# 8. Оператор $nin (Значение не находится в массиве)
print("Документы, где age не находится в [25, 35]:")
for doc in collection.find({"age": {"$nin": [25, 35]}}):
    print(doc)
client.close()

```

Пример вывода

```python
Документы, где age = 25:
{'_id': ObjectId('...'), 'name': 'Alice', 'age': 25, 'tags': ['python', 'mongodb']}
{'_id': ObjectId('...'), 'name': 'Eve', 'age': 25, 'tags': ['python', 'java']}
Документы, где age != 25:
{'_id': ObjectId('...'), 'name': 'Bob', 'age': 30, 'tags': ['java', 'mongodb']}
{'_id': ObjectId('...'), 'name': 'Charlie', 'age': 35, 'tags': ['python', 'javascript']}
{'_id': ObjectId('...'), 'name': 'David', 'age': 40, 'tags': ['java', 'javascript']}
Документы, где age > 30:
{'_id': ObjectId('...'), 'name': 'Charlie', 'age': 35, 'tags': ['python', 'javascript']}
{'_id': ObjectId('...'), 'name': 'David', 'age': 40, 'tags': ['java', 'javascript']}
Документы, где age >= 30:
{'_id': ObjectId('...'), 'name': 'Bob', 'age': 30, 'tags': ['java', 'mongodb']}
{'_id': ObjectId('...'), 'name': 'Charlie', 'age': 35, 'tags': ['python', 'javascript']}
{'_id': ObjectId('...'), 'name': 'David', 'age': 40, 'tags': ['java', 'javascript']}
Документы, где age < 30:
{'_id': ObjectId('...'), 'name': 'Alice', 'age': 25, 'tags': ['python', 'mongodb']}
{'_id': ObjectId('...'), 'name': 'Eve', 'age': 25, 'tags': ['python', 'java']}
Документы, где age <= 30:
{'_id': ObjectId('...'), 'name': 'Alice', 'age': 25, 'tags': ['python', 'mongodb']}
{'_id': ObjectId('...'), 'name': 'Bob', 'age': 30, 'tags': ['java', 'mongodb']}
{'_id': ObjectId('...'), 'name': 'Eve', 'age': 25, 'tags': ['python', 'java']}
Документы, где age находится в [25, 35]:
{'_id': ObjectId('...'), 'name': 'Alice', 'age': 25, 'tags': ['python', 'mongodb']}
{'_id': ObjectId('...'), 'name': 'Charlie', 'age': 35, 'tags': ['python', 'javascript']}
{'_id': ObjectId('...'), 'name': 'Eve', 'age': 25, 'tags': ['python', 'java']}
Документы, где age не находится в [25, 35]:
{'_id': ObjectId('...'), 'name': 'Bob', 'age': 30, 'tags': ['java', 'mongodb']}
{'_id': ObjectId('...'), 'name': 'David', 'age': 40, 'tags': ['java', 'javascript']}
```

------------------------------------------------------------------------------------------------

1.2. Логические операторы
