-- База магазина «Склад и заказы» для занятия 1 МДК.01.11.
-- Скрипт выполняется один раз, при первом запуске контейнера.

CREATE TABLE customers (
    id        integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    full_name text NOT NULL,
    city      text NOT NULL
);

CREATE TABLE products (
    id    integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name  text          NOT NULL,
    price numeric(10,2) NOT NULL CHECK (price > 0),
    stock integer       NOT NULL CHECK (stock >= 0)
);

CREATE TABLE orders (
    id          integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    customer_id integer       NOT NULL REFERENCES customers (id),
    status      text          NOT NULL CHECK (status IN ('new', 'paid', 'shipped', 'cancelled')),
    created_at  date          NOT NULL,
    total       numeric(10,2) NOT NULL
);

CREATE TABLE order_items (
    order_id   integer       NOT NULL REFERENCES orders (id),
    product_id integer       NOT NULL REFERENCES products (id),
    quantity   integer       NOT NULL CHECK (quantity > 0),
    price      numeric(10,2) NOT NULL,
    PRIMARY KEY (order_id, product_id)
);

INSERT INTO customers (full_name, city) VALUES
    ('Анна Смирнова',    'Казань'),
    ('Игорь Волков',     'Самара'),
    ('Мария Козлова',    'Казань'),
    ('Дмитрий Орлов',    'Уфа'),
    ('Елена Новикова',   'Самара'),
    ('Павел Соколов',    'Пермь');

INSERT INTO products (name, price, stock) VALUES
    ('Клавиатура',         2490.00, 14),
    ('Мышь',                890.00, 40),
    ('Монитор 24"',       13990.00,  6),
    ('Наушники',           3290.00, 18),
    ('Веб-камера',         2790.00,  9),
    ('Коврик для мыши',     390.00, 55),
    ('USB-хаб',            1190.00, 22),
    ('Подставка для ноутбука', 1890.00, 11);

INSERT INTO orders (customer_id, status, created_at, total) VALUES
    (1, 'shipped',   '2026-09-01',  3380.00),
    (2, 'paid',      '2026-09-03', 13990.00),
    (3, 'new',       '2026-09-04',  3290.00),
    (1, 'cancelled', '2026-09-05',   890.00),
    (4, 'new',       '2026-09-07',  5280.00),
    (5, 'shipped',   '2026-09-08',  1670.00),
    (2, 'new',       '2026-09-10',  2490.00),
    (6, 'paid',      '2026-09-11',  5360.00),
    (3, 'shipped',   '2026-09-12', 16780.00),
    (5, 'new',       '2026-09-14',  1190.00),
    (4, 'paid',      '2026-09-15',  2790.00),
    (6, 'cancelled', '2026-09-16',  3290.00);

INSERT INTO order_items (order_id, product_id, quantity, price) VALUES
    (1, 1, 1, 2490.00), (1, 2, 1, 890.00),
    (2, 3, 1, 13990.00),
    (3, 4, 1, 3290.00),
    (4, 2, 1, 890.00),
    (5, 1, 1, 2490.00), (5, 5, 1, 2790.00),
    (6, 6, 2, 390.00),  (6, 2, 1, 890.00),
    (7, 1, 1, 2490.00),
    (8, 8, 2, 1890.00), (8, 6, 1, 390.00), (8, 7, 1, 1190.00),
    (9, 3, 1, 13990.00), (9, 5, 1, 2790.00),
    (10, 7, 1, 1190.00),
    (11, 5, 1, 2790.00),
    (12, 4, 1, 3290.00);
