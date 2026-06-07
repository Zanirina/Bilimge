#!/usr/bin/env bash
set -o errexit

pip install -r requirements.txt

python manage.py collectstatic --no-input

python manage.py migrate --fake-initial

echo "from django.contrib.auth import get_user_model; U = get_user_model(); U.objects.filter(email='admin@bilimge.kz').exists() or U.objects.create_superuser('admin@bilimge.kz', 'Admin123!')" | python manage.py shell