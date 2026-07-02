package com.piumteo.server.domain.reaction.dto;

import com.piumteo.server.domain.reaction.entity.ReactionType;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;

@Schema(description = "장소 반응 처리 요청")
public record ReactPlaceRequest(

        @Schema(description = "사용자가 누른 반응 타입", example = "LIKE")
        @NotNull(message = "반응 타입은 필수입니다.")
        ReactionType reactionType
) {
}
