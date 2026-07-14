package com.piumteo.server.domain.auth.dto;

import com.piumteo.server.global.security.CustomUserDetails;
import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "현재 로그인한 회원 응답")
public record CurrentUserResponse(
        @Schema(description = "회원 ID", example = "1")
        Long userId,

        @Schema(description = "회원 닉네임", example = "luke")
        String nickname,

        @Schema(description = "회원 권한", example = "MEMBER")
        String userRole
) {

    public static CurrentUserResponse from(CustomUserDetails userDetails) {
        return new CurrentUserResponse(
                userDetails.getUserId(),
                userDetails.getNickname(),
                userDetails.getRole()
        );
    }
}
