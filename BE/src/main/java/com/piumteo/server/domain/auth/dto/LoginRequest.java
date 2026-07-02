package com.piumteo.server.domain.auth.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

@Schema(description = "로그인 요청")
public record LoginRequest(

        @Schema(description = "가입한 이메일", example = "luke0985@naver.com")
        @NotBlank(message = "Email is required.")
        @Email(message = "Email format is invalid.")
        @Size(max = 320, message = "Email must be 320 characters or less.")
        String email,

        @Schema(description = "가입 시 사용한 비밀번호", example = "luke0824", format = "password")
        @NotBlank(message = "Password is required.")
        @Size(max = 72, message = "Password must be 72 characters or less.")
        String password
) {
}
