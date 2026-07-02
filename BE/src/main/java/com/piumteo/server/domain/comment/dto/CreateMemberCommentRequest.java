package com.piumteo.server.domain.comment.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

@Schema(description = "회원 댓글 작성 요청")
public record CreateMemberCommentRequest(

        @Schema(description = "댓글 내용", example = "이 장소는 접근성이 좋아요.")
        @NotBlank(message = "댓글 내용은 필수입니다.")
        @Size(max = 500, message = "댓글은 500자 이하여야 합니다.")
        String content
) {
}
