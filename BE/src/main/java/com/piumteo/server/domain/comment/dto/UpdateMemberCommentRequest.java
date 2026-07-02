package com.piumteo.server.domain.comment.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

@Schema(description = "회원 댓글 수정 요청")
public record UpdateMemberCommentRequest(

        @Schema(description = "수정할 댓글 내용", example = "내용을 수정합니다.")
        @NotBlank(message = "댓글 내용은 필수입니다.")
        @Size(max = 500, message = "댓글은 500자 이하여야 합니다.")
        String content
) {
}
