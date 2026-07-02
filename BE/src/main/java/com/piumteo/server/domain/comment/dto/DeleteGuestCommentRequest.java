package com.piumteo.server.domain.comment.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

@Schema(description = "비회원 댓글 삭제 요청")
public record DeleteGuestCommentRequest(

        @Schema(description = "댓글 작성 시 입력했던 비회원 비밀번호", example = "1234", format = "password")
        @NotBlank(message = "게스트 비밀번호는 필수입니다.")
        @Size(min = 4, max = 50, message = "게스트 비밀번호는 4자 이상 50자 이하여야 합니다.")
        String guestPassword
) {
}
