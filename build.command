#!/bin/bash
# Double-click this in Finder after editing anything in lib/ or tiles.html.
# It regenerates the seven cuts and the single-file tile generator.
cd "$(dirname "$0")" || exit 1
echo "Building Kai launch kit…"
echo
python3 tools/build_cuts.py || { echo "FAILED — cuts"; read -n1 -p "Press any key"; exit 1; }
python3 tools/build_standalone.py || { echo "FAILED — generator"; read -n1 -p "Press any key"; exit 1; }
echo
echo "Done. Open GitHub Desktop — the changed files are waiting to be committed."
echo
read -n1 -p "Press any key to close."
