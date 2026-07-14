package com.piumteo.server.domain.auth.dto;

public record LoginResult(
        AuthResponse response,
        String accessToken
) {
}
