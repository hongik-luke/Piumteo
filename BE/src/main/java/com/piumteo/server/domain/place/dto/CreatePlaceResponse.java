package com.piumteo.server.domain.place.dto;

import com.piumteo.server.domain.place.entity.Place;
import com.piumteo.server.domain.place.entity.PlaceType;
import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "장소 등록 응답")
public record CreatePlaceResponse(
        @Schema(description = "등록된 장소 ID", example = "1")
        Long placeId,

        @Schema(description = "등록된 장소 이름", example = "와우산로 버스정류장 흡연부스")
        String placeName,

        @Schema(description = "등록된 장소 타입", example = "SMOKING_BOOTH")
        PlaceType placeType
) {

    public static CreatePlaceResponse from(Place place) {
        return new CreatePlaceResponse(
                place.getId(),
                place.getName(),
                place.getType()
        );
    }
}
