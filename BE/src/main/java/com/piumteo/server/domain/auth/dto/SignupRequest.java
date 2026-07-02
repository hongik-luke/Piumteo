package com.piumteo.server.domain.auth.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

@Schema(description = "회원가입 요청")
public record SignupRequest(

        @Schema(description = "로그인에 사용할 이메일", example = "luke0985@naver.com")
        @NotBlank(message = "Email is required.")
        @Email(message = "Email format is invalid.")
        @Size(max = 320, message = "Email must be 320 characters or less.")
        String email,

        @Schema(description = "로그인에 사용할 비밀번호. BCrypt 특성상 72자 이하만 허용합니다.", example = "luke0824", format = "password")
        @NotBlank(message = "Password is required.")
        @Size(min = 8, max = 72, message = "Password must be 8 to 72 characters.")
        String password,

        @Schema(description = "서비스에 표시될 회원 닉네임", example = "luke")
        @NotBlank(message = "Nickname is required.")
        @Size(max = 50, message = "Nickname must be 50 characters or less.")
        String nickname
) {
}
