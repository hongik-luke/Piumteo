package com.piumteo.server.domain.reaction.exception;

import com.piumteo.server.global.exception.ErrorCode;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;

@Getter
@RequiredArgsConstructor
public enum ReactionCode implements ErrorCode {

    PLACE_REACTION_UPDATE_SUCCESS(
            HttpStatus.OK,
            "REACTION_200_001",
            "장소 반응 처리에 성공했습니다."
    );

    private final HttpStatus httpStatus;
    private final String code;
    private final String message;
}
