package com.piumteo.server.domain.place.exception;

import com.piumteo.server.global.exception.ErrorCode;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;

@Getter
@RequiredArgsConstructor
public enum PlaceCode implements ErrorCode {

    PLACE_SUMMARY_SEARCH_SUCCESS(
            HttpStatus.OK,
            "PLACE_200_001",
            "장소 상세 요약 조회에 성공했습니다."
    ),

    PLACE_MARKER_SEARCH_SUCCESS(
            HttpStatus.OK,
            "PLACE_200_003",
            "장소 마커 조회에 성공했습니다."
    ),

    PLACE_DELETE_SUCCESS(
            HttpStatus.OK,
            "PLACE_200_002",
            "장소 삭제에 성공했습니다."
    ),

    PLACE_CREATE_SUCCESS(
            HttpStatus.CREATED,
            "PLACE_201_001",
            "장소 등록에 성공했습니다."
    );

    private final HttpStatus httpStatus;
    private final String code;
    private final String message;
}
