#!/bin/bash
killall ollama 2>/dev/null
OLLAMA_MODELS=$PWD/resources/models OLLAMA_HOST=127.0.0.1:11435 ./resources/mac/ollama serve > serve.log 2>&1 &
SERVER_PID=$!
sleep 5
OLLAMA_HOST=127.0.0.1:11435 ./resources/mac/ollama pull tinyllama > pull.log 2>&1
kill $SERVER_PID
echo "Pull finished" > pull-done.txt
