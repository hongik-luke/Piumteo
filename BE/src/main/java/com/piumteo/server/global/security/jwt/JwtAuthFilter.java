package com.piumteo.server.global.security.jwt;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.piumteo.server.global.exception.ErrorCode;
import com.piumteo.server.global.response.ErrorResponse;
import com.piumteo.server.global.security.CustomUserDetails;
import com.piumteo.server.global.security.CustomUserDetailsService;
import com.piumteo.server.global.security.exception.SecurityBusinessException;
import com.piumteo.server.global.security.exception.SecurityErrorCode;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.nio.charset.StandardCharsets;

@Component
@RequiredArgsConstructor
public class JwtAuthFilter extends OncePerRequestFilter {

    private static final String BEARER_PREFIX = "Bearer ";

    private final JwtUtil jwtUtil;
    private final CustomUserDetailsService userDetailsService;
    private final ObjectMapper objectMapper;

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        return HttpMethod.OPTIONS.matches(request.getMethod());
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {
        String token = resolveToken(request);

        if (token != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            boolean authenticated = authenticate(request, token);
            if (!authenticated) {
                if (isPermitAllRequest(request)) {
                    filterChain.doFilter(request, response);
                    return;
                }

                writeErrorResponse(response, SecurityErrorCode.INVALID_ACCESS_TOKEN);
                return;
            }
        }

        filterChain.doFilter(request, response);
    }

    private boolean authenticate(
            HttpServletRequest request,
            String token
    ) {
        if (!jwtUtil.isValid(token)) {
            SecurityContextHolder.clearContext();
            return false;
        }

        try {
            String email = jwtUtil.getEmail(token);
            CustomUserDetails userDetails = userDetailsService.loadUserByUsername(email);
            UsernamePasswordAuthenticationToken authentication =
                    new UsernamePasswordAuthenticationToken(
                            userDetails,
                            null,
                            userDetails.getAuthorities()
                    );

            authentication.setDetails(
                    new WebAuthenticationDetailsSource().buildDetails(request)
            );
            SecurityContextHolder.getContext().setAuthentication(authentication);
            return true;
        } catch (SecurityBusinessException exception) {
            SecurityContextHolder.clearContext();
            return false;
        }
    }

    private String resolveToken(HttpServletRequest request) {
        String authorization = request.getHeader(HttpHeaders.AUTHORIZATION);

        if (authorization == null || !authorization.startsWith(BEARER_PREFIX)) {
            return null;
        }

        return authorization.substring(BEARER_PREFIX.length());
    }

    private boolean isPermitAllRequest(HttpServletRequest request) {
        String method = request.getMethod();
        String path = request.getServletPath();

        if (path.equals("/api/auth/signup")
                || path.equals("/api/auth/login")
                || path.equals("/api/auth/check-email")
                || path.equals("/api/auth/check-nickname")
                || path.equals("/swagger-ui.html")
                || path.equals("/v3/api-docs")
                || path.startsWith("/swagger-ui/")
                || path.startsWith("/v3/api-docs/")) {
            return true;
        }

        if (HttpMethod.GET.matches(method)) {
            return path.equals("/api/places/nearby")
                    || path.equals("/api/places/bounds")
                    || path.matches("^/api/places/\\d+/summary$")
                    || path.matches("^/api/places/\\d+/comments$");
        }

        return path.matches("^/api/places/\\d+/comments/guest$")
                || path.matches("^/api/places/\\d+/comments/guest/\\d+$")
                || path.matches("^/api/places/\\d+/reaction/guest$");
    }

    private void writeErrorResponse(
            HttpServletResponse response,
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
