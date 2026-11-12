"""Compila credit.cpp como biblioteca compartida. Usa $CXX si esta definido y si no g++."""

import os
import shlex
import subprocess
from pathlib import Path

from . import LIBRARY

SOURCE = Path(__file__).with_name("credit.cpp")
FLAGS = ["-std=c++17", "-O2", "-Wall", "-Wextra", "-Werror", "-shared", "-fPIC"]

if __name__ == "__main__":
    compiler = shlex.split(os.environ.get("CXX", "g++"))
    subprocess.run([*compiler, *FLAGS, str(SOURCE), "-o", str(LIBRARY)], check=True)
    print(f"{SOURCE.name} -> {LIBRARY.name}")
