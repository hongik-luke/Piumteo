package com.piumteo.server.domain.auth.exception;

import com.piumteo.server.global.exception.ErrorCode;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;

@Getter
@RequiredArgsConstructor
public enum AuthCode implements ErrorCode {

    SIGNUP_SUCCESS(
            HttpStatus.CREATED,
            "AUTH_201_001",
            "Signup succeeded."
    ),

    LOGIN_SUCCESS(
            HttpStatus.OK,
            "AUTH_200_001",
            "Login succeeded."
    ),

    DUPLICATE_CHECK_SUCCESS(
            HttpStatus.OK,
            "AUTH_200_002",
            "Duplicate check succeeded."
    );

    private final HttpStatus httpStatus;
    private final String code;
    private final String message;
}
