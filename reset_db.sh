#!/bin/bash
set -e

DB_SERVICE="bdc_db"
DB_NAME="bdc_db"
DB_USER="bdc_user"
DB_PASSWORD="bdc_password"
SQL_FILE="exportBDC.sql"
CONTAINER_PATH="/tmp/${SQL_FILE}"

if [ ! -f "${SQL_FILE}" ]; then
  echo " Fichier ${SQL_FILE} introuvable"
  exit 1
fi

echo "Début de la réinitialisation de la base PostgreSQL..."

# Vérifie que le conteneur est en cours d’exécution
if ! sudo docker compose ps --services --filter "status=running" | grep -q "^${DB_SERVICE}$"; then
  echo "Le service ${DB_SERVICE} n'est pas en cours d'exécution. Démarrage..."
  sudo docker compose up -d ${DB_SERVICE}
  sleep 5
fi

echo "Copie du fichier ${SQL_FILE} dans le conteneur..."
sudo docker compose cp "${SQL_FILE}" "${DB_SERVICE}:${CONTAINER_PATH}"

echo "Suppression et recréation de la base ${DB_NAME}..."
sudo docker compose exec -T ${DB_SERVICE} bash -c "
  export PGPASSWORD=${DB_PASSWORD};
  psql -U ${DB_USER} -d postgres -c 'DROP DATABASE IF EXISTS ${DB_NAME};';
  psql -U ${DB_USER} -d postgres -c 'CREATE DATABASE ${DB_NAME};';
"

echo "Import du fichier ${SQL_FILE} dans ${DB_NAME}..."
sudo docker compose exec -T ${DB_SERVICE} bash -c "
  export PGPASSWORD=${DB_PASSWORD};
  psql -U ${DB_USER} -d ${DB_NAME} < ${CONTAINER_PATH};
"

echo "✅ Base ${DB_NAME} recréée et importée avec succès."