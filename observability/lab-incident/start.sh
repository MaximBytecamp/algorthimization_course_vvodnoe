#!/bin/sh
# Три экземпляра каталога. Аргумент — размер пула api-2 и его версия: ./start.sh 2 2.15.0
POOL2=${1:-10}
VERSION2=${2:-2.14.0}
INSTANCE=api-1 VERSION=2.14.0 POOL_SIZE=10 python -m uvicorn app:app --port 8031 --log-level warning &
INSTANCE=api-2 VERSION=$VERSION2 POOL_SIZE=$POOL2 python -m uvicorn app:app --port 8032 --log-level warning &
INSTANCE=api-3 VERSION=2.14.0 POOL_SIZE=10 python -m uvicorn app:app --port 8033 --log-level warning &
wait
