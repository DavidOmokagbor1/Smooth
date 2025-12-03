# Quick Start - Lazy Backend

## Problem: `ModuleNotFoundError: No module named 'fastapi'`

This happens when you run `python3 main.py` without activating the virtual environment.

## Solution: Use the start script

```bash
cd Lazy/backend
./start.sh
```

Or manually activate the virtual environment:

```bash
cd Lazy/backend
source venv/bin/activate
python3 main.py
```

## Alternative: Use the run script

```bash
cd Lazy/backend
bash run.sh
```

## What the start script does:

1. ✅ Activates the virtual environment
2. ✅ Checks if dependencies are installed
3. ✅ Installs dependencies if needed
4. ✅ Starts the server

## Manual Steps (if scripts don't work):

```bash
# 1. Navigate to backend directory
cd Lazy/backend

# 2. Activate virtual environment
source venv/bin/activate

# 3. Verify FastAPI is installed
python3 -c "import fastapi; print('FastAPI version:', fastapi.__version__)"

# 4. Start the server
python3 main.py
```

## Troubleshooting

If you still get `ModuleNotFoundError`:

1. **Check if venv exists:**
   ```bash
   ls -la venv
   ```

2. **Recreate venv if needed:**
   ```bash
   rm -rf venv
   python3 -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt
   ```

3. **Verify activation:**
   ```bash
   which python3  # Should point to venv/bin/python3
   ```

