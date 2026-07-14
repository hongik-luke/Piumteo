FROM eclipse-temurin:17-jre

WORKDIR /app

RUN groupadd --system piumteo \
    && useradd --system --gid piumteo --home-dir /app --shell /usr/sbin/nologin piumteo

COPY --chown=piumteo:piumteo build/libs/*.jar app.jar

EXPOSE 8080

USER piumteo

ENTRYPOINT ["java", "-jar", "app.jar"]
