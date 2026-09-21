"""Заказ: одна строка файла смены."""

from dataclasses import dataclass

from app.utils.text import normalize_name


@dataclass(frozen=True)
class Order:
    """Один заказ из файла смены.

    Объект неизменяемый: после создания сумму и официанта поменять нельзя,
    поэтому заказы можно безопасно передавать между слоями.

    Attributes:
        waiter: Имя официанта в виде «Фамилия Имя».
        kopeks: Сумма заказа в копейках, неотрицательная.
    """

    waiter: str
    kopeks: int

    def __post_init__(self) -> None:
        """Проверяет данные сразу после создания заказа.

        Raises:
            ValueError: Если сумма отрицательная.
        """
        if self.kopeks < 0:
            raise ValueError("Сумма заказа не может быть отрицательной")
        object.__setattr__(self, "waiter", normalize_name(self.waiter))
