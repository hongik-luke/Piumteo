package com.piumteo.server.global.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityScheme.In;
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
                                "cookieAuth",
                                new SecurityScheme()
                                        .type(SecurityScheme.Type.APIKEY)
                                        .in(In.COOKIE)
                                        .name("accessToken")
                                        .description("로그인 성공 시 발급되는 HttpOnly accessToken Cookie를 사용합니다.")
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
