# Piumteo

Piumteo is a map-based smoking-place service. This repository is organized as a single project with separate frontend and backend folders.

## Structure

```text
Piumteo/
  FE/      Frontend app
  BE/      Spring Boot backend
  docs/    Product, API, architecture, and QA documents
```

## Backend

The backend is a Spring Boot application using Java 17, Gradle, PostgreSQL, JPA, Flyway, Spring Security, JWT, and springdoc-openapi.

Run from the repository root:

```powershell
.\BE\gradlew.bat -p BE bootRun
```

Run backend tests:

```powershell
.\BE\gradlew.bat -p BE test
```

Local secrets should stay out of Git. Use `BE/src/main/resources/application-local.yml` locally and provide values such as `JWT_SECRET_KEY` through environment variables or local config.

## Frontend

The frontend lives in `FE`.

## Docs

Project documentation starts at `docs/README.md`.
