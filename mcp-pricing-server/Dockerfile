FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app

# Install the fully pinned dependency set. requirements.txt is generated
# from pyproject.toml with:
#   uv pip compile pyproject.toml --python-version 3.12 --universal -o requirements.txt
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8001
CMD ["python", "server.py"]
