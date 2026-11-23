/* Снимки CPython перед строкой; генератор: docs/project-context/tools/build_queue25_traces.py. */
window.TRACES = Object.assign(window.TRACES || {}, {
  "queue25_tasks": {
    "code": [
      "from collections import deque",
      "",
      "",
      "def process_tasks(commands):",
      "    pending = deque()",
      "    completed = []",
      "    closed = False",
      "    for command in commands:",
      "        if closed:",
      "            raise ValueError(\"команды после close\")",
      "        if not isinstance(command, tuple) or not command:",
      "            raise ValueError(\"неверная команда\")",
      "        if len(command) == 2 and command[0] == \"add\" and isinstance(command[1], str):",
      "            pending.append(command[1])",
      "        elif command == (\"run\",):",
      "            if pending:",
      "                completed.append(pending.popleft())",
      "        elif command == (\"close\",):",
      "            closed = True",
      "            while pending:",
      "                completed.append(pending.popleft())",
      "        else:",
      "            raise ValueError(\"неверная команда\")",
      "    return completed, list(pending)"
    ],
    "frames": [
      {
        "ln": 5,
        "ev": "line",
        "vars": {
          "commands": "[('add', 'A'), ('add', 'B'), ('run',), ('add', 'C'), ('close',)]",
          "вызов": "process_tasks"
        },
        "arr": [
          [
            "add",
            "A"
          ],
          [
            "add",
            "B"
          ],
          [
            "run"
          ],
          [
            "add",
            "C"
          ],
          [
            "close"
          ]
        ],
        "ret": null,
        "err": null,
        "say": "Сейчас выполняется подсвеченная строка. Изменение состояния появится на следующем шаге."
      },
      {
        "ln": 6,
        "ev": "line",
        "vars": {
          "commands": "[('add', 'A'), ('add', 'B'), ('run',), ('add', 'C'), ('close',)]",
          "pending": "deque([])",
          "вызов": "process_tasks"
        },
        "arr": [
          [
            "add",
            "A"
          ],
          [
            "add",
            "B"
          ],
          [
            "run"
          ],
          [
            "add",
            "C"
          ],
          [
            "close"
          ]
        ],
        "ret": null,
        "err": null,
        "say": "Сейчас выполняется подсвеченная строка. Изменение состояния появится на следующем шаге."
      },
      {
        "ln": 7,
        "ev": "line",
        "vars": {
          "commands": "[('add', 'A'), ('add', 'B'), ('run',), ('add', 'C'), ('close',)]",
          "pending": "deque([])",
          "completed": "[]",
          "вызов": "process_tasks"
        },
        "arr": [
          [
            "add",
            "A"
          ],
          [
            "add",
            "B"
          ],
          [
            "run"
          ],
          [
            "add",
            "C"
          ],
          [
            "close"
          ]
        ],
        "ret": null,
        "err": null,
        "say": "Сейчас выполняется подсвеченная строка. Изменение состояния появится на следующем шаге."
      },
      {
        "ln": 8,
        "ev": "line",
        "vars": {
          "commands": "[('add', 'A'), ('add', 'B'), ('run',), ('add', 'C'), ('close',)]",
          "pending": "deque([])",
          "completed": "[]",
          "closed": "False",
          "вызов": "process_tasks"
        },
        "arr": [
          [
            "add",
            "A"
          ],
          [
            "add",
            "B"
          ],
          [
            "run"
          ],
          [
            "add",
            "C"
          ],
          [
            "close"
          ]
        ],
        "ret": null,
        "err": null,
        "say": "Цикл получает следующий элемент. При завершении входа управление выйдет из цикла."
      },
      {
        "ln": 9,
        "ev": "line",
        "vars": {
          "commands": "[('add', 'A'), ('add', 'B'), ('run',), ('add', 'C'), ('close',)]",
          "pending": "deque([])",
          "completed": "[]",
          "closed": "False",
          "command": "('add', 'A')",
          "вызов": "process_tasks"
        },
        "arr": [
          [
            "add",
            "A"
          ],
          [
            "add",
            "B"
          ],
          [
            "run"
          ],
          [
            "add",
            "C"
          ],
          [
            "close"
          ]
        ],
        "ret": null,
        "err": null,
        "say": "Проверяется условие. Следующий подсвеченный номер покажет выбранную ветвь."
      },
      {
        "ln": 11,
        "ev": "line",
        "vars": {
          "commands": "[('add', 'A'), ('add', 'B'), ('run',), ('add', 'C'), ('close',)]",
          "pending": "deque([])",
          "completed": "[]",
          "closed": "False",
          "command": "('add', 'A')",
          "вызов": "process_tasks"
        },
        "arr": [
          [
            "add",
            "A"
          ],
          [
            "add",
            "B"
          ],
          [
            "run"
          ],
          [
            "add",
            "C"
          ],
          [
            "close"
          ]
        ],
        "ret": null,
        "err": null,
        "say": "Проверяется условие. Следующий подсвеченный номер покажет выбранную ветвь."
      },
      {
        "ln": 13,
        "ev": "line",
        "vars": {
          "commands": "[('add', 'A'), ('add', 'B'), ('run',), ('add', 'C'), ('close',)]",
          "pending": "deque([])",
          "completed": "[]",
          "closed": "False",
          "command": "('add', 'A')",
          "вызов": "process_tasks"
        },
        "arr": [
          [
            "add",
            "A"
          ],
          [
            "add",
            "B"
          ],
          [
            "run"
          ],
          [
            "add",
            "C"
          ],
          [
            "close"
          ]
        ],
        "ret": null,
        "err": null,
        "say": "Проверяется условие. Следующий подсвеченный номер покажет выбранную ветвь."
      },
      {
        "ln": 14,
        "ev": "line",
        "vars": {
          "commands": "[('add', 'A'), ('add', 'B'), ('run',), ('add', 'C'), ('close',)]",
          "pending": "deque([])",
          "completed": "[]",
          "closed": "False",
          "command": "('add', 'A')",
          "вызов": "process_tasks"
        },
        "arr": [
          [
            "add",
            "A"
          ],
          [
            "add",
            "B"
          ],
          [
            "run"
          ],
          [
            "add",
            "C"
          ],
          [
            "close"
          ]
        ],
        "ret": null,
        "err": null,
        "say": "Новая задача добавляется после уже ожидающих."
      },
      {
        "ln": 8,
        "ev": "line",
        "vars": {
          "commands": "[('add', 'A'), ('add', 'B'), ('run',), ('add', 'C'), ('close',)]",
          "pending": "deque(['A'])",
          "completed": "[]",
          "closed": "False",
          "command": "('add', 'A')",
          "вызов": "process_tasks"
        },
        "arr": [
          [
            "add",
            "A"
          ],
          [
            "add",
            "B"
          ],
          [
            "run"
          ],
          [
            "add",
            "C"
          ],
          [
            "close"
          ]
        ],
        "ret": null,
        "err": null,
        "say": "Цикл получает следующий элемент. При завершении входа управление выйдет из цикла."
      },
      {
        "ln": 9,
        "ev": "line",
        "vars": {
          "commands": "[('add', 'A'), ('add', 'B'), ('run',), ('add', 'C'), ('close',)]",
          "pending": "deque(['A'])",
          "completed": "[]",
          "closed": "False",
          "command": "('add', 'B')",
          "вызов": "process_tasks"
        },
        "arr": [
          [
            "add",
            "A"
          ],
          [
            "add",
            "B"
          ],
          [
            "run"
          ],
          [
            "add",
            "C"
          ],
          [
            "close"
          ]
        ],
        "ret": null,
        "err": null,
        "say": "Проверяется условие. Следующий подсвеченный номер покажет выбранную ветвь."
      },
      {
        "ln": 11,
        "ev": "line",
        "vars": {
          "commands": "[('add', 'A'), ('add', 'B'), ('run',), ('add', 'C'), ('close',)]",
          "pending": "deque(['A'])",
          "completed": "[]",
          "closed": "False",
          "command": "('add', 'B')",
          "вызов": "process_tasks"
        },
        "arr": [
          [
            "add",
            "A"
          ],
          [
            "add",
            "B"
          ],
          [
            "run"
          ],
          [
            "add",
            "C"
          ],
          [
            "close"
          ]
        ],
        "ret": null,
        "err": null,
        "say": "Проверяется условие. Следующий подсвеченный номер покажет выбранную ветвь."
      },
      {
        "ln": 13,
        "ev": "line",
        "vars": {
          "commands": "[('add', 'A'), ('add', 'B'), ('run',), ('add', 'C'), ('close',)]",
          "pending": "deque(['A'])",
          "completed": "[]",
          "closed": "False",
          "command": "('add', 'B')",
          "вызов": "process_tasks"
        },
        "arr": [
          [
            "add",
            "A"
          ],
          [
            "add",
            "B"
          ],
          [
            "run"
          ],
          [
            "add",
            "C"
          ],
          [
            "close"
          ]
        ],
        "ret": null,
        "err": null,
        "say": "Проверяется условие. Следующий подсвеченный номер покажет выбранную ветвь."
      },
      {
        "ln": 14,
        "ev": "line",
        "vars": {
          "commands": "[('add', 'A'), ('add', 'B'), ('run',), ('add', 'C'), ('close',)]",
          "pending": "deque(['A'])",
          "completed": "[]",
          "closed": "False",
          "command": "('add', 'B')",
          "вызов": "process_tasks"
        },
        "arr": [
          [
            "add",
            "A"
          ],
          [
            "add",
            "B"
          ],
          [
            "run"
          ],
          [
            "add",
            "C"
          ],
          [
            "close"
          ]
        ],
        "ret": null,
        "err": null,
        "say": "Новая задача добавляется после уже ожидающих."
      },
      {
        "ln": 8,
        "ev": "line",
        "vars": {
          "commands": "[('add', 'A'), ('add', 'B'), ('run',), ('add', 'C'), ('close',)]",
          "pending": "deque(['A', 'B'])",
          "completed": "[]",
          "closed": "False",
          "command": "('add', 'B')",
          "вызов": "process_tasks"
        },
        "arr": [
          [
            "add",
            "A"
          ],
          [
            "add",
            "B"
          ],
          [
            "run"
          ],
          [
            "add",
            "C"
          ],
          [
            "close"
          ]
        ],
        "ret": null,
        "err": null,
        "say": "Цикл получает следующий элемент. При завершении входа управление выйдет из цикла."
      },
      {
        "ln": 9,
        "ev": "line",
        "vars": {
          "commands": "[('add', 'A'), ('add', 'B'), ('run',), ('add', 'C'), ('close',)]",
          "pending": "deque(['A', 'B'])",
          "completed": "[]",
          "closed": "False",
          "command": "('run',)",
          "вызов": "process_tasks"
        },
        "arr": [
          [
            "add",
            "A"
          ],
          [
            "add",
            "B"
          ],
          [
            "run"
          ],
          [
            "add",
            "C"
          ],
          [
            "close"
          ]
        ],
        "ret": null,
        "err": null,
        "say": "Проверяется условие. Следующий подсвеченный номер покажет выбранную ветвь."
      },
      {
        "ln": 11,
        "ev": "line",
        "vars": {
          "commands": "[('add', 'A'), ('add', 'B'), ('run',), ('add', 'C'), ('close',)]",
          "pending": "deque(['A', 'B'])",
          "completed": "[]",
          "closed": "False",
          "command": "('run',)",
          "вызов": "process_tasks"
        },
        "arr": [
          [
            "add",
            "A"
          ],
          [
            "add",
            "B"
          ],
          [
            "run"
          ],
          [
            "add",
            "C"
          ],
          [
            "close"
          ]
        ],
        "ret": null,
        "err": null,
        "say": "Проверяется условие. Следующий подсвеченный номер покажет выбранную ветвь."
      },
      {
        "ln": 13,
        "ev": "line",
        "vars": {
          "commands": "[('add', 'A'), ('add', 'B'), ('run',), ('add', 'C'), ('close',)]",
          "pending": "deque(['A', 'B'])",
          "completed": "[]",
          "closed": "False",
          "command": "('run',)",
          "вызов": "process_tasks"
        },
        "arr": [
          [
            "add",
            "A"
          ],
          [
            "add",
            "B"
          ],
          [
            "run"
          ],
          [
            "add",
            "C"
          ],
          [
            "close"
          ]
        ],
        "ret": null,
        "err": null,
        "say": "Проверяется условие. Следующий подсвеченный номер покажет выбранную ветвь."
      },
      {
        "ln": 15,
        "ev": "line",
        "vars": {
          "commands": "[('add', 'A'), ('add', 'B'), ('run',), ('add', 'C'), ('close',)]",
          "pending": "deque(['A', 'B'])",
          "completed": "[]",
          "closed": "False",
          "command": "('run',)",
          "вызов": "process_tasks"
        },
        "arr": [
          [
            "add",
            "A"
          ],
          [
            "add",
            "B"
          ],
          [
            "run"
          ],
          [
            "add",
            "C"
          ],
          [
            "close"
          ]
        ],
        "ret": null,
        "err": null,
        "say": "Проверяется условие. Следующий подсвеченный номер покажет выбранную ветвь."
      },
      {
        "ln": 16,
        "ev": "line",
        "vars": {
          "commands": "[('add', 'A'), ('add', 'B'), ('run',), ('add', 'C'), ('close',)]",
          "pending": "deque(['A', 'B'])",
          "completed": "[]",
          "closed": "False",
          "command": "('run',)",
          "вызов": "process_tasks"
        },
        "arr": [
          [
            "add",
            "A"
          ],
          [
            "add",
            "B"
          ],
          [
            "run"
          ],
          [
            "add",
            "C"
          ],
          [
            "close"
          ]
        ],
        "ret": null,
        "err": null,
        "say": "Проверяется условие. Следующий подсвеченный номер покажет выбранную ветвь."
      },
      {
        "ln": 17,
        "ev": "line",
        "vars": {
          "commands": "[('add', 'A'), ('add', 'B'), ('run',), ('add', 'C'), ('close',)]",
          "pending": "deque(['A', 'B'])",
          "completed": "[]",
          "closed": "False",
          "command": "('run',)",
          "вызов": "process_tasks"
        },
        "arr": [
          [
            "add",
            "A"
          ],
          [
            "add",
            "B"
          ],
          [
            "run"
          ],
          [
            "add",
            "C"
          ],
          [
            "close"
          ]
        ],
        "ret": null,
        "err": null,
        "say": "Первая ожидающая задача снимается из начала и записывается в выполненные."
      },
      {
        "ln": 8,
        "ev": "line",
        "vars": {
          "commands": "[('add', 'A'), ('add', 'B'), ('run',), ('add', 'C'), ('close',)]",
          "pending": "deque(['B'])",
          "completed": "['A']",
          "closed": "False",
          "command": "('run',)",
          "вызов": "process_tasks"
        },
        "arr": [
          [
            "add",
            "A"
          ],
          [
            "add",
            "B"
          ],
          [
            "run"
          ],
          [
            "add",
            "C"
          ],
          [
            "close"
          ]
        ],
        "ret": null,
        "err": null,
        "say": "Цикл получает следующий элемент. При завершении входа управление выйдет из цикла."
      },
      {
        "ln": 9,
        "ev": "line",
        "vars": {
          "commands": "[('add', 'A'), ('add', 'B'), ('run',), ('add', 'C'), ('close',)]",
          "pending": "deque(['B'])",
          "completed": "['A']",
          "closed": "False",
          "command": "('add', 'C')",
          "вызов": "process_tasks"
        },
        "arr": [
          [
            "add",
            "A"
          ],
          [
            "add",
            "B"
          ],
          [
            "run"
          ],
          [
            "add",
            "C"
          ],
          [
            "close"
          ]
        ],
        "ret": null,
        "err": null,
        "say": "Проверяется условие. Следующий подсвеченный номер покажет выбранную ветвь."
      },
      {
        "ln": 11,
        "ev": "line",
        "vars": {
          "commands": "[('add', 'A'), ('add', 'B'), ('run',), ('add', 'C'), ('close',)]",
          "pending": "deque(['B'])",
          "completed": "['A']",
          "closed": "False",
          "command": "('add', 'C')",
          "вызов": "process_tasks"
        },
        "arr": [
          [
            "add",
            "A"
          ],
          [
            "add",
            "B"
          ],
          [
            "run"
          ],
          [
            "add",
            "C"
          ],
          [
            "close"
          ]
        ],
        "ret": null,
        "err": null,
        "say": "Проверяется условие. Следующий подсвеченный номер покажет выбранную ветвь."
      },
      {
        "ln": 13,
        "ev": "line",
        "vars": {
          "commands": "[('add', 'A'), ('add', 'B'), ('run',), ('add', 'C'), ('close',)]",
          "pending": "deque(['B'])",
          "completed": "['A']",
          "closed": "False",
          "command": "('add', 'C')",
          "вызов": "process_tasks"
        },
        "arr": [
          [
            "add",
            "A"
          ],
          [
            "add",
            "B"
          ],
          [
            "run"
          ],
          [
            "add",
            "C"
          ],
          [
            "close"
          ]
        ],
        "ret": null,
        "err": null,
        "say": "Проверяется условие. Следующий подсвеченный номер покажет выбранную ветвь."
      },
      {
        "ln": 14,
        "ev": "line",
        "vars": {
          "commands": "[('add', 'A'), ('add', 'B'), ('run',), ('add', 'C'), ('close',)]",
          "pending": "deque(['B'])",
          "completed": "['A']",
          "closed": "False",
          "command": "('add', 'C')",
          "вызов": "process_tasks"
        },
        "arr": [
          [
            "add",
            "A"
          ],
          [
            "add",
            "B"
          ],
          [
            "run"
          ],
          [
            "add",
            "C"
          ],
          [
            "close"
          ]
        ],
        "ret": null,
        "err": null,
        "say": "Новая задача добавляется после уже ожидающих."
      },
      {
        "ln": 8,
        "ev": "line",
        "vars": {
          "commands": "[('add', 'A'), ('add', 'B'), ('run',), ('add', 'C'), ('close',)]",
          "pending": "deque(['B', 'C'])",
          "completed": "['A']",
          "closed": "False",
          "command": "('add', 'C')",
          "вызов": "process_tasks"
        },
        "arr": [
          [
            "add",
            "A"
          ],
          [
            "add",
            "B"
          ],
          [
            "run"
          ],
          [
            "add",
            "C"
          ],
          [
            "close"
          ]
        ],
        "ret": null,
        "err": null,
        "say": "Цикл получает следующий элемент. При завершении входа управление выйдет из цикла."
      },
      {
        "ln": 9,
        "ev": "line",
        "vars": {
          "commands": "[('add', 'A'), ('add', 'B'), ('run',), ('add', 'C'), ('close',)]",
          "pending": "deque(['B', 'C'])",
          "completed": "['A']",
          "closed": "False",
          "command": "('close',)",
          "вызов": "process_tasks"
        },
        "arr": [
          [
            "add",
            "A"
          ],
          [
            "add",
            "B"
          ],
          [
            "run"
          ],
          [
            "add",
            "C"
          ],
          [
            "close"
          ]
        ],
        "ret": null,
        "err": null,
        "say": "Проверяется условие. Следующий подсвеченный номер покажет выбранную ветвь."
      },
      {
        "ln": 11,
        "ev": "line",
        "vars": {
          "commands": "[('add', 'A'), ('add', 'B'), ('run',), ('add', 'C'), ('close',)]",
          "pending": "deque(['B', 'C'])",
          "completed": "['A']",
          "closed": "False",
          "command": "('close',)",
          "вызов": "process_tasks"
        },
        "arr": [
          [
            "add",
            "A"
          ],
          [
            "add",
            "B"
          ],
          [
            "run"
          ],
          [
            "add",
            "C"
          ],
          [
            "close"
          ]
        ],
        "ret": null,
        "err": null,
        "say": "Проверяется условие. Следующий подсвеченный номер покажет выбранную ветвь."
      },
      {
        "ln": 13,
        "ev": "line",
        "vars": {
          "commands": "[('add', 'A'), ('add', 'B'), ('run',), ('add', 'C'), ('close',)]",
          "pending": "deque(['B', 'C'])",
          "completed": "['A']",
          "closed": "False",
          "command": "('close',)",
          "вызов": "process_tasks"
        },
        "arr": [
          [
            "add",
            "A"
          ],
          [
            "add",
            "B"
          ],
          [
            "run"
          ],
          [
            "add",
            "C"
          ],
          [
            "close"
          ]
        ],
        "ret": null,
        "err": null,
        "say": "Проверяется условие. Следующий подсвеченный номер покажет выбранную ветвь."
      },
      {
        "ln": 15,
        "ev": "line",
        "vars": {
          "commands": "[('add', 'A'), ('add', 'B'), ('run',), ('add', 'C'), ('close',)]",
          "pending": "deque(['B', 'C'])",
          "completed": "['A']",
          "closed": "False",
          "command": "('close',)",
          "вызов": "process_tasks"
        },
        "arr": [
          [
            "add",
            "A"
          ],
          [
            "add",
            "B"
          ],
          [
            "run"
          ],
          [
            "add",
            "C"
          ],
          [
            "close"
          ]
        ],
        "ret": null,
        "err": null,
        "say": "Проверяется условие. Следующий подсвеченный номер покажет выбранную ветвь."
      },
      {
        "ln": 18,
        "ev": "line",
        "vars": {
          "commands": "[('add', 'A'), ('add', 'B'), ('run',), ('add', 'C'), ('close',)]",
          "pending": "deque(['B', 'C'])",
          "completed": "['A']",
          "closed": "False",
          "command": "('close',)",
          "вызов": "process_tasks"
        },
        "arr": [
          [
            "add",
            "A"
          ],
          [
            "add",
            "B"
          ],
          [
            "run"
          ],
          [
            "add",
            "C"
          ],
          [
            "close"
          ]
        ],
        "ret": null,
        "err": null,
        "say": "Проверяется условие. Следующий подсвеченный номер покажет выбранную ветвь."
      },
      {
        "ln": 19,
        "ev": "line",
        "vars": {
          "commands": "[('add', 'A'), ('add', 'B'), ('run',), ('add', 'C'), ('close',)]",
          "pending": "deque(['B', 'C'])",
          "completed": "['A']",
          "closed": "False",
          "command": "('close',)",
          "вызов": "process_tasks"
        },
        "arr": [
          [
            "add",
            "A"
          ],
          [
            "add",
            "B"
          ],
          [
            "run"
          ],
          [
            "add",
            "C"
          ],
          [
            "close"
          ]
        ],
        "ret": null,
        "err": null,
        "say": "Приём закрывается до выполнения оставшихся задач."
      },
      {
        "ln": 20,
        "ev": "line",
        "vars": {
          "commands": "[('add', 'A'), ('add', 'B'), ('run',), ('add', 'C'), ('close',)]",
          "pending": "deque(['B', 'C'])",
          "completed": "['A']",
          "closed": "True",
          "command": "('close',)",
          "вызов": "process_tasks"
        },
        "arr": [
          [
            "add",
            "A"
          ],
          [
            "add",
            "B"
          ],
          [
            "run"
          ],
          [
            "add",
            "C"
          ],
          [
            "close"
          ]
        ],
        "ret": null,
        "err": null,
        "say": "Проверяется условие. Следующий подсвеченный номер покажет выбранную ветвь."
      },
      {
        "ln": 21,
        "ev": "line",
        "vars": {
          "commands": "[('add', 'A'), ('add', 'B'), ('run',), ('add', 'C'), ('close',)]",
          "pending": "deque(['B', 'C'])",
          "completed": "['A']",
          "closed": "True",
          "command": "('close',)",
          "вызов": "process_tasks"
        },
        "arr": [
          [
            "add",
            "A"
          ],
          [
            "add",
            "B"
          ],
          [
            "run"
          ],
          [
            "add",
            "C"
          ],
          [
            "close"
          ]
        ],
        "ret": null,
        "err": null,
        "say": "Первая ожидающая задача снимается из начала и записывается в выполненные."
      },
      {
        "ln": 20,
        "ev": "line",
        "vars": {
          "commands": "[('add', 'A'), ('add', 'B'), ('run',), ('add', 'C'), ('close',)]",
          "pending": "deque(['C'])",
          "completed": "['A', 'B']",
          "closed": "True",
          "command": "('close',)",
          "вызов": "process_tasks"
        },
        "arr": [
          [
            "add",
            "A"
          ],
          [
            "add",
            "B"
          ],
          [
            "run"
          ],
          [
            "add",
            "C"
          ],
          [
            "close"
          ]
        ],
        "ret": null,
        "err": null,
        "say": "Проверяется условие. Следующий подсвеченный номер покажет выбранную ветвь."
      },
      {
        "ln": 21,
        "ev": "line",
        "vars": {
          "commands": "[('add', 'A'), ('add', 'B'), ('run',), ('add', 'C'), ('close',)]",
          "pending": "deque(['C'])",
          "completed": "['A', 'B']",
          "closed": "True",
          "command": "('close',)",
          "вызов": "process_tasks"
        },
        "arr": [
          [
            "add",
            "A"
          ],
          [
            "add",
            "B"
          ],
          [
            "run"
          ],
          [
            "add",
            "C"
          ],
          [
            "close"
          ]
        ],
        "ret": null,
        "err": null,
        "say": "Первая ожидающая задача снимается из начала и записывается в выполненные."
      },
      {
        "ln": 20,
        "ev": "line",
        "vars": {
          "commands": "[('add', 'A'), ('add', 'B'), ('run',), ('add', 'C'), ('close',)]",
          "pending": "deque([])",
          "completed": "['A', 'B', 'C']",
          "closed": "True",
          "command": "('close',)",
          "вызов": "process_tasks"
        },
        "arr": [
          [
            "add",
            "A"
          ],
          [
            "add",
            "B"
          ],
          [
            "run"
          ],
          [
            "add",
            "C"
          ],
          [
            "close"
          ]
        ],
        "ret": null,
        "err": null,
        "say": "Проверяется условие. Следующий подсвеченный номер покажет выбранную ветвь."
      },
      {
        "ln": 8,
        "ev": "line",
        "vars": {
          "commands": "[('add', 'A'), ('add', 'B'), ('run',), ('add', 'C'), ('close',)]",
          "pending": "deque([])",
          "completed": "['A', 'B', 'C']",
          "closed": "True",
          "command": "('close',)",
          "вызов": "process_tasks"
        },
        "arr": [
          [
            "add",
            "A"
          ],
          [
            "add",
            "B"
          ],
          [
            "run"
          ],
          [
            "add",
            "C"
          ],
          [
            "close"
          ]
        ],
        "ret": null,
        "err": null,
        "say": "Цикл получает следующий элемент. При завершении входа управление выйдет из цикла."
      },
      {
        "ln": 24,
        "ev": "line",
        "vars": {
          "commands": "[('add', 'A'), ('add', 'B'), ('run',), ('add', 'C'), ('close',)]",
          "pending": "deque([])",
          "completed": "['A', 'B', 'C']",
          "closed": "True",
          "command": "('close',)",
          "вызов": "process_tasks"
        },
        "arr": [
          [
            "add",
            "A"
          ],
          [
            "add",
            "B"
          ],
          [
            "run"
          ],
          [
            "add",
            "C"
          ],
          [
            "close"
          ]
        ],
        "ret": null,
        "err": null,
        "say": "Сейчас вычисляется и возвращается результат вызова."
      },
      {
        "ln": 24,
        "ev": "return",
        "vars": {
          "commands": "[('add', 'A'), ('add', 'B'), ('run',), ('add', 'C'), ('close',)]",
          "pending": "deque([])",
          "completed": "['A', 'B', 'C']",
          "closed": "True",
          "command": "('close',)",
          "вызов": "process_tasks"
        },
        "arr": [
          [
            "add",
            "A"
          ],
          [
            "add",
            "B"
          ],
          [
            "run"
          ],
          [
            "add",
            "C"
          ],
          [
            "close"
          ]
        ],
        "ret": "(['A', 'B', 'C'], [])",
        "err": null,
        "say": "Вызов завершён, возвращается (['A', 'B', 'C'], [])."
      }
    ],
    "call": "process_tasks([('add', 'A'), ('add', 'B'), ('run',), ('add', 'C'), ('close',)])",
    "arr_name": "команды",
    "ptrs": [],
    "result": "(['A', 'B', 'C'], [])",
    "after": "[('add', 'A'), ('add', 'B'), ('run',), ('add', 'C'), ('close',)]",
    "error": null
  },
  "queue25_ring": {
    "code": [
      "class RingQueue:",
      "    def __init__(self, capacity):",
      "        if capacity < 1:",
      "            raise ValueError(\"ёмкость должна быть положительной\")",
      "        self.data = [None] * capacity",
      "        self.head = 0",
      "        self.size = 0",
      "",
      "    def push(self, value):",
      "        if self.size == len(self.data):",
      "            raise OverflowError(\"очередь заполнена\")",
      "        tail = (self.head + self.size) % len(self.data)",
      "        self.data[tail] = value",
      "        self.size += 1",
      "",
      "    def pop(self):",
      "        if self.size == 0:",
      "            raise IndexError(\"очередь пуста\")",
      "        value = self.data[self.head]",
      "        self.data[self.head] = None",
      "        self.head = (self.head + 1) % len(self.data)",
      "        self.size -= 1",
      "        return value",
      "",
      "def ring_demo():",
      "    q = RingQueue(3)",
      "    q.push(\"A\")",
      "    q.push(\"B\")",
      "    q.push(\"C\")",
      "    first = q.pop()",
      "    q.push(\"D\")",
      "    return [q.pop(), q.pop(), q.pop()]"
    ],
    "frames": [
      {
        "ln": 26,
        "ev": "line",
        "vars": {
          "вызов": "ring_demo"
        },
        "arr": [
          "A",
          "B",
          "C",
          "D"
        ],
        "ret": null,
        "err": null,
        "say": "Сейчас выполняется подсвеченная строка. Изменение состояния появится на следующем шаге."
      },
      {
        "ln": 3,
        "ev": "line",
        "vars": {
          "capacity": "3",
          "вызов": "__init__"
        },
        "arr": [
          "A",
          "B",
          "C",
          "D"
        ],
        "ret": null,
        "err": null,
        "say": "Проверяется условие. Следующий подсвеченный номер покажет выбранную ветвь."
      },
      {
        "ln": 5,
        "ev": "line",
        "vars": {
          "capacity": "3",
          "вызов": "__init__"
        },
        "arr": [
          "A",
          "B",
          "C",
          "D"
        ],
        "ret": null,
        "err": null,
        "say": "Сейчас выполняется подсвеченная строка. Изменение состояния появится на следующем шаге."
      },
      {
        "ln": 6,
        "ev": "line",
        "vars": {
          "self.data": "[None, None, None]",
          "capacity": "3",
          "вызов": "__init__"
        },
        "arr": [
          "A",
          "B",
          "C",
          "D"
        ],
        "ret": null,
        "err": null,
        "say": "Сейчас выполняется подсвеченная строка. Изменение состояния появится на следующем шаге."
      },
      {
        "ln": 7,
        "ev": "line",
        "vars": {
          "self.data": "[None, None, None]",
          "self.head": "0",
          "capacity": "3",
          "вызов": "__init__"
        },
        "arr": [
          "A",
          "B",
          "C",
          "D"
        ],
        "ret": null,
        "err": null,
        "say": "Сейчас выполняется подсвеченная строка. Изменение состояния появится на следующем шаге."
      },
      {
        "ln": 7,
        "ev": "return",
        "vars": {
          "self.data": "[None, None, None]",
          "self.head": "0",
          "self.size": "0",
          "capacity": "3",
          "вызов": "__init__"
        },
        "arr": [
          "A",
          "B",
          "C",
          "D"
        ],
        "ret": "None",
        "err": null,
        "say": "Вызов завершён, возвращается None."
      },
      {
        "ln": 27,
        "ev": "line",
        "vars": {
          "q.data": "[None, None, None]",
          "q.head": "0",
          "q.size": "0",
          "вызов": "ring_demo"
        },
        "arr": [
          "A",
          "B",
          "C",
          "D"
        ],
        "ret": null,
        "err": null,
        "say": "Сейчас выполняется подсвеченная строка. Изменение состояния появится на следующем шаге."
      },
      {
        "ln": 10,
        "ev": "line",
        "vars": {
          "self.data": "[None, None, None]",
          "self.head": "0",
          "self.size": "0",
          "value": "'A'",
          "вызов": "push"
        },
        "arr": [
          "A",
          "B",
          "C",
          "D"
        ],
        "ret": null,
        "err": null,
        "say": "Проверяется условие. Следующий подсвеченный номер покажет выбранную ветвь."
      },
      {
        "ln": 12,
        "ev": "line",
        "vars": {
          "self.data": "[None, None, None]",
          "self.head": "0",
          "self.size": "0",
          "value": "'A'",
          "вызов": "push"
        },
        "arr": [
          "A",
          "B",
          "C",
          "D"
        ],
        "ret": null,
        "err": null,
        "say": "Вычисляется позиция записи по кругу: (head + size) % capacity."
      },
      {
        "ln": 13,
        "ev": "line",
        "vars": {
          "self.data": "[None, None, None]",
          "self.head": "0",
          "self.size": "0",
          "value": "'A'",
          "tail": "0",
          "вызов": "push"
        },
        "arr": [
          "A",
          "B",
          "C",
          "D"
        ],
        "ret": null,
        "err": null,
        "say": "Значение записывается в вычисленную свободную ячейку."
      },
      {
        "ln": 14,
        "ev": "line",
        "vars": {
          "self.data": "['A', None, None]",
          "self.head": "0",
          "self.size": "0",
          "value": "'A'",
          "tail": "0",
          "вызов": "push"
        },
        "arr": [
          "A",
          "B",
          "C",
          "D"
        ],
        "ret": null,
        "err": null,
        "say": "Обновляется число элементов. Физическая длина массива сохраняется."
      },
      {
        "ln": 14,
        "ev": "return",
        "vars": {
          "self.data": "['A', None, None]",
          "self.head": "0",
          "self.size": "1",
          "value": "'A'",
          "tail": "0",
          "вызов": "push"
        },
        "arr": [
          "A",
          "B",
          "C",
          "D"
        ],
        "ret": "None",
        "err": null,
        "say": "Вызов завершён, возвращается None."
      },
      {
        "ln": 28,
        "ev": "line",
        "vars": {
          "q.data": "['A', None, None]",
          "q.head": "0",
          "q.size": "1",
          "вызов": "ring_demo"
        },
        "arr": [
          "A",
          "B",
          "C",
          "D"
        ],
        "ret": null,
        "err": null,
        "say": "Сейчас выполняется подсвеченная строка. Изменение состояния появится на следующем шаге."
      },
      {
        "ln": 10,
        "ev": "line",
        "vars": {
          "self.data": "['A', None, None]",
          "self.head": "0",
          "self.size": "1",
          "value": "'B'",
          "вызов": "push"
        },
        "arr": [
          "A",
          "B",
          "C",
          "D"
        ],
        "ret": null,
        "err": null,
        "say": "Проверяется условие. Следующий подсвеченный номер покажет выбранную ветвь."
      },
      {
        "ln": 12,
        "ev": "line",
        "vars": {
          "self.data": "['A', None, None]",
          "self.head": "0",
          "self.size": "1",
          "value": "'B'",
          "вызов": "push"
        },
        "arr": [
          "A",
          "B",
          "C",
          "D"
        ],
        "ret": null,
        "err": null,
        "say": "Вычисляется позиция записи по кругу: (head + size) % capacity."
      },
      {
        "ln": 13,
        "ev": "line",
        "vars": {
          "self.data": "['A', None, None]",
          "self.head": "0",
          "self.size": "1",
          "value": "'B'",
          "tail": "1",
          "вызов": "push"
        },
        "arr": [
          "A",
          "B",
          "C",
          "D"
        ],
        "ret": null,
        "err": null,
        "say": "Значение записывается в вычисленную свободную ячейку."
      },
      {
        "ln": 14,
        "ev": "line",
        "vars": {
          "self.data": "['A', 'B', None]",
          "self.head": "0",
          "self.size": "1",
          "value": "'B'",
          "tail": "1",
          "вызов": "push"
        },
        "arr": [
          "A",
          "B",
          "C",
          "D"
        ],
        "ret": null,
        "err": null,
        "say": "Обновляется число элементов. Физическая длина массива сохраняется."
      },
      {
        "ln": 14,
        "ev": "return",
        "vars": {
          "self.data": "['A', 'B', None]",
          "self.head": "0",
          "self.size": "2",
          "value": "'B'",
          "tail": "1",
          "вызов": "push"
        },
        "arr": [
          "A",
          "B",
          "C",
          "D"
        ],
        "ret": "None",
        "err": null,
        "say": "Вызов завершён, возвращается None."
      },
      {
        "ln": 29,
        "ev": "line",
        "vars": {
          "q.data": "['A', 'B', None]",
          "q.head": "0",
          "q.size": "2",
          "вызов": "ring_demo"
        },
        "arr": [
          "A",
          "B",
          "C",
          "D"
        ],
        "ret": null,
        "err": null,
        "say": "Сейчас выполняется подсвеченная строка. Изменение состояния появится на следующем шаге."
      },
      {
        "ln": 10,
        "ev": "line",
        "vars": {
          "self.data": "['A', 'B', None]",
          "self.head": "0",
          "self.size": "2",
          "value": "'C'",
          "вызов": "push"
        },
        "arr": [
          "A",
          "B",
          "C",
          "D"
        ],
        "ret": null,
        "err": null,
        "say": "Проверяется условие. Следующий подсвеченный номер покажет выбранную ветвь."
      },
      {
        "ln": 12,
        "ev": "line",
        "vars": {
          "self.data": "['A', 'B', None]",
          "self.head": "0",
          "self.size": "2",
          "value": "'C'",
          "вызов": "push"
        },
        "arr": [
          "A",
          "B",
          "C",
          "D"
        ],
        "ret": null,
        "err": null,
        "say": "Вычисляется позиция записи по кругу: (head + size) % capacity."
      },
      {
        "ln": 13,
        "ev": "line",
        "vars": {
          "self.data": "['A', 'B', None]",
          "self.head": "0",
          "self.size": "2",
          "value": "'C'",
          "tail": "2",
          "вызов": "push"
        },
        "arr": [
          "A",
          "B",
          "C",
          "D"
        ],
        "ret": null,
        "err": null,
        "say": "Значение записывается в вычисленную свободную ячейку."
      },
      {
        "ln": 14,
        "ev": "line",
        "vars": {
          "self.data": "['A', 'B', 'C']",
          "self.head": "0",
          "self.size": "2",
          "value": "'C'",
          "tail": "2",
          "вызов": "push"
        },
        "arr": [
          "A",
          "B",
          "C",
          "D"
        ],
        "ret": null,
        "err": null,
        "say": "Обновляется число элементов. Физическая длина массива сохраняется."
      },
      {
        "ln": 14,
        "ev": "return",
        "vars": {
          "self.data": "['A', 'B', 'C']",
          "self.head": "0",
          "self.size": "3",
          "value": "'C'",
          "tail": "2",
          "вызов": "push"
        },
        "arr": [
          "A",
          "B",
          "C",
          "D"
        ],
        "ret": "None",
        "err": null,
        "say": "Вызов завершён, возвращается None."
      },
      {
        "ln": 30,
        "ev": "line",
        "vars": {
          "q.data": "['A', 'B', 'C']",
          "q.head": "0",
          "q.size": "3",
          "вызов": "ring_demo"
        },
        "arr": [
          "A",
          "B",
          "C",
          "D"
        ],
        "ret": null,
        "err": null,
        "say": "Сейчас выполняется подсвеченная строка. Изменение состояния появится на следующем шаге."
      },
      {
        "ln": 17,
        "ev": "line",
        "vars": {
          "self.data": "['A', 'B', 'C']",
          "self.head": "0",
          "self.size": "3",
          "вызов": "pop"
        },
        "arr": [
          "A",
          "B",
          "C",
          "D"
        ],
        "ret": null,
        "err": null,
        "say": "Проверяется условие. Следующий подсвеченный номер покажет выбранную ветвь."
      },
      {
        "ln": 19,
        "ev": "line",
        "vars": {
          "self.data": "['A', 'B', 'C']",
          "self.head": "0",
          "self.size": "3",
          "вызов": "pop"
        },
        "arr": [
          "A",
          "B",
          "C",
          "D"
        ],
        "ret": null,
        "err": null,
        "say": "Сейчас выполняется подсвеченная строка. Изменение состояния появится на следующем шаге."
      },
      {
        "ln": 20,
        "ev": "line",
        "vars": {
          "self.data": "['A', 'B', 'C']",
          "self.head": "0",
          "self.size": "3",
          "value": "'A'",
          "вызов": "pop"
        },
        "arr": [
          "A",
          "B",
          "C",
          "D"
        ],
        "ret": null,
        "err": null,
        "say": "Ссылка в снятой ячейке очищается; сохранённое value остаётся доступным."
      },
      {
        "ln": 21,
        "ev": "line",
        "vars": {
          "self.data": "[None, 'B', 'C']",
          "self.head": "0",
          "self.size": "3",
          "value": "'A'",
          "вызов": "pop"
        },
        "arr": [
          "A",
          "B",
          "C",
          "D"
        ],
        "ret": null,
        "err": null,
        "say": "Индекс головы переходит к следующей ячейке по кругу."
      },
      {
        "ln": 22,
        "ev": "line",
        "vars": {
          "self.data": "[None, 'B', 'C']",
          "self.head": "1",
          "self.size": "3",
          "value": "'A'",
          "вызов": "pop"
        },
        "arr": [
          "A",
          "B",
          "C",
          "D"
        ],
        "ret": null,
        "err": null,
        "say": "Обновляется число элементов. Физическая длина массива сохраняется."
      },
      {
        "ln": 23,
        "ev": "line",
        "vars": {
          "self.data": "[None, 'B', 'C']",
          "self.head": "1",
          "self.size": "2",
          "value": "'A'",
          "вызов": "pop"
        },
        "arr": [
          "A",
          "B",
          "C",
          "D"
        ],
        "ret": null,
        "err": null,
        "say": "Сейчас вычисляется и возвращается результат вызова."
      },
      {
        "ln": 23,
        "ev": "return",
        "vars": {
          "self.data": "[None, 'B', 'C']",
          "self.head": "1",
          "self.size": "2",
          "value": "'A'",
          "вызов": "pop"
        },
        "arr": [
          "A",
          "B",
          "C",
          "D"
        ],
        "ret": "'A'",
        "err": null,
        "say": "Вызов завершён, возвращается 'A'."
      },
      {
        "ln": 31,
        "ev": "line",
        "vars": {
          "q.data": "[None, 'B', 'C']",
          "q.head": "1",
          "q.size": "2",
          "first": "'A'",
          "вызов": "ring_demo"
        },
        "arr": [
          "A",
          "B",
          "C",
          "D"
        ],
        "ret": null,
        "err": null,
        "say": "Сейчас выполняется подсвеченная строка. Изменение состояния появится на следующем шаге."
      },
      {
        "ln": 10,
        "ev": "line",
        "vars": {
          "self.data": "[None, 'B', 'C']",
          "self.head": "1",
          "self.size": "2",
          "value": "'D'",
          "вызов": "push"
        },
        "arr": [
          "A",
          "B",
          "C",
          "D"
        ],
        "ret": null,
        "err": null,
        "say": "Проверяется условие. Следующий подсвеченный номер покажет выбранную ветвь."
      },
      {
        "ln": 12,
        "ev": "line",
        "vars": {
          "self.data": "[None, 'B', 'C']",
          "self.head": "1",
          "self.size": "2",
          "value": "'D'",
          "вызов": "push"
        },
        "arr": [
          "A",
          "B",
          "C",
          "D"
        ],
        "ret": null,
        "err": null,
        "say": "Вычисляется позиция записи по кругу: (head + size) % capacity."
      },
      {
        "ln": 13,
        "ev": "line",
        "vars": {
          "self.data": "[None, 'B', 'C']",
          "self.head": "1",
          "self.size": "2",
          "value": "'D'",
          "tail": "0",
          "вызов": "push"
        },
        "arr": [
          "A",
          "B",
          "C",
          "D"
        ],
        "ret": null,
        "err": null,
        "say": "Значение записывается в вычисленную свободную ячейку."
      },
      {
        "ln": 14,
        "ev": "line",
        "vars": {
          "self.data": "['D', 'B', 'C']",
          "self.head": "1",
          "self.size": "2",
          "value": "'D'",
          "tail": "0",
          "вызов": "push"
        },
        "arr": [
          "A",
          "B",
          "C",
          "D"
        ],
        "ret": null,
        "err": null,
        "say": "Обновляется число элементов. Физическая длина массива сохраняется."
      },
      {
        "ln": 14,
        "ev": "return",
        "vars": {
          "self.data": "['D', 'B', 'C']",
          "self.head": "1",
          "self.size": "3",
          "value": "'D'",
          "tail": "0",
          "вызов": "push"
        },
        "arr": [
          "A",
          "B",
          "C",
          "D"
        ],
        "ret": "None",
        "err": null,
        "say": "Вызов завершён, возвращается None."
      },
      {
        "ln": 32,
        "ev": "line",
        "vars": {
          "q.data": "['D', 'B', 'C']",
          "q.head": "1",
          "q.size": "3",
          "first": "'A'",
          "вызов": "ring_demo"
        },
        "arr": [
          "A",
          "B",
          "C",
          "D"
        ],
        "ret": null,
        "err": null,
        "say": "Сейчас вычисляется и возвращается результат вызова."
      },
      {
        "ln": 17,
        "ev": "line",
        "vars": {
          "self.data": "['D', 'B', 'C']",
          "self.head": "1",
          "self.size": "3",
          "вызов": "pop"
        },
        "arr": [
          "A",
          "B",
          "C",
          "D"
        ],
        "ret": null,
        "err": null,
        "say": "Проверяется условие. Следующий подсвеченный номер покажет выбранную ветвь."
      },
      {
        "ln": 19,
        "ev": "line",
        "vars": {
          "self.data": "['D', 'B', 'C']",
          "self.head": "1",
          "self.size": "3",
          "вызов": "pop"
        },
        "arr": [
          "A",
          "B",
          "C",
          "D"
        ],
        "ret": null,
        "err": null,
        "say": "Сейчас выполняется подсвеченная строка. Изменение состояния появится на следующем шаге."
      },
      {
        "ln": 20,
        "ev": "line",
        "vars": {
          "self.data": "['D', 'B', 'C']",
          "self.head": "1",
          "self.size": "3",
          "value": "'B'",
          "вызов": "pop"
        },
        "arr": [
          "A",
          "B",
          "C",
          "D"
        ],
        "ret": null,
        "err": null,
        "say": "Ссылка в снятой ячейке очищается; сохранённое value остаётся доступным."
      },
      {
        "ln": 21,
        "ev": "line",
        "vars": {
          "self.data": "['D', None, 'C']",
          "self.head": "1",
          "self.size": "3",
          "value": "'B'",
          "вызов": "pop"
        },
        "arr": [
          "A",
          "B",
          "C",
          "D"
        ],
        "ret": null,
        "err": null,
        "say": "Индекс головы переходит к следующей ячейке по кругу."
      },
      {
        "ln": 22,
        "ev": "line",
        "vars": {
          "self.data": "['D', None, 'C']",
          "self.head": "2",
          "self.size": "3",
          "value": "'B'",
          "вызов": "pop"
        },
        "arr": [
          "A",
          "B",
          "C",
          "D"
        ],
        "ret": null,
        "err": null,
        "say": "Обновляется число элементов. Физическая длина массива сохраняется."
      },
      {
        "ln": 23,
        "ev": "line",
        "vars": {
          "self.data": "['D', None, 'C']",
          "self.head": "2",
          "self.size": "2",
          "value": "'B'",
          "вызов": "pop"
        },
        "arr": [
          "A",
          "B",
          "C",
          "D"
        ],
        "ret": null,
        "err": null,
        "say": "Сейчас вычисляется и возвращается результат вызова."
      },
      {
        "ln": 23,
        "ev": "return",
        "vars": {
          "self.data": "['D', None, 'C']",
          "self.head": "2",
          "self.size": "2",
          "value": "'B'",
          "вызов": "pop"
        },
        "arr": [
          "A",
          "B",
          "C",
          "D"
        ],
        "ret": "'B'",
        "err": null,
        "say": "Вызов завершён, возвращается 'B'."
      },
      {
        "ln": 17,
        "ev": "line",
        "vars": {
          "self.data": "['D', None, 'C']",
          "self.head": "2",
          "self.size": "2",
          "вызов": "pop"
        },
        "arr": [
          "A",
          "B",
          "C",
          "D"
        ],
        "ret": null,
        "err": null,
        "say": "Проверяется условие. Следующий подсвеченный номер покажет выбранную ветвь."
      },
      {
        "ln": 19,
        "ev": "line",
        "vars": {
          "self.data": "['D', None, 'C']",
          "self.head": "2",
          "self.size": "2",
          "вызов": "pop"
        },
        "arr": [
          "A",
          "B",
          "C",
          "D"
        ],
        "ret": null,
        "err": null,
        "say": "Сейчас выполняется подсвеченная строка. Изменение состояния появится на следующем шаге."
      },
      {
        "ln": 20,
        "ev": "line",
        "vars": {
          "self.data": "['D', None, 'C']",
          "self.head": "2",
          "self.size": "2",
          "value": "'C'",
          "вызов": "pop"
        },
        "arr": [
          "A",
          "B",
          "C",
          "D"
        ],
        "ret": null,
        "err": null,
        "say": "Ссылка в снятой ячейке очищается; сохранённое value остаётся доступным."
      },
      {
        "ln": 21,
        "ev": "line",
        "vars": {
          "self.data": "['D', None, None]",
          "self.head": "2",
          "self.size": "2",
          "value": "'C'",
          "вызов": "pop"
        },
        "arr": [
          "A",
          "B",
          "C",
          "D"
        ],
        "ret": null,
        "err": null,
        "say": "Индекс головы переходит к следующей ячейке по кругу."
      },
      {
        "ln": 22,
        "ev": "line",
        "vars": {
          "self.data": "['D', None, None]",
          "self.head": "0",
          "self.size": "2",
          "value": "'C'",
          "вызов": "pop"
        },
        "arr": [
          "A",
          "B",
          "C",
          "D"
        ],
        "ret": null,
        "err": null,
        "say": "Обновляется число элементов. Физическая длина массива сохраняется."
      },
      {
        "ln": 23,
        "ev": "line",
        "vars": {
          "self.data": "['D', None, None]",
          "self.head": "0",
          "self.size": "1",
          "value": "'C'",
          "вызов": "pop"
        },
        "arr": [
          "A",
          "B",
          "C",
          "D"
        ],
        "ret": null,
        "err": null,
        "say": "Сейчас вычисляется и возвращается результат вызова."
      },
      {
        "ln": 23,
        "ev": "return",
        "vars": {
          "self.data": "['D', None, None]",
          "self.head": "0",
          "self.size": "1",
          "value": "'C'",
          "вызов": "pop"
        },
        "arr": [
          "A",
          "B",
          "C",
          "D"
        ],
        "ret": "'C'",
        "err": null,
        "say": "Вызов завершён, возвращается 'C'."
      },
      {
        "ln": 17,
        "ev": "line",
        "vars": {
          "self.data": "['D', None, None]",
          "self.head": "0",
          "self.size": "1",
          "вызов": "pop"
        },
        "arr": [
          "A",
          "B",
          "C",
          "D"
        ],
        "ret": null,
        "err": null,
        "say": "Проверяется условие. Следующий подсвеченный номер покажет выбранную ветвь."
      },
      {
        "ln": 19,
        "ev": "line",
        "vars": {
          "self.data": "['D', None, None]",
          "self.head": "0",
          "self.size": "1",
          "вызов": "pop"
        },
        "arr": [
          "A",
          "B",
          "C",
          "D"
        ],
        "ret": null,
        "err": null,
        "say": "Сейчас выполняется подсвеченная строка. Изменение состояния появится на следующем шаге."
      },
      {
        "ln": 20,
        "ev": "line",
        "vars": {
          "self.data": "['D', None, None]",
          "self.head": "0",
          "self.size": "1",
          "value": "'D'",
          "вызов": "pop"
        },
        "arr": [
          "A",
          "B",
          "C",
          "D"
        ],
        "ret": null,
        "err": null,
        "say": "Ссылка в снятой ячейке очищается; сохранённое value остаётся доступным."
      },
      {
        "ln": 21,
        "ev": "line",
        "vars": {
          "self.data": "[None, None, None]",
          "self.head": "0",
          "self.size": "1",
          "value": "'D'",
          "вызов": "pop"
        },
        "arr": [
          "A",
          "B",
          "C",
          "D"
        ],
        "ret": null,
        "err": null,
        "say": "Индекс головы переходит к следующей ячейке по кругу."
      },
      {
        "ln": 22,
        "ev": "line",
        "vars": {
          "self.data": "[None, None, None]",
          "self.head": "1",
          "self.size": "1",
          "value": "'D'",
          "вызов": "pop"
        },
        "arr": [
          "A",
          "B",
          "C",
          "D"
        ],
        "ret": null,
        "err": null,
        "say": "Обновляется число элементов. Физическая длина массива сохраняется."
      },
      {
        "ln": 23,
        "ev": "line",
        "vars": {
          "self.data": "[None, None, None]",
          "self.head": "1",
          "self.size": "0",
          "value": "'D'",
          "вызов": "pop"
        },
        "arr": [
          "A",
          "B",
          "C",
          "D"
        ],
        "ret": null,
        "err": null,
        "say": "Сейчас вычисляется и возвращается результат вызова."
      },
      {
        "ln": 23,
        "ev": "return",
        "vars": {
          "self.data": "[None, None, None]",
          "self.head": "1",
          "self.size": "0",
          "value": "'D'",
          "вызов": "pop"
        },
        "arr": [
          "A",
          "B",
          "C",
          "D"
        ],
        "ret": "'D'",
        "err": null,
        "say": "Вызов завершён, возвращается 'D'."
      },
      {
        "ln": 32,
        "ev": "return",
        "vars": {
          "q.data": "[None, None, None]",
          "q.head": "1",
          "q.size": "0",
          "first": "'A'",
          "вызов": "ring_demo"
        },
        "arr": [
          "A",
          "B",
          "C",
          "D"
        ],
        "ret": "['B', 'C', 'D']",
        "err": null,
        "say": "Вызов завершён, возвращается ['B', 'C', 'D']."
      }
    ],
    "call": "ring_demo()",
    "arr_name": "входные задачи",
    "ptrs": [],
    "result": "['B', 'C', 'D']",
    "after": "['A', 'B', 'C', 'D']",
    "error": null
  },
  "queue25_window": {
    "code": [
      "from collections import deque",
      "",
      "",
      "def max_window(nums, k):",
      "    if not 1 <= k <= len(nums):",
      "        raise ValueError(\"неверная ширина окна\")",
      "    candidates = deque()",
      "    answer = []",
      "    for i, value in enumerate(nums):",
      "        while candidates and candidates[0] <= i - k:",
      "            candidates.popleft()",
      "        while candidates and nums[candidates[-1]] <= value:",
      "            candidates.pop()",
      "        candidates.append(i)",
      "        if i >= k - 1:",
      "            answer.append(nums[candidates[0]])",
      "    return answer"
    ],
    "frames": [
      {
        "ln": 5,
        "ev": "line",
        "vars": {
          "nums": "[4, 1, 3, 5, 2, 5]",
          "k": "3",
          "вызов": "max_window"
        },
        "arr": [
          4,
          1,
          3,
          5,
          2,
          5
        ],
        "ret": null,
        "err": null,
        "say": "Проверяется условие. Следующий подсвеченный номер покажет выбранную ветвь."
      },
      {
        "ln": 7,
        "ev": "line",
        "vars": {
          "nums": "[4, 1, 3, 5, 2, 5]",
          "k": "3",
          "вызов": "max_window"
        },
        "arr": [
          4,
          1,
          3,
          5,
          2,
          5
        ],
        "ret": null,
        "err": null,
        "say": "Сейчас выполняется подсвеченная строка. Изменение состояния появится на следующем шаге."
      },
      {
        "ln": 8,
        "ev": "line",
        "vars": {
          "nums": "[4, 1, 3, 5, 2, 5]",
          "k": "3",
          "candidates": "deque([])",
          "вызов": "max_window"
        },
        "arr": [
          4,
          1,
          3,
          5,
          2,
          5
        ],
        "ret": null,
        "err": null,
        "say": "Сейчас выполняется подсвеченная строка. Изменение состояния появится на следующем шаге."
      },
      {
        "ln": 9,
        "ev": "line",
        "vars": {
          "nums": "[4, 1, 3, 5, 2, 5]",
          "k": "3",
          "candidates": "deque([])",
          "answer": "[]",
          "вызов": "max_window"
        },
        "arr": [
          4,
          1,
          3,
          5,
          2,
          5
        ],
        "ret": null,
        "err": null,
        "say": "Цикл получает следующий элемент. При завершении входа управление выйдет из цикла."
      },
      {
        "ln": 10,
        "ev": "line",
        "vars": {
          "nums": "[4, 1, 3, 5, 2, 5]",
          "k": "3",
          "candidates": "deque([])",
          "answer": "[]",
          "i": "0",
          "value": "4",
          "вызов": "max_window"
        },
        "arr": [
          4,
          1,
          3,
          5,
          2,
          5
        ],
        "ret": null,
        "err": null,
        "say": "Проверяется условие. Следующий подсвеченный номер покажет выбранную ветвь."
      },
      {
        "ln": 12,
        "ev": "line",
        "vars": {
          "nums": "[4, 1, 3, 5, 2, 5]",
          "k": "3",
          "candidates": "deque([])",
          "answer": "[]",
          "i": "0",
          "value": "4",
          "вызов": "max_window"
        },
        "arr": [
          4,
          1,
          3,
          5,
          2,
          5
        ],
        "ret": null,
        "err": null,
        "say": "Проверяется условие. Следующий подсвеченный номер покажет выбранную ветвь."
      },
      {
        "ln": 14,
        "ev": "line",
        "vars": {
          "nums": "[4, 1, 3, 5, 2, 5]",
          "k": "3",
          "candidates": "deque([])",
          "answer": "[]",
          "i": "0",
          "value": "4",
          "вызов": "max_window"
        },
        "arr": [
          4,
          1,
          3,
          5,
          2,
          5
        ],
        "ret": null,
        "err": null,
        "say": "Текущий индекс или пара добавляется в конец дека кандидатов."
      },
      {
        "ln": 15,
        "ev": "line",
        "vars": {
          "nums": "[4, 1, 3, 5, 2, 5]",
          "k": "3",
          "candidates": "deque([0])",
          "answer": "[]",
          "i": "0",
          "value": "4",
          "вызов": "max_window"
        },
        "arr": [
          4,
          1,
          3,
          5,
          2,
          5
        ],
        "ret": null,
        "err": null,
        "say": "Проверяется условие. Следующий подсвеченный номер покажет выбранную ветвь."
      },
      {
        "ln": 9,
        "ev": "line",
        "vars": {
          "nums": "[4, 1, 3, 5, 2, 5]",
          "k": "3",
          "candidates": "deque([0])",
          "answer": "[]",
          "i": "0",
          "value": "4",
          "вызов": "max_window"
        },
        "arr": [
          4,
          1,
          3,
          5,
          2,
          5
        ],
        "ret": null,
        "err": null,
        "say": "Цикл получает следующий элемент. При завершении входа управление выйдет из цикла."
      },
      {
        "ln": 10,
        "ev": "line",
        "vars": {
          "nums": "[4, 1, 3, 5, 2, 5]",
          "k": "3",
          "candidates": "deque([0])",
          "answer": "[]",
          "i": "1",
          "value": "1",
          "вызов": "max_window"
        },
        "arr": [
          4,
          1,
          3,
          5,
          2,
          5
        ],
        "ret": null,
        "err": null,
        "say": "Проверяется условие. Следующий подсвеченный номер покажет выбранную ветвь."
      },
      {
        "ln": 12,
        "ev": "line",
        "vars": {
          "nums": "[4, 1, 3, 5, 2, 5]",
          "k": "3",
          "candidates": "deque([0])",
          "answer": "[]",
          "i": "1",
          "value": "1",
          "вызов": "max_window"
        },
        "arr": [
          4,
          1,
          3,
          5,
          2,
          5
        ],
        "ret": null,
        "err": null,
        "say": "Проверяется условие. Следующий подсвеченный номер покажет выбранную ветвь."
      },
      {
        "ln": 14,
        "ev": "line",
        "vars": {
          "nums": "[4, 1, 3, 5, 2, 5]",
          "k": "3",
          "candidates": "deque([0])",
          "answer": "[]",
          "i": "1",
          "value": "1",
          "вызов": "max_window"
        },
        "arr": [
          4,
          1,
          3,
          5,
          2,
          5
        ],
        "ret": null,
        "err": null,
        "say": "Текущий индекс или пара добавляется в конец дека кандидатов."
      },
      {
        "ln": 15,
        "ev": "line",
        "vars": {
          "nums": "[4, 1, 3, 5, 2, 5]",
          "k": "3",
          "candidates": "deque([0, 1])",
          "answer": "[]",
          "i": "1",
          "value": "1",
          "вызов": "max_window"
        },
        "arr": [
          4,
          1,
          3,
          5,
          2,
          5
        ],
        "ret": null,
        "err": null,
        "say": "Проверяется условие. Следующий подсвеченный номер покажет выбранную ветвь."
      },
      {
        "ln": 9,
        "ev": "line",
        "vars": {
          "nums": "[4, 1, 3, 5, 2, 5]",
          "k": "3",
          "candidates": "deque([0, 1])",
          "answer": "[]",
          "i": "1",
          "value": "1",
          "вызов": "max_window"
        },
        "arr": [
          4,
          1,
          3,
          5,
          2,
          5
        ],
        "ret": null,
        "err": null,
        "say": "Цикл получает следующий элемент. При завершении входа управление выйдет из цикла."
      },
      {
        "ln": 10,
        "ev": "line",
        "vars": {
          "nums": "[4, 1, 3, 5, 2, 5]",
          "k": "3",
          "candidates": "deque([0, 1])",
          "answer": "[]",
          "i": "2",
          "value": "3",
          "вызов": "max_window"
        },
        "arr": [
          4,
          1,
          3,
          5,
          2,
          5
        ],
        "ret": null,
        "err": null,
        "say": "Проверяется условие. Следующий подсвеченный номер покажет выбранную ветвь."
      },
      {
        "ln": 12,
        "ev": "line",
        "vars": {
          "nums": "[4, 1, 3, 5, 2, 5]",
          "k": "3",
          "candidates": "deque([0, 1])",
          "answer": "[]",
          "i": "2",
          "value": "3",
          "вызов": "max_window"
        },
        "arr": [
          4,
          1,
          3,
          5,
          2,
          5
        ],
        "ret": null,
        "err": null,
        "say": "Проверяется условие. Следующий подсвеченный номер покажет выбранную ветвь."
      },
      {
        "ln": 13,
        "ev": "line",
        "vars": {
          "nums": "[4, 1, 3, 5, 2, 5]",
          "k": "3",
          "candidates": "deque([0, 1])",
          "answer": "[]",
          "i": "2",
          "value": "3",
          "вызов": "max_window"
        },
        "arr": [
          4,
          1,
          3,
          5,
          2,
          5
        ],
        "ret": null,
        "err": null,
        "say": "Последний кандидат вытеснен новым значением и снимается с конца дека."
      },
      {
        "ln": 12,
        "ev": "line",
        "vars": {
          "nums": "[4, 1, 3, 5, 2, 5]",
          "k": "3",
          "candidates": "deque([0])",
          "answer": "[]",
          "i": "2",
          "value": "3",
          "вызов": "max_window"
        },
        "arr": [
          4,
          1,
          3,
          5,
          2,
          5
        ],
        "ret": null,
        "err": null,
        "say": "Проверяется условие. Следующий подсвеченный номер покажет выбранную ветвь."
      },
      {
        "ln": 14,
        "ev": "line",
        "vars": {
          "nums": "[4, 1, 3, 5, 2, 5]",
          "k": "3",
          "candidates": "deque([0])",
          "answer": "[]",
          "i": "2",
          "value": "3",
          "вызов": "max_window"
        },
        "arr": [
          4,
          1,
          3,
          5,
          2,
          5
        ],
        "ret": null,
        "err": null,
        "say": "Текущий индекс или пара добавляется в конец дека кандидатов."
      },
      {
        "ln": 15,
        "ev": "line",
        "vars": {
          "nums": "[4, 1, 3, 5, 2, 5]",
          "k": "3",
          "candidates": "deque([0, 2])",
          "answer": "[]",
          "i": "2",
          "value": "3",
          "вызов": "max_window"
        },
        "arr": [
          4,
          1,
          3,
          5,
          2,
          5
        ],
        "ret": null,
        "err": null,
        "say": "Проверяется условие. Следующий подсвеченный номер покажет выбранную ветвь."
      },
      {
        "ln": 16,
        "ev": "line",
        "vars": {
          "nums": "[4, 1, 3, 5, 2, 5]",
          "k": "3",
          "candidates": "deque([0, 2])",
          "answer": "[]",
          "i": "2",
          "value": "3",
          "вызов": "max_window"
        },
        "arr": [
          4,
          1,
          3,
          5,
          2,
          5
        ],
        "ret": null,
        "err": null,
        "say": "Значение первого кандидата записывается как максимум текущего полного окна."
      },
      {
        "ln": 9,
        "ev": "line",
        "vars": {
          "nums": "[4, 1, 3, 5, 2, 5]",
          "k": "3",
          "candidates": "deque([0, 2])",
          "answer": "[4]",
          "i": "2",
          "value": "3",
          "вызов": "max_window"
        },
        "arr": [
          4,
          1,
          3,
          5,
          2,
          5
        ],
        "ret": null,
        "err": null,
        "say": "Цикл получает следующий элемент. При завершении входа управление выйдет из цикла."
      },
      {
        "ln": 10,
        "ev": "line",
        "vars": {
          "nums": "[4, 1, 3, 5, 2, 5]",
          "k": "3",
          "candidates": "deque([0, 2])",
          "answer": "[4]",
          "i": "3",
          "value": "5",
          "вызов": "max_window"
        },
        "arr": [
          4,
          1,
          3,
          5,
          2,
          5
        ],
        "ret": null,
        "err": null,
        "say": "Проверяется условие. Следующий подсвеченный номер покажет выбранную ветвь."
      },
      {
        "ln": 11,
        "ev": "line",
        "vars": {
          "nums": "[4, 1, 3, 5, 2, 5]",
          "k": "3",
          "candidates": "deque([0, 2])",
          "answer": "[4]",
          "i": "3",
          "value": "5",
          "вызов": "max_window"
        },
        "arr": [
          4,
          1,
          3,
          5,
          2,
          5
        ],
        "ret": null,
        "err": null,
        "say": "Устаревший кандидат снимается из начала дека."
      },
      {
        "ln": 10,
        "ev": "line",
        "vars": {
          "nums": "[4, 1, 3, 5, 2, 5]",
          "k": "3",
          "candidates": "deque([2])",
          "answer": "[4]",
          "i": "3",
          "value": "5",
          "вызов": "max_window"
        },
        "arr": [
          4,
          1,
          3,
          5,
          2,
          5
        ],
        "ret": null,
        "err": null,
        "say": "Проверяется условие. Следующий подсвеченный номер покажет выбранную ветвь."
      },
      {
        "ln": 12,
        "ev": "line",
        "vars": {
          "nums": "[4, 1, 3, 5, 2, 5]",
          "k": "3",
          "candidates": "deque([2])",
          "answer": "[4]",
          "i": "3",
          "value": "5",
          "вызов": "max_window"
        },
        "arr": [
          4,
          1,
          3,
          5,
          2,
          5
        ],
        "ret": null,
        "err": null,
        "say": "Проверяется условие. Следующий подсвеченный номер покажет выбранную ветвь."
      },
      {
        "ln": 13,
        "ev": "line",
        "vars": {
          "nums": "[4, 1, 3, 5, 2, 5]",
          "k": "3",
          "candidates": "deque([2])",
          "answer": "[4]",
          "i": "3",
          "value": "5",
          "вызов": "max_window"
        },
        "arr": [
          4,
          1,
          3,
          5,
          2,
          5
        ],
        "ret": null,
        "err": null,
        "say": "Последний кандидат вытеснен новым значением и снимается с конца дека."
      },
      {
        "ln": 12,
        "ev": "line",
        "vars": {
          "nums": "[4, 1, 3, 5, 2, 5]",
          "k": "3",
          "candidates": "deque([])",
          "answer": "[4]",
          "i": "3",
          "value": "5",
          "вызов": "max_window"
        },
        "arr": [
          4,
          1,
          3,
          5,
          2,
          5
        ],
        "ret": null,
        "err": null,
        "say": "Проверяется условие. Следующий подсвеченный номер покажет выбранную ветвь."
      },
      {
        "ln": 14,
        "ev": "line",
        "vars": {
          "nums": "[4, 1, 3, 5, 2, 5]",
          "k": "3",
          "candidates": "deque([])",
          "answer": "[4]",
          "i": "3",
          "value": "5",
          "вызов": "max_window"
        },
        "arr": [
          4,
          1,
          3,
          5,
          2,
          5
        ],
        "ret": null,
        "err": null,
        "say": "Текущий индекс или пара добавляется в конец дека кандидатов."
      },
      {
        "ln": 15,
        "ev": "line",
        "vars": {
          "nums": "[4, 1, 3, 5, 2, 5]",
          "k": "3",
          "candidates": "deque([3])",
          "answer": "[4]",
          "i": "3",
          "value": "5",
          "вызов": "max_window"
        },
        "arr": [
          4,
          1,
          3,
          5,
          2,
          5
        ],
        "ret": null,
        "err": null,
        "say": "Проверяется условие. Следующий подсвеченный номер покажет выбранную ветвь."
      },
      {
        "ln": 16,
        "ev": "line",
        "vars": {
          "nums": "[4, 1, 3, 5, 2, 5]",
          "k": "3",
          "candidates": "deque([3])",
          "answer": "[4]",
          "i": "3",
          "value": "5",
          "вызов": "max_window"
        },
        "arr": [
          4,
          1,
          3,
          5,
          2,
          5
        ],
        "ret": null,
        "err": null,
        "say": "Значение первого кандидата записывается как максимум текущего полного окна."
      },
      {
        "ln": 9,
        "ev": "line",
        "vars": {
          "nums": "[4, 1, 3, 5, 2, 5]",
          "k": "3",
          "candidates": "deque([3])",
          "answer": "[4, 5]",
          "i": "3",
          "value": "5",
          "вызов": "max_window"
        },
        "arr": [
          4,
          1,
          3,
          5,
          2,
          5
        ],
        "ret": null,
        "err": null,
        "say": "Цикл получает следующий элемент. При завершении входа управление выйдет из цикла."
      },
      {
        "ln": 10,
        "ev": "line",
        "vars": {
          "nums": "[4, 1, 3, 5, 2, 5]",
          "k": "3",
          "candidates": "deque([3])",
          "answer": "[4, 5]",
          "i": "4",
          "value": "2",
          "вызов": "max_window"
        },
        "arr": [
          4,
          1,
          3,
          5,
          2,
          5
        ],
        "ret": null,
        "err": null,
        "say": "Проверяется условие. Следующий подсвеченный номер покажет выбранную ветвь."
      },
      {
        "ln": 12,
        "ev": "line",
        "vars": {
          "nums": "[4, 1, 3, 5, 2, 5]",
          "k": "3",
          "candidates": "deque([3])",
          "answer": "[4, 5]",
          "i": "4",
          "value": "2",
          "вызов": "max_window"
        },
        "arr": [
          4,
          1,
          3,
          5,
          2,
          5
        ],
        "ret": null,
        "err": null,
        "say": "Проверяется условие. Следующий подсвеченный номер покажет выбранную ветвь."
      },
      {
        "ln": 14,
        "ev": "line",
        "vars": {
          "nums": "[4, 1, 3, 5, 2, 5]",
          "k": "3",
          "candidates": "deque([3])",
          "answer": "[4, 5]",
          "i": "4",
          "value": "2",
          "вызов": "max_window"
        },
        "arr": [
          4,
          1,
          3,
          5,
          2,
          5
        ],
        "ret": null,
        "err": null,
        "say": "Текущий индекс или пара добавляется в конец дека кандидатов."
      },
      {
        "ln": 15,
        "ev": "line",
        "vars": {
          "nums": "[4, 1, 3, 5, 2, 5]",
          "k": "3",
          "candidates": "deque([3, 4])",
          "answer": "[4, 5]",
          "i": "4",
          "value": "2",
          "вызов": "max_window"
        },
        "arr": [
          4,
          1,
          3,
          5,
          2,
          5
        ],
        "ret": null,
        "err": null,
        "say": "Проверяется условие. Следующий подсвеченный номер покажет выбранную ветвь."
      },
      {
        "ln": 16,
        "ev": "line",
        "vars": {
          "nums": "[4, 1, 3, 5, 2, 5]",
          "k": "3",
          "candidates": "deque([3, 4])",
          "answer": "[4, 5]",
          "i": "4",
          "value": "2",
          "вызов": "max_window"
        },
        "arr": [
          4,
          1,
          3,
          5,
          2,
          5
        ],
        "ret": null,
        "err": null,
        "say": "Значение первого кандидата записывается как максимум текущего полного окна."
      },
      {
        "ln": 9,
        "ev": "line",
        "vars": {
          "nums": "[4, 1, 3, 5, 2, 5]",
          "k": "3",
          "candidates": "deque([3, 4])",
          "answer": "[4, 5, 5]",
          "i": "4",
          "value": "2",
          "вызов": "max_window"
        },
        "arr": [
          4,
          1,
          3,
          5,
          2,
          5
        ],
        "ret": null,
        "err": null,
        "say": "Цикл получает следующий элемент. При завершении входа управление выйдет из цикла."
      },
      {
        "ln": 10,
        "ev": "line",
        "vars": {
          "nums": "[4, 1, 3, 5, 2, 5]",
          "k": "3",
          "candidates": "deque([3, 4])",
          "answer": "[4, 5, 5]",
          "i": "5",
          "value": "5",
          "вызов": "max_window"
        },
        "arr": [
          4,
          1,
          3,
          5,
          2,
          5
        ],
        "ret": null,
        "err": null,
        "say": "Проверяется условие. Следующий подсвеченный номер покажет выбранную ветвь."
      },
      {
        "ln": 12,
        "ev": "line",
        "vars": {
          "nums": "[4, 1, 3, 5, 2, 5]",
          "k": "3",
          "candidates": "deque([3, 4])",
          "answer": "[4, 5, 5]",
          "i": "5",
          "value": "5",
          "вызов": "max_window"
        },
        "arr": [
          4,
          1,
          3,
          5,
          2,
          5
        ],
        "ret": null,
        "err": null,
        "say": "Проверяется условие. Следующий подсвеченный номер покажет выбранную ветвь."
      },
      {
        "ln": 13,
        "ev": "line",
        "vars": {
          "nums": "[4, 1, 3, 5, 2, 5]",
          "k": "3",
          "candidates": "deque([3, 4])",
          "answer": "[4, 5, 5]",
          "i": "5",
          "value": "5",
          "вызов": "max_window"
        },
        "arr": [
          4,
          1,
          3,
          5,
          2,
          5
        ],
        "ret": null,
        "err": null,
        "say": "Последний кандидат вытеснен новым значением и снимается с конца дека."
      },
      {
        "ln": 12,
        "ev": "line",
        "vars": {
          "nums": "[4, 1, 3, 5, 2, 5]",
          "k": "3",
          "candidates": "deque([3])",
          "answer": "[4, 5, 5]",
          "i": "5",
          "value": "5",
          "вызов": "max_window"
        },
        "arr": [
          4,
          1,
          3,
          5,
          2,
          5
        ],
        "ret": null,
        "err": null,
        "say": "Проверяется условие. Следующий подсвеченный номер покажет выбранную ветвь."
      },
      {
        "ln": 13,
        "ev": "line",
        "vars": {
          "nums": "[4, 1, 3, 5, 2, 5]",
          "k": "3",
          "candidates": "deque([3])",
          "answer": "[4, 5, 5]",
          "i": "5",
          "value": "5",
          "вызов": "max_window"
        },
        "arr": [
          4,
          1,
          3,
          5,
          2,
          5
        ],
        "ret": null,
        "err": null,
        "say": "Последний кандидат вытеснен новым значением и снимается с конца дека."
      },
      {
        "ln": 12,
        "ev": "line",
        "vars": {
          "nums": "[4, 1, 3, 5, 2, 5]",
          "k": "3",
          "candidates": "deque([])",
          "answer": "[4, 5, 5]",
          "i": "5",
          "value": "5",
          "вызов": "max_window"
        },
        "arr": [
          4,
          1,
          3,
          5,
          2,
          5
        ],
        "ret": null,
        "err": null,
        "say": "Проверяется условие. Следующий подсвеченный номер покажет выбранную ветвь."
      },
      {
        "ln": 14,
        "ev": "line",
        "vars": {
          "nums": "[4, 1, 3, 5, 2, 5]",
          "k": "3",
          "candidates": "deque([])",
          "answer": "[4, 5, 5]",
          "i": "5",
          "value": "5",
          "вызов": "max_window"
        },
        "arr": [
          4,
          1,
          3,
          5,
          2,
          5
        ],
        "ret": null,
        "err": null,
        "say": "Текущий индекс или пара добавляется в конец дека кандидатов."
      },
      {
        "ln": 15,
        "ev": "line",
        "vars": {
          "nums": "[4, 1, 3, 5, 2, 5]",
          "k": "3",
          "candidates": "deque([5])",
          "answer": "[4, 5, 5]",
          "i": "5",
          "value": "5",
          "вызов": "max_window"
        },
        "arr": [
          4,
          1,
          3,
          5,
          2,
          5
        ],
        "ret": null,
        "err": null,
        "say": "Проверяется условие. Следующий подсвеченный номер покажет выбранную ветвь."
      },
      {
        "ln": 16,
        "ev": "line",
        "vars": {
          "nums": "[4, 1, 3, 5, 2, 5]",
          "k": "3",
          "candidates": "deque([5])",
          "answer": "[4, 5, 5]",
          "i": "5",
          "value": "5",
          "вызов": "max_window"
        },
        "arr": [
          4,
          1,
          3,
          5,
          2,
          5
        ],
        "ret": null,
        "err": null,
        "say": "Значение первого кандидата записывается как максимум текущего полного окна."
      },
      {
        "ln": 9,
        "ev": "line",
        "vars": {
          "nums": "[4, 1, 3, 5, 2, 5]",
          "k": "3",
          "candidates": "deque([5])",
          "answer": "[4, 5, 5, 5]",
          "i": "5",
          "value": "5",
          "вызов": "max_window"
        },
        "arr": [
          4,
          1,
          3,
          5,
          2,
          5
        ],
        "ret": null,
        "err": null,
        "say": "Цикл получает следующий элемент. При завершении входа управление выйдет из цикла."
      },
      {
        "ln": 17,
        "ev": "line",
        "vars": {
          "nums": "[4, 1, 3, 5, 2, 5]",
          "k": "3",
          "candidates": "deque([5])",
          "answer": "[4, 5, 5, 5]",
          "i": "5",
          "value": "5",
          "вызов": "max_window"
        },
        "arr": [
          4,
          1,
          3,
          5,
          2,
          5
        ],
        "ret": null,
        "err": null,
        "say": "Сейчас вычисляется и возвращается результат вызова."
      },
      {
        "ln": 17,
        "ev": "return",
        "vars": {
          "nums": "[4, 1, 3, 5, 2, 5]",
          "k": "3",
          "candidates": "deque([5])",
          "answer": "[4, 5, 5, 5]",
          "i": "5",
          "value": "5",
          "вызов": "max_window"
        },
        "arr": [
          4,
          1,
          3,
          5,
          2,
          5
        ],
        "ret": "[4, 5, 5, 5]",
        "err": null,
        "say": "Вызов завершён, возвращается [4, 5, 5, 5]."
      }
    ],
    "call": "max_window([4, 1, 3, 5, 2, 5], 3)",
    "arr_name": "nums",
    "ptrs": [
      "i"
    ],
    "result": "[4, 5, 5, 5]",
    "after": "[4, 1, 3, 5, 2, 5]",
    "error": null
  },
  "queue25_stream": {
    "code": [
      "from collections import deque",
      "",
      "def iter_max_window(values, k):",
      "    if k < 1:",
      "        raise ValueError(\"неверная ширина окна\")",
      "    candidates = deque()",
      "    for i, value in enumerate(values):",
      "        while candidates and candidates[0][0] <= i - k:",
      "            candidates.popleft()",
      "        while candidates and candidates[-1][1] <= value:",
      "            candidates.pop()",
      "        candidates.append((i, value))",
      "        if i >= k - 1:",
      "            yield candidates[0][1]",
      "",
      "def stream_demo():",
      "    return list(iter_max_window(iter([4, 1, 3, 5, 2, 5]), 3))"
    ],
    "frames": [
      {
        "ln": 17,
        "ev": "line",
        "vars": {
          "вызов": "stream_demo"
        },
        "arr": [
          4,
          1,
          3,
          5,
          2,
          5
        ],
        "ret": null,
        "err": null,
        "say": "Сейчас вычисляется и возвращается результат вызова."
      },
      {
        "ln": 4,
        "ev": "line",
        "vars": {
          "k": "3",
          "вызов": "iter_max_window"
        },
        "arr": [
          4,
          1,
          3,
          5,
          2,
          5
        ],
        "ret": null,
        "err": null,
        "say": "Проверяется условие. Следующий подсвеченный номер покажет выбранную ветвь."
      },
      {
        "ln": 6,
        "ev": "line",
        "vars": {
          "k": "3",
          "вызов": "iter_max_window"
        },
        "arr": [
          4,
          1,
          3,
          5,
          2,
          5
        ],
        "ret": null,
        "err": null,
        "say": "Сейчас выполняется подсвеченная строка. Изменение состояния появится на следующем шаге."
      },
      {
        "ln": 7,
        "ev": "line",
        "vars": {
          "k": "3",
          "candidates": "deque([])",
          "вызов": "iter_max_window"
        },
        "arr": [
          4,
          1,
          3,
          5,
          2,
          5
        ],
        "ret": null,
        "err": null,
        "say": "Цикл получает следующий элемент. При завершении входа управление выйдет из цикла."
      },
      {
        "ln": 8,
        "ev": "line",
        "vars": {
          "k": "3",
          "candidates": "deque([])",
          "i": "0",
          "value": "4",
          "вызов": "iter_max_window"
        },
        "arr": [
          4,
          1,
          3,
          5,
          2,
          5
        ],
        "ret": null,
        "err": null,
        "say": "Проверяется условие. Следующий подсвеченный номер покажет выбранную ветвь."
      },
      {
        "ln": 10,
        "ev": "line",
        "vars": {
          "k": "3",
          "candidates": "deque([])",
          "i": "0",
          "value": "4",
          "вызов": "iter_max_window"
        },
        "arr": [
          4,
          1,
          3,
          5,
          2,
          5
        ],
        "ret": null,
        "err": null,
        "say": "Проверяется условие. Следующий подсвеченный номер покажет выбранную ветвь."
      },
      {
        "ln": 12,
        "ev": "line",
        "vars": {
          "k": "3",
          "candidates": "deque([])",
          "i": "0",
          "value": "4",
          "вызов": "iter_max_window"
        },
        "arr": [
          4,
          1,
          3,
          5,
          2,
          5
        ],
        "ret": null,
        "err": null,
        "say": "Текущий индекс или пара добавляется в конец дека кандидатов."
      },
      {
        "ln": 13,
        "ev": "line",
        "vars": {
          "k": "3",
          "candidates": "deque([(0, 4)])",
          "i": "0",
          "value": "4",
          "вызов": "iter_max_window"
        },
        "arr": [
          4,
          1,
          3,
          5,
          2,
          5
        ],
        "ret": null,
        "err": null,
        "say": "Проверяется условие. Следующий подсвеченный номер покажет выбранную ветвь."
      },
      {
        "ln": 7,
        "ev": "line",
        "vars": {
          "k": "3",
          "candidates": "deque([(0, 4)])",
          "i": "0",
          "value": "4",
          "вызов": "iter_max_window"
        },
        "arr": [
          4,
          1,
          3,
          5,
          2,
          5
        ],
        "ret": null,
        "err": null,
        "say": "Цикл получает следующий элемент. При завершении входа управление выйдет из цикла."
      },
      {
        "ln": 8,
        "ev": "line",
        "vars": {
          "k": "3",
          "candidates": "deque([(0, 4)])",
          "i": "1",
          "value": "1",
          "вызов": "iter_max_window"
        },
        "arr": [
          4,
          1,
          3,
          5,
          2,
          5
        ],
        "ret": null,
        "err": null,
        "say": "Проверяется условие. Следующий подсвеченный номер покажет выбранную ветвь."
      },
      {
        "ln": 10,
        "ev": "line",
        "vars": {
          "k": "3",
          "candidates": "deque([(0, 4)])",
          "i": "1",
          "value": "1",
          "вызов": "iter_max_window"
        },
        "arr": [
          4,
          1,
          3,
          5,
          2,
          5
        ],
        "ret": null,
        "err": null,
        "say": "Проверяется условие. Следующий подсвеченный номер покажет выбранную ветвь."
      },
      {
        "ln": 12,
        "ev": "line",
        "vars": {
          "k": "3",
          "candidates": "deque([(0, 4)])",
          "i": "1",
          "value": "1",
          "вызов": "iter_max_window"
        },
        "arr": [
          4,
          1,
          3,
          5,
          2,
          5
        ],
        "ret": null,
        "err": null,
        "say": "Текущий индекс или пара добавляется в конец дека кандидатов."
      },
      {
        "ln": 13,
        "ev": "line",
        "vars": {
          "k": "3",
          "candidates": "deque([(0, 4), (1, 1)])",
          "i": "1",
          "value": "1",
          "вызов": "iter_max_window"
        },
        "arr": [
          4,
          1,
          3,
          5,
          2,
          5
        ],
        "ret": null,
        "err": null,
        "say": "Проверяется условие. Следующий подсвеченный номер покажет выбранную ветвь."
      },
      {
        "ln": 7,
        "ev": "line",
        "vars": {
          "k": "3",
          "candidates": "deque([(0, 4), (1, 1)])",
          "i": "1",
          "value": "1",
          "вызов": "iter_max_window"
        },
        "arr": [
          4,
          1,
          3,
          5,
          2,
          5
        ],
        "ret": null,
        "err": null,
        "say": "Цикл получает следующий элемент. При завершении входа управление выйдет из цикла."
      },
      {
        "ln": 8,
        "ev": "line",
        "vars": {
          "k": "3",
          "candidates": "deque([(0, 4), (1, 1)])",
          "i": "2",
          "value": "3",
          "вызов": "iter_max_window"
        },
        "arr": [
          4,
          1,
          3,
          5,
          2,
          5
        ],
        "ret": null,
        "err": null,
        "say": "Проверяется условие. Следующий подсвеченный номер покажет выбранную ветвь."
      },
      {
        "ln": 10,
        "ev": "line",
        "vars": {
          "k": "3",
          "candidates": "deque([(0, 4), (1, 1)])",
          "i": "2",
          "value": "3",
          "вызов": "iter_max_window"
        },
        "arr": [
          4,
          1,
          3,
          5,
          2,
          5
        ],
        "ret": null,
        "err": null,
        "say": "Проверяется условие. Следующий подсвеченный номер покажет выбранную ветвь."
      },
      {
        "ln": 11,
        "ev": "line",
        "vars": {
          "k": "3",
          "candidates": "deque([(0, 4), (1, 1)])",
          "i": "2",
          "value": "3",
          "вызов": "iter_max_window"
        },
        "arr": [
          4,
          1,
          3,
          5,
          2,
          5
        ],
        "ret": null,
        "err": null,
        "say": "Последний кандидат вытеснен новым значением и снимается с конца дека."
      },
      {
        "ln": 10,
        "ev": "line",
        "vars": {
          "k": "3",
          "candidates": "deque([(0, 4)])",
          "i": "2",
          "value": "3",
          "вызов": "iter_max_window"
        },
        "arr": [
          4,
          1,
          3,
          5,
          2,
          5
        ],
        "ret": null,
        "err": null,
        "say": "Проверяется условие. Следующий подсвеченный номер покажет выбранную ветвь."
      },
      {
        "ln": 12,
        "ev": "line",
        "vars": {
          "k": "3",
          "candidates": "deque([(0, 4)])",
          "i": "2",
          "value": "3",
          "вызов": "iter_max_window"
        },
        "arr": [
          4,
          1,
          3,
          5,
          2,
          5
        ],
        "ret": null,
        "err": null,
        "say": "Текущий индекс или пара добавляется в конец дека кандидатов."
      },
      {
        "ln": 13,
        "ev": "line",
        "vars": {
          "k": "3",
          "candidates": "deque([(0, 4), (2, 3)])",
          "i": "2",
          "value": "3",
          "вызов": "iter_max_window"
        },
        "arr": [
          4,
          1,
          3,
          5,
          2,
          5
        ],
        "ret": null,
        "err": null,
        "say": "Проверяется условие. Следующий подсвеченный номер покажет выбранную ветвь."
      },
      {
        "ln": 14,
        "ev": "line",
        "vars": {
          "k": "3",
          "candidates": "deque([(0, 4), (2, 3)])",
          "i": "2",
          "value": "3",
          "вызов": "iter_max_window"
        },
        "arr": [
          4,
          1,
          3,
          5,
          2,
          5
        ],
        "ret": null,
        "err": null,
        "say": "Сейчас выдаётся максимум полного окна. Следующий запрос продолжит этот же перебор."
      },
      {
        "ln": 14,
        "ev": "line",
        "vars": {
          "k": "3",
          "candidates": "deque([(0, 4), (2, 3)])",
          "i": "2",
          "value": "3",
          "вызов": "iter_max_window"
        },
        "arr": [
          4,
          1,
          3,
          5,
          2,
          5
        ],
        "ret": "4",
        "err": null,
        "say": "Выдано значение 4. Перебор приостановлен до следующего запроса."
      },
      {
        "ln": 7,
        "ev": "line",
        "vars": {
          "k": "3",
          "candidates": "deque([(0, 4), (2, 3)])",
          "i": "2",
          "value": "3",
          "вызов": "iter_max_window"
        },
        "arr": [
          4,
          1,
          3,
          5,
          2,
          5
        ],
        "ret": null,
        "err": null,
        "say": "Цикл получает следующий элемент. При завершении входа управление выйдет из цикла."
      },
      {
        "ln": 8,
        "ev": "line",
        "vars": {
          "k": "3",
          "candidates": "deque([(0, 4), (2, 3)])",
          "i": "3",
          "value": "5",
          "вызов": "iter_max_window"
        },
        "arr": [
          4,
          1,
          3,
          5,
          2,
          5
        ],
        "ret": null,
        "err": null,
        "say": "Проверяется условие. Следующий подсвеченный номер покажет выбранную ветвь."
      },
      {
        "ln": 9,
        "ev": "line",
        "vars": {
          "k": "3",
          "candidates": "deque([(0, 4), (2, 3)])",
          "i": "3",
          "value": "5",
          "вызов": "iter_max_window"
        },
        "arr": [
          4,
          1,
          3,
          5,
          2,
          5
        ],
        "ret": null,
        "err": null,
        "say": "Устаревший кандидат снимается из начала дека."
      },
      {
        "ln": 8,
        "ev": "line",
        "vars": {
          "k": "3",
          "candidates": "deque([(2, 3)])",
          "i": "3",
          "value": "5",
          "вызов": "iter_max_window"
        },
        "arr": [
          4,
          1,
          3,
          5,
          2,
          5
        ],
        "ret": null,
        "err": null,
        "say": "Проверяется условие. Следующий подсвеченный номер покажет выбранную ветвь."
      },
      {
        "ln": 10,
        "ev": "line",
        "vars": {
          "k": "3",
          "candidates": "deque([(2, 3)])",
          "i": "3",
          "value": "5",
          "вызов": "iter_max_window"
        },
        "arr": [
          4,
          1,
          3,
          5,
          2,
          5
        ],
        "ret": null,
        "err": null,
        "say": "Проверяется условие. Следующий подсвеченный номер покажет выбранную ветвь."
      },
      {
        "ln": 11,
        "ev": "line",
        "vars": {
          "k": "3",
          "candidates": "deque([(2, 3)])",
          "i": "3",
          "value": "5",
          "вызов": "iter_max_window"
        },
        "arr": [
          4,
          1,
          3,
          5,
          2,
          5
        ],
        "ret": null,
        "err": null,
        "say": "Последний кандидат вытеснен новым значением и снимается с конца дека."
      },
      {
        "ln": 10,
        "ev": "line",
        "vars": {
          "k": "3",
          "candidates": "deque([])",
          "i": "3",
          "value": "5",
          "вызов": "iter_max_window"
        },
        "arr": [
          4,
          1,
          3,
          5,
          2,
          5
        ],
        "ret": null,
        "err": null,
        "say": "Проверяется условие. Следующий подсвеченный номер покажет выбранную ветвь."
      },
      {
        "ln": 12,
        "ev": "line",
        "vars": {
          "k": "3",
          "candidates": "deque([])",
          "i": "3",
          "value": "5",
          "вызов": "iter_max_window"
        },
        "arr": [
          4,
          1,
          3,
          5,
          2,
          5
        ],
        "ret": null,
        "err": null,
        "say": "Текущий индекс или пара добавляется в конец дека кандидатов."
      },
      {
        "ln": 13,
        "ev": "line",
        "vars": {
          "k": "3",
          "candidates": "deque([(3, 5)])",
          "i": "3",
          "value": "5",
          "вызов": "iter_max_window"
        },
        "arr": [
          4,
          1,
          3,
          5,
          2,
          5
        ],
        "ret": null,
        "err": null,
        "say": "Проверяется условие. Следующий подсвеченный номер покажет выбранную ветвь."
      },
      {
        "ln": 14,
        "ev": "line",
        "vars": {
          "k": "3",
          "candidates": "deque([(3, 5)])",
          "i": "3",
          "value": "5",
          "вызов": "iter_max_window"
        },
        "arr": [
          4,
          1,
          3,
          5,
          2,
          5
        ],
        "ret": null,
        "err": null,
        "say": "Сейчас выдаётся максимум полного окна. Следующий запрос продолжит этот же перебор."
      },
      {
        "ln": 14,
        "ev": "line",
        "vars": {
          "k": "3",
          "candidates": "deque([(3, 5)])",
          "i": "3",
          "value": "5",
          "вызов": "iter_max_window"
        },
        "arr": [
          4,
          1,
          3,
          5,
          2,
          5
        ],
        "ret": "5",
        "err": null,
        "say": "Выдано значение 5. Перебор приостановлен до следующего запроса."
      },
      {
        "ln": 7,
        "ev": "line",
        "vars": {
          "k": "3",
          "candidates": "deque([(3, 5)])",
          "i": "3",
          "value": "5",
          "вызов": "iter_max_window"
        },
        "arr": [
          4,
          1,
          3,
          5,
          2,
          5
        ],
        "ret": null,
        "err": null,
        "say": "Цикл получает следующий элемент. При завершении входа управление выйдет из цикла."
      },
      {
        "ln": 8,
        "ev": "line",
        "vars": {
          "k": "3",
          "candidates": "deque([(3, 5)])",
          "i": "4",
          "value": "2",
          "вызов": "iter_max_window"
        },
        "arr": [
          4,
          1,
          3,
          5,
          2,
          5
        ],
        "ret": null,
        "err": null,
        "say": "Проверяется условие. Следующий подсвеченный номер покажет выбранную ветвь."
      },
      {
        "ln": 10,
        "ev": "line",
        "vars": {
          "k": "3",
          "candidates": "deque([(3, 5)])",
          "i": "4",
          "value": "2",
          "вызов": "iter_max_window"
        },
        "arr": [
          4,
          1,
          3,
          5,
          2,
          5
        ],
        "ret": null,
        "err": null,
        "say": "Проверяется условие. Следующий подсвеченный номер покажет выбранную ветвь."
      },
      {
        "ln": 12,
        "ev": "line",
        "vars": {
          "k": "3",
          "candidates": "deque([(3, 5)])",
          "i": "4",
          "value": "2",
          "вызов": "iter_max_window"
        },
        "arr": [
          4,
          1,
          3,
          5,
          2,
          5
        ],
        "ret": null,
        "err": null,
        "say": "Текущий индекс или пара добавляется в конец дека кандидатов."
      },
      {
        "ln": 13,
        "ev": "line",
        "vars": {
          "k": "3",
          "candidates": "deque([(3, 5), (4, 2)])",
          "i": "4",
          "value": "2",
          "вызов": "iter_max_window"
        },
        "arr": [
          4,
          1,
          3,
          5,
          2,
          5
        ],
        "ret": null,
        "err": null,
        "say": "Проверяется условие. Следующий подсвеченный номер покажет выбранную ветвь."
      },
      {
        "ln": 14,
        "ev": "line",
        "vars": {
          "k": "3",
          "candidates": "deque([(3, 5), (4, 2)])",
          "i": "4",
          "value": "2",
          "вызов": "iter_max_window"
        },
        "arr": [
          4,
          1,
          3,
          5,
          2,
          5
        ],
        "ret": null,
        "err": null,
        "say": "Сейчас выдаётся максимум полного окна. Следующий запрос продолжит этот же перебор."
      },
      {
        "ln": 14,
        "ev": "line",
        "vars": {
          "k": "3",
          "candidates": "deque([(3, 5), (4, 2)])",
          "i": "4",
          "value": "2",
          "вызов": "iter_max_window"
        },
        "arr": [
          4,
          1,
          3,
          5,
          2,
          5
        ],
        "ret": "5",
        "err": null,
        "say": "Выдано значение 5. Перебор приостановлен до следующего запроса."
      },
      {
        "ln": 7,
        "ev": "line",
        "vars": {
          "k": "3",
          "candidates": "deque([(3, 5), (4, 2)])",
          "i": "4",
          "value": "2",
          "вызов": "iter_max_window"
        },
        "arr": [
          4,
          1,
          3,
          5,
          2,
          5
        ],
        "ret": null,
        "err": null,
        "say": "Цикл получает следующий элемент. При завершении входа управление выйдет из цикла."
      },
      {
        "ln": 8,
        "ev": "line",
        "vars": {
          "k": "3",
          "candidates": "deque([(3, 5), (4, 2)])",
          "i": "5",
          "value": "5",
          "вызов": "iter_max_window"
        },
        "arr": [
          4,
          1,
          3,
          5,
          2,
          5
        ],
        "ret": null,
        "err": null,
        "say": "Проверяется условие. Следующий подсвеченный номер покажет выбранную ветвь."
      },
      {
        "ln": 10,
        "ev": "line",
        "vars": {
          "k": "3",
          "candidates": "deque([(3, 5), (4, 2)])",
          "i": "5",
          "value": "5",
          "вызов": "iter_max_window"
        },
        "arr": [
          4,
          1,
          3,
          5,
          2,
          5
        ],
        "ret": null,
        "err": null,
        "say": "Проверяется условие. Следующий подсвеченный номер покажет выбранную ветвь."
      },
      {
        "ln": 11,
        "ev": "line",
        "vars": {
          "k": "3",
          "candidates": "deque([(3, 5), (4, 2)])",
          "i": "5",
          "value": "5",
          "вызов": "iter_max_window"
        },
        "arr": [
          4,
          1,
          3,
          5,
          2,
          5
        ],
        "ret": null,
        "err": null,
        "say": "Последний кандидат вытеснен новым значением и снимается с конца дека."
      },
      {
        "ln": 10,
        "ev": "line",
        "vars": {
          "k": "3",
          "candidates": "deque([(3, 5)])",
          "i": "5",
          "value": "5",
          "вызов": "iter_max_window"
        },
        "arr": [
          4,
          1,
          3,
          5,
          2,
          5
        ],
        "ret": null,
        "err": null,
        "say": "Проверяется условие. Следующий подсвеченный номер покажет выбранную ветвь."
      },
      {
        "ln": 11,
        "ev": "line",
        "vars": {
          "k": "3",
          "candidates": "deque([(3, 5)])",
          "i": "5",
          "value": "5",
          "вызов": "iter_max_window"
        },
        "arr": [
          4,
          1,
          3,
          5,
          2,
          5
        ],
        "ret": null,
        "err": null,
        "say": "Последний кандидат вытеснен новым значением и снимается с конца дека."
      },
      {
        "ln": 10,
        "ev": "line",
        "vars": {
          "k": "3",
          "candidates": "deque([])",
          "i": "5",
          "value": "5",
          "вызов": "iter_max_window"
        },
        "arr": [
          4,
          1,
          3,
          5,
          2,
          5
        ],
        "ret": null,
        "err": null,
        "say": "Проверяется условие. Следующий подсвеченный номер покажет выбранную ветвь."
      },
      {
        "ln": 12,
        "ev": "line",
        "vars": {
          "k": "3",
          "candidates": "deque([])",
          "i": "5",
          "value": "5",
          "вызов": "iter_max_window"
        },
        "arr": [
          4,
          1,
          3,
          5,
          2,
          5
        ],
        "ret": null,
        "err": null,
        "say": "Текущий индекс или пара добавляется в конец дека кандидатов."
      },
      {
        "ln": 13,
        "ev": "line",
        "vars": {
          "k": "3",
          "candidates": "deque([(5, 5)])",
          "i": "5",
          "value": "5",
          "вызов": "iter_max_window"
        },
        "arr": [
          4,
          1,
          3,
          5,
          2,
          5
        ],
        "ret": null,
        "err": null,
        "say": "Проверяется условие. Следующий подсвеченный номер покажет выбранную ветвь."
      },
      {
        "ln": 14,
        "ev": "line",
        "vars": {
          "k": "3",
          "candidates": "deque([(5, 5)])",
          "i": "5",
          "value": "5",
          "вызов": "iter_max_window"
        },
        "arr": [
          4,
          1,
          3,
          5,
          2,
          5
        ],
        "ret": null,
        "err": null,
        "say": "Сейчас выдаётся максимум полного окна. Следующий запрос продолжит этот же перебор."
      },
      {
        "ln": 14,
        "ev": "line",
        "vars": {
          "k": "3",
          "candidates": "deque([(5, 5)])",
          "i": "5",
          "value": "5",
          "вызов": "iter_max_window"
        },
        "arr": [
          4,
          1,
          3,
          5,
          2,
          5
        ],
        "ret": "5",
        "err": null,
        "say": "Выдано значение 5. Перебор приостановлен до следующего запроса."
      },
      {
        "ln": 7,
        "ev": "line",
        "vars": {
          "k": "3",
          "candidates": "deque([(5, 5)])",
          "i": "5",
          "value": "5",
          "вызов": "iter_max_window"
        },
        "arr": [
          4,
          1,
          3,
          5,
          2,
          5
        ],
        "ret": null,
        "err": null,
        "say": "Цикл получает следующий элемент. При завершении входа управление выйдет из цикла."
      },
      {
        "ln": 7,
        "ev": "return",
        "vars": {
          "k": "3",
          "candidates": "deque([(5, 5)])",
          "i": "5",
          "value": "5",
          "вызов": "iter_max_window"
        },
        "arr": [
          4,
          1,
          3,
          5,
          2,
          5
        ],
        "ret": "None",
        "err": null,
        "say": "Вызов завершён, возвращается None."
      },
      {
        "ln": 17,
        "ev": "return",
        "vars": {
          "вызов": "stream_demo"
        },
        "arr": [
          4,
          1,
          3,
          5,
          2,
          5
        ],
        "ret": "[4, 5, 5, 5]",
        "err": null,
        "say": "Вызов завершён, возвращается [4, 5, 5, 5]."
      }
    ],
    "call": "stream_demo()",
    "arr_name": "значения потока",
    "ptrs": [
      "i"
    ],
    "result": "[4, 5, 5, 5]",
    "after": "[4, 1, 3, 5, 2, 5]",
    "error": null
  }
});
