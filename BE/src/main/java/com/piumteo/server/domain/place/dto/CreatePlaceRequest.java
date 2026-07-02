package com.piumteo.server.domain.place.dto;

import com.piumteo.server.domain.place.entity.PlaceType;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;

@Schema(description = "장소 등록 요청")
public record CreatePlaceRequest(

        @Schema(description = "장소 이름", example = "와우산로 버스정류장 흡연부스")
        @NotBlank(message = "장소 이름은 필수입니다.")
        @Size(max = 100, message = "장소 이름은 100자 이하여야 합니다.")
        String placeName,

        @Schema(description = "장소 타입", example = "SMOKING_BOOTH")
        @NotNull(message = "장소 타입은 필수입니다.")
        PlaceType placeType,

        @Schema(description = "장소 위도", example = "37.5512345")
        @NotNull(message = "위도는 필수입니다.")
        @DecimalMin(value = "-90.0", message = "위도는 -90 이상이어야 합니다.")
        @DecimalMax(value = "90.0", message = "위도는 90 이하여야 합니다.")
        BigDecimal latitude,

        @Schema(description = "장소 경도", example = "126.9234567")
        @NotNull(message = "경도는 필수입니다.")
        @DecimalMin(value = "-180.0", message = "경도는 -180 이상이어야 합니다.")
        @DecimalMax(value = "180.0", message = "경도는 180 이하여야 합니다.")
        BigDecimal longitude,

        @Schema(description = "위치 설명", example = "버스정류장 옆 공식 흡연부스. 지붕 있어 날씨 영향 없음.")
        @Size(max = 255, message = "위치 설명은 255자 이하여야 합니다.")
        String locationDescription
) {
}
