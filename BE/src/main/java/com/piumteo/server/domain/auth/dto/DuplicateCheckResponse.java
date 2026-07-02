package com.piumteo.server.domain.auth.dto;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "중복 확인 응답")
public record DuplicateCheckResponse(
        @Schema(description = "true이면 이미 사용 중이고, false이면 사용 가능합니다.", example = "false")
        boolean duplicated
) {
}
