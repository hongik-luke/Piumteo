package com.piumteo.server.global.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.piumteo.server.global.exception.ErrorCode;
import com.piumteo.server.global.response.ErrorResponse;
import com.piumteo.server.global.security.exception.SecurityErrorCode;
import com.piumteo.server.global.security.jwt.JwtAuthFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.actuate.health.HealthEndpoint;
import org.springframework.boot.actuate.autoconfigure.security.servlet.EndpointRequest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.Arrays;
import java.util.List;

@Configuration
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthFilter jwtAuthFilter;
    private final ObjectMapper objectMapper;

    @Value("${cors.allowed-origins:}")
    private String allowedOrigins;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .formLogin(form -> form.disable())
                .httpBasic(httpBasic -> httpBasic.disable())
                .sessionManagement(session -> session
                        .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                )
                .exceptionHandling(exception -> exception
                        .authenticationEntryPoint((request, response, authException) ->
                                writeErrorResponse(response, SecurityErrorCode.UNAUTHORIZED)
                        )
                        .accessDeniedHandler((request, response, accessDeniedException) ->
                                writeErrorResponse(response, SecurityErrorCode.ACCESS_DENIED)
                        )
                )
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                        .requestMatchers(EndpointRequest.to(HealthEndpoint.class)).permitAll()
                        .requestMatchers(
                                "/api/auth/signup",
                                "/api/auth/login",
                                "/api/auth/check-email",
                                "/api/auth/check-nickname",
                                "/actuator/health",
                                "/swagger-ui/**",
                                "/v3/api-docs/**"
                        ).permitAll()
                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/places/nearby",
                                "/api/places/bounds",
                                "/api/places/*/summary",
                                "/api/places/*/comments"
                        ).permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/places/*/comments/guest").permitAll()
                        .requestMatchers(HttpMethod.PATCH, "/api/places/*/comments/guest/*").permitAll()
                        .requestMatchers(HttpMethod.DELETE, "/api/places/*/comments/guest/*").permitAll()
                        .requestMatchers(HttpMethod.PUT, "/api/places/*/reaction/guest").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/places/*/comments/member").authenticated()
                        .requestMatchers(HttpMethod.PATCH, "/api/places/*/comments/member/*").authenticated()
                        .requestMatchers(HttpMethod.DELETE, "/api/places/*/comments/member/*").authenticated()
                        .requestMatchers(HttpMethod.PUT, "/api/places/*/reaction/member").authenticated()
                        .requestMatchers(HttpMethod.POST, "/api/places").authenticated()
                        .requestMatchers(HttpMethod.DELETE, "/api/places/*").authenticated()
                        .anyRequest().authenticated()
                )
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(parseAllowedOrigins());
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("Authorization", "Content-Type", "X-Guest-Key"));
        configuration.setAllowCredentials(false);
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    private List<String> parseAllowedOrigins() {
        return Arrays.stream(allowedOrigins.split(","))
                .map(String::trim)
                .filter(origin -> !origin.isBlank())
                .toList();
    }

    private void writeErrorResponse(
            jakarta.servlet.http.HttpServletResponse response,
            ErrorCode errorCode
    ) throws IOException {
        response.setStatus(errorCode.getHttpStatus().value());
        response.setCharacterEncoding(StandardCharsets.UTF_8.name());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.getWriter().write(
                objectMapper.writeValueAsString(ErrorResponse.of(errorCode))
        );
    }
}
