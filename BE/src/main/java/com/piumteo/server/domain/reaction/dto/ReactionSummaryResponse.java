package com.piumteo.server.domain.reaction.dto;

import com.piumteo.server.domain.reaction.entity.ReactionType;
import io.swagger.v3.oas.annotations.media.Schema;

import java.time.OffsetDateTime;

@Schema(description = "장소 반응 처리 응답")
public record ReactionSummaryResponse(
        @Schema(description = "장소 ID", example = "1")
        Long placeId,

        @Schema(description = "좋아요 수. CANCELED는 제외합니다.", example = "32")
        long likeCount,

        @Schema(description = "싫어요 수. CANCELED는 제외합니다.", example = "1")
        long dislikeCount,

        @Schema(description = "처리 후 현재 시간대 내 사용자의 반응 상태", example = "LIKE")
        ReactionType myReactionType,

        @Schema(description = "현재 반응 시간 구간 키", example = "495836")
        long reactionHourKey,

        @Schema(description = "다음 시간대 시작 시각", example = "2026-07-01T15:00:00+09:00")
        OffsetDateTime nextReactionAvailableAt
) {

    public static ReactionSummaryResponse of(
            Long placeId,
            long likeCount,
            long dislikeCount,
            ReactionType myReactionType,
            long reactionHourKey,
            OffsetDateTime nextReactionAvailableAt
    ) {
        return new ReactionSummaryResponse(
                placeId,
                likeCount,
                dislikeCount,
                myReactionType,
                reactionHourKey,
                nextReactionAvailableAt
        );
    }
}
