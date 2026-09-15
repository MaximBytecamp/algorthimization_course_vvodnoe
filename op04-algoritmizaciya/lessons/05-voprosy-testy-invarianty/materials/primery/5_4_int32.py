INT32_MIN = -2**31
INT32_MAX = 2**31 - 1


def fits_int32(value):
    return INT32_MIN <= value <= INT32_MAX


a = 2_000_000_000
b = 2_000_000_000
total = a + b
print(total)
print(fits_int32(a), fits_int32(b), fits_int32(total))
