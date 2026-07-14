package com.piumteo.server.domain.auth.dto;

import com.piumteo.server.domain.user.entity.User;
import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "인증 응답")
public record AuthResponse(
        @Schema(description = "회원 ID", example = "1")
        Long userId,

        @Schema(description = "회원 이메일", example = "luke0985@naver.com")
        String email,

        @Schema(description = "회원 닉네임", example = "luke")
        String nickname,

        @Schema(description = "회원 권한", example = "MEMBER")
        String role
) {

    public static AuthResponse from(User user) {
        return new AuthResponse(
                user.getId(),
                user.getEmail(),
                user.getNickname(),
                user.getRole().name()
        );
    }
}
