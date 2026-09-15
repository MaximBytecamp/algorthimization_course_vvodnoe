n_max = 100_000
value_max = 10**9

upper = n_max * value_max
lower = -upper
print(lower, upper)
print(upper <= 2**31 - 1)
print(upper <= 2**63 - 1)
print(sum([10**9] * 100_000))
