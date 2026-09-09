from measurements import measure_time

numbers_list = list(
    range(1_000_000)
)

numbers_set = set(
    numbers_list
)


def search_list():
    return -1 in numbers_list


def search_set():
    return -1 in numbers_set


print(
    "list:",
    measure_time(
        search_list,
        repeats=20
    )
)

print(
    "set:",
    measure_time(
        search_set,
        repeats=20
    )
)
