package com.piumteo.server.global.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityScheme;
import io.swagger.v3.oas.models.servers.Server;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
public class SwaggerConfig {

    @Bean
    public OpenAPI piumteoOpenAPI() {
        return new OpenAPI()
                .components(new Components()
                        .addSecuritySchemes(
                                "bearerAuth",
                                new SecurityScheme()
                                        .type(SecurityScheme.Type.HTTP)
                                        .scheme("bearer")
                                        .bearerFormat("JWT")
                                        .description("JWT Access Token을 입력합니다. 예: Bearer {accessToken}")
                        ))
                .info(new Info()
                        .title("피움터 API")
                        .description("흡연구역, 금연구역, 댓글, 반응 정보를 제공하는 피움터 서버 API 문서입니다.")
                        .version("v1"))
                .servers(List.of(
                        new Server()
                                .url("http://localhost:8080")
                                .description("Local 개발 서버")
                ));
    }
}
