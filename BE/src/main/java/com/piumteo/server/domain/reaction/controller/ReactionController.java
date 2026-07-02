package com.piumteo.server.domain.reaction.controller;

import com.piumteo.server.domain.reaction.dto.ReactPlaceRequest;
import com.piumteo.server.domain.reaction.dto.ReactionSummaryResponse;
import com.piumteo.server.domain.reaction.exception.ReactionCode;
import com.piumteo.server.domain.reaction.service.ReactionService;
import com.piumteo.server.global.response.ApiResponse;
import com.piumteo.server.global.security.CurrentUser;
import com.piumteo.server.global.security.CustomUserDetails;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.enums.ParameterIn;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ExampleObject;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.parameters.RequestBody;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Positive;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Tag(
        name = "반응",
        description = "장소 좋아요, 싫어요, 취소 처리 API"
)
@Validated
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/places/{placeId}/reaction")
public class ReactionController {

    private final ReactionService reactionService;

    @Operation(
            summary = "회원 장소 좋아요/싫어요/취소 처리",
            description = """
                    로그인한 회원의 현재 시간대 반응을 기록하거나 변경합니다.
                    
                    - Authorization: Bearer {accessToken} 헤더가 필요합니다.
                    - 같은 시간대에 row가 없고 LIKE/DISLIKE를 보내면 새 반응을 생성합니다.
                    - 같은 시간대에 같은 반응을 다시 보내면 CANCELED로 변경합니다.
                    - 같은 시간대에 다른 반응을 보내면 요청한 반응으로 변경합니다.
                    - CANCELED는 likeCount/dislikeCount 집계에서 제외됩니다.
                    """,
            security = @SecurityRequirement(name = "bearerAuth"),
            requestBody = @RequestBody(
                    required = true,
                    content = @Content(
                            schema = @Schema(implementation = ReactPlaceRequest.class),
                            examples = @ExampleObject(
                                    name = "좋아요 요청",
                                    value = """
                                            {
                                              "reactionType": "LIKE"
                                            }
                                            """
                            )
                    )
            )
    )
    @PutMapping("/member")
    public ResponseEntity<ApiResponse<ReactionSummaryResponse>> reactPlaceAsMember(
            @Parameter(
                    description = "반응을 처리할 장소 ID",
                    example = "1",
                    required = true
            )
            @PathVariable @Positive Long placeId,

            @Parameter(hidden = true)
            @CurrentUser CustomUserDetails userDetails,

            @Valid @org.springframework.web.bind.annotation.RequestBody ReactPlaceRequest request
    ) {
        ReactionSummaryResponse response = reactionService.reactAsMember(
                placeId,
                userDetails.getUserId(),
                request
        );

        return success(response);
    }

    @Operation(
            summary = "비회원 장소 좋아요/싫어요/취소 처리",
            description = """
                    비회원의 현재 시간대 반응을 기록하거나 변경합니다.
                    
                    - X-Guest-Key 헤더가 필요합니다.
                    - 프론트에서 UUID를 생성해 localStorage 또는 cookie에 보관하고 매 요청마다 전달합니다.
                    - 서버는 X-Guest-Key 원문을 저장하지 않고 SHA-256 해시로 저장합니다.
                    - 같은 시간대에 row가 없고 LIKE/DISLIKE를 보내면 새 반응을 생성합니다.
                    - 같은 시간대에 같은 반응을 다시 보내면 CANCELED로 변경합니다.
                    - 같은 시간대에 다른 반응을 보내면 요청한 반응으로 변경합니다.
                    - CANCELED는 likeCount/dislikeCount 집계에서 제외됩니다.
                    """,
            requestBody = @RequestBody(
                    required = true,
                    content = @Content(
                            schema = @Schema(implementation = ReactPlaceRequest.class),
                            examples = @ExampleObject(
                                    name = "싫어요 요청",
                                    value = """
                                            {
                                              "reactionType": "DISLIKE"
                                            }
                                            """
                            )
                    )
            )
    )
    @PutMapping("/guest")
    public ResponseEntity<ApiResponse<ReactionSummaryResponse>> reactPlaceAsGuest(
            @Parameter(
                    description = "반응을 처리할 장소 ID",
                    example = "1",
                    required = true
            )
            @PathVariable @Positive Long placeId,

            @Parameter(
                    name = "X-Guest-Key",
                    description = "비회원 식별 키. 비회원 요청에서 필수입니다.",
                    example = "550e8400-e29b-41d4-a716-446655440000",
                    in = ParameterIn.HEADER,
                    required = true
            )
            @RequestHeader("X-Guest-Key") String guestKey,

            @Valid @org.springframework.web.bind.annotation.RequestBody ReactPlaceRequest request
    ) {
        ReactionSummaryResponse response = reactionService.reactAsGuest(
                placeId,
                guestKey,
                request
        );

        return success(response);
    }

    private ResponseEntity<ApiResponse<ReactionSummaryResponse>> success(
            ReactionSummaryResponse response
    ) {
        return ResponseEntity
                .status(ReactionCode.PLACE_REACTION_UPDATE_SUCCESS.getHttpStatus())
                .body(ApiResponse.onSuccess(
                        ReactionCode.PLACE_REACTION_UPDATE_SUCCESS,
                        response
                ));
    }
}
