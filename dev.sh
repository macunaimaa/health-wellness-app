#!/bin/bash
set -e

SESSION="saude-app"
BASEDIR="$(cd "$(dirname "$0")" && pwd)"

tmux kill-session -t "$SESSION" 2>/dev/null || true

tmux new-session -d -s "$SESSION" -c "$BASEDIR"
BACKEND_PANE=$(tmux display-message -t "$SESSION" -p "#{pane_id}")

tmux split-window -h -t "$SESSION" -c "$BASEDIR"
FRONTEND_PANE=$(tmux display-message -t "$SESSION" -p "#{pane_id}")

tmux send-keys -t "$BACKEND_PANE" "cd $BASEDIR/backend && npm run dev" Enter
tmux send-keys -t "$FRONTEND_PANE" "cd $BASEDIR/frontend && npm run dev" Enter

tmux select-pane -t "$BACKEND_PANE"

tmux attach-session -t "$SESSION"
