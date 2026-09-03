.PHONY: setup test bench lesson

setup:
	bash scripts/setup.sh

test:
	.venv/bin/pytest

bench:
	.venv/bin/python benchmarks/lab.py

# make lesson N=07  — создаёт папку занятия из шаблонов
lesson:
	@test -n "$(N)" || (echo "Укажите номер: make lesson N=07"; exit 1)
	mkdir -p lesson_$(N)
	cp templates/solution.py templates/complexity.md lesson_$(N)/
	cp templates/test_lesson.py lesson_$(N)/test_lesson_$(N).py
	@echo "Готово: lesson_$(N)"
