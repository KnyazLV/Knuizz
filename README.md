
# Knuizz — Учебный проект викторины

**Knuizz** — учебный full-stack проект, созданный для практики и демонстрации навыков в веб-разработке. Это простое приложение для создания и прохождения викторин, включающее в себя бэкенд на ASP.NET Core и фронтенд на React.

## Что умеет приложение?

*   **Играть в викторины**: Можно отвечать на вопросы из нескольких источников, включая "официальные" (с начислением рейтинга) и созданные другими пользователями.
*   **Создавать свои викторины**: После регистрации можно создавать собственные наборы вопросов и делиться ими.
*   **Соревноваться**: Есть простая система рейтинга и уровней, а также таблица лидеров для отслеживания прогресса.
*   **Управлять профилем**: Пользователи могут просматривать свою статистику и управлять созданными викторинами.

## Демо

Живое демо доступно по [данной ссылке](https://www.knuizz.knyaz.eu/)

## Галерея

![Poster1](./docs/posters/poster1.png)
![Poster2](./docs/posters/poster2.png)

## Технологии

### Backend (ASP.NET Core API)
*   **Фреймворк**: .NET 9, ASP.NET Core
*   **База данных**: PostgreSQL и Entity Framework Core
*   **Аутентификация**: JWT
*   **Тестирование**: NUnit для юнит-тестов
*   **API Документация**: Swagger + Redoc

### Frontend (React)
*   **Сборка**: Vite
*   **Фреймворк**: React
*   **Управление состоянием**: Redux Toolkit (с RTK Query)
*   **Стилизация**: Tailwind CSS и Radix UI
*   **Маршрутизация**: React Router
*   **Интернационализация**: i18next


## Quickstart (Docker Compose)

Этот способ запустит всё приложение (API, клиент, базу данных) в Docker-контейнерах.

### 1. Требования

*   [Docker](https://www.docker.com/) должен быть установлен и запущен.

### 2. Клонирование репозитория

```bash
git clone https://github.com/ваш-логин/knuizz.git
cd knuizz
```

### 3. Настройка переменных

Откройте файл `docker-compose.yml` и замените значения-плейсхолдеры в секции `environment` у сервиса `api`:

*   `POSTGRES_PASSWORD`: Пароль для базы данных.
*   `ConnectionStrings__DefaultConnection`: Убедитесь, что пароль здесь совпадает с `POSTGRES_PASSWORD`.
*   `Jwt__Key`: Сгенерируйте и вставьте длинный, случайный ключ (минимум 32 символа).
*   `Jwt__Issuer`: Идентификатор вашего API (например, `KnuizzApi`).
*   `Jwt__Audience`: Идентификатор вашего клиента (например, `KnuizzApiClient`).

### 4. Запуск

Выполните в корневой папке проекта:
```bash
docker-compose up --build
```
Первый запуск может занять некоторое время.

### 5. Доступ к приложению

*   **Веб-клиент:** `http://<адрес-вашего-хоста>:5173` (например, `http://localhost:5173`)
*   **Документация API:** `http://<адрес-вашего-хоста>:5130/swagger` (например, `http://localhost:5130/swagger`)


## Локальный запуск (Без Docker)

Этот способ требует ручной установки .NET, Node.js и PostgreSQL.

### 1. Запуск API (бэкенд)

*   **Настройте `user-secrets`** для проекта `Knuizz.Api`. Перейдите в папку `src/Knuizz.Api` и выполните следующие команды, подставив свои значения:
    ```bash
    dotnet user-secrets set "ConnectionStrings:DefaultConnection" "Host=localhost;Database=knuizz_db;Username=postgres;Password=YOUR_PASSWORD"
    dotnet user-secrets set "Jwt:Key" "YOUR_SUPER_SECRET_JWT_KEY_32_CHARS_LONG"
    dotnet user-secrets set "Jwt:Issuer" "KnuizzApi"
    dotnet user-secrets set "Jwt:Audience" "KnuizzApiClient"
    ```
*   **Примените миграции базы данных:**
    ```bash
    dotnet ef database update
    ```
*   **Запустите API:**
    ```bash
    dotnet run
    ```

### 2. Запуск клиента (фронтенд)

*   **Перейдите в папку клиента:**
    ```bash
    cd ../knuizz-web 
    ```
*   **Создайте файл `.env`** и добавьте в него адрес вашего API:
    ```
    VITE_API_URL=http://localhost:5130
    ```
*   **Установите зависимости и запустите:**
    ```bash
    npm install
    npm run dev
    ```