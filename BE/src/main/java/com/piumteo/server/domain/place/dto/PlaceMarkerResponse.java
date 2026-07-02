package com.piumteo.server.domain.place.dto;

import com.piumteo.server.domain.place.entity.PlaceType;
import com.piumteo.server.domain.place.repository.PlaceMarkerProjection;
import io.swagger.v3.oas.annotations.media.Schema;

import java.math.BigDecimal;

@Schema(description = "지도 마커용 장소 응답")
public record PlaceMarkerResponse(
        @Schema(description = "장소 ID", example = "1")
        Long placeId,

        @Schema(description = "장소 이름", example = "와우산로 버스정류장 흡연부스")
        String placeName,

        @Schema(description = "장소 타입", example = "SMOKING_BOOTH")
        PlaceType placeType,

        @Schema(description = "장소 위도", example = "37.5512345")
        BigDecimal latitude,

        @Schema(description = "장소 경도", example = "126.9234567")
        BigDecimal longitude
) {

    public static PlaceMarkerResponse from(PlaceMarkerProjection projection) {
        return new PlaceMarkerResponse(
                projection.getPlaceId(),
                projection.getPlaceName(),
                PlaceType.valueOf(projection.getPlaceType()),
                projection.getLatitude(),
                projection.getLongitude()
        );
    }
}
