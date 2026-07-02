package com.piumteo.server.domain.comment.dto;

import com.piumteo.server.domain.comment.entity.CommentAuthorType;
import com.piumteo.server.domain.comment.entity.PlaceComment;
import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "댓글 작성/수정 응답")
public record CommentMutationResponse(
        @Schema(description = "댓글 ID", example = "15")
        Long placeCommentId,

        @Schema(description = "댓글 작성자 유형", example = "MEMBER")
        CommentAuthorType commentAuthorType,

        @Schema(description = "댓글에 표시되는 닉네임", example = "luke")
        String displayNickname,

        @Schema(description = "댓글 내용", example = "이 장소는 접근성이 좋아요.")
        String content
) {

    public static CommentMutationResponse from(PlaceComment comment) {
        return new CommentMutationResponse(
                comment.getId(),
                comment.getAuthorType(),
                comment.getDisplayNickname(),
                comment.getContent()
        );
    }
}
