package com.piumteo.server.domain.place.dto;

import com.piumteo.server.domain.place.entity.Place;
import com.piumteo.server.domain.place.entity.PlaceType;
import com.piumteo.server.domain.reaction.entity.ReactionType;
import io.swagger.v3.oas.annotations.media.Schema;

import java.math.BigDecimal;

@Schema(description = "장소 상세 요약 응답")
public record PlaceDetailResponse(
        @Schema(description = "장소 ID", example = "1")
        Long placeId,

        @Schema(description = "장소 이름", example = "와우산로 버스정류장 흡연부스")
        String placeName,

        @Schema(description = "장소 타입", example = "SMOKING_BOOTH")
        PlaceType placeType,

        @Schema(description = "장소 위도", example = "37.5512345")
        BigDecimal latitude,

        @Schema(description = "장소 경도", example = "126.9234567")
        BigDecimal longitude,

        @Schema(description = "위치 설명", example = "버스정류장 옆 공식 흡연부스.")
        String locationDescription,

        @Schema(description = "좋아요 수. CANCELED는 제외합니다.", example = "32")
        long likeCount,

        @Schema(description = "싫어요 수. CANCELED는 제외합니다.", example = "1")
        long dislikeCount,

        @Schema(description = "삭제되지 않은 댓글 수", example = "3")
        long commentCount,

        @Schema(description = "장소 상세 요약 조회수", example = "128")
        long viewCount,

        @Schema(description = "현재 시간대 내 사용자의 반응 상태", example = "LIKE")
        ReactionType myReactionType,

        @Schema(description = "현재 사용자가 장소 등록자인지 여부", example = "false")
        boolean isOwner
) {

    public static PlaceDetailResponse of(
            Place place,
            long likeCount,
            long dislikeCount,
            long commentCount,
            long viewCount,
            ReactionType myReactionType,
            boolean isOwner
    ) {
        return new PlaceDetailResponse(
                place.getId(),
                place.getName(),
                place.getType(),
                place.getLatitude(),
                place.getLongitude(),
                place.getLocationDescription(),
                likeCount,
                dislikeCount,
                commentCount,
                viewCount,
                myReactionType,
                isOwner
        );
    }
}
