import json
import re
import urllib.request

def keep(labels, source, regex):
    # regex в Prometheus сравнивается со всем значением целиком
    return re.fullmatch(regex, labels.get(source, "")) is not None

def replace(labels, source, regex, target, replacement):
    m = re.fullmatch(regex, labels.get(source, ""))
    if m:
        labels[target] = m.expand(replacement.replace("$1", r"\1"))

def relabel(found):
    labels = dict(found)
    if not keep(labels, "env", "prod"):
        return None                                   # target отброшен до опроса
    replace(labels, "__address__", r"([^:]+):\d+", "replica", "$1")
    replace(labels, "__meta_filepath", r".*/(.+)\.json", "source", "$1")
    labels.setdefault("instance", labels["__address__"])
    return {k: v for k, v in sorted(labels.items()) if not k.startswith("__")}

with urllib.request.urlopen("http://localhost:9104/api/v1/targets?state=any") as r:
    data = json.load(r)["data"]
found = [t["discoveredLabels"] for t in data["activeTargets"] + data["droppedTargets"]]
for labels in found:
    print(labels["__address__"], "->", relabel(labels))
print("у Prometheus:", [t["labels"] for t in data["activeTargets"]])
