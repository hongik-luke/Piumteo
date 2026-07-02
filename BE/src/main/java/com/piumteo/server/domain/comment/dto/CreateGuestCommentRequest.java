package com.piumteo.server.domain.comment.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

@Schema(description = "비회원 댓글 작성 요청")
public record CreateGuestCommentRequest(

        @Schema(description = "댓글에 표시할 비회원 닉네임", example = "방문자")
        @NotBlank(message = "닉네임은 필수입니다.")
        @Size(max = 50, message = "닉네임은 50자 이하여야 합니다.")
        String displayNickname,

        @Schema(description = "비회원 댓글 수정/삭제에 사용할 비밀번호", example = "1234", format = "password")
        @NotBlank(message = "게스트 비밀번호는 필수입니다.")
        @Size(min = 4, max = 50, message = "게스트 비밀번호는 4자 이상 50자 이하여야 합니다.")
        String guestPassword,

        @Schema(description = "댓글 내용", example = "비회원으로 남기는 댓글입니다.")
        @NotBlank(message = "댓글 내용은 필수입니다.")
        @Size(max = 500, message = "댓글은 500자 이하여야 합니다.")
        String content
) {
}
