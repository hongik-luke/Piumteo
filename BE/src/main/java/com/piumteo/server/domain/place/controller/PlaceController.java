package com.piumteo.server.domain.place.controller;

import com.piumteo.server.domain.place.dto.BoundsRequest;
import com.piumteo.server.domain.place.dto.CreatePlaceRequest;
import com.piumteo.server.domain.place.dto.CreatePlaceResponse;
import com.piumteo.server.domain.place.dto.PlaceDetailResponse;
import com.piumteo.server.domain.place.dto.PlaceMarkerResponse;
import com.piumteo.server.domain.place.exception.PlaceCode;
import com.piumteo.server.domain.place.service.PlaceService;
import com.piumteo.server.global.response.ApiResponse;
import com.piumteo.server.global.security.CurrentUser;
import com.piumteo.server.global.security.CustomUserDetails;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.enums.ParameterIn;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.util.List;

@Tag(
        name = "장소",
        description = "장소 조회, 등록, 삭제 관련 API"
)
@Validated
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/places")
public class PlaceController {

    private final PlaceService placeService;

    @Operation(
            summary = "현재 위치 기준 주변 장소 조회",
            description = """
                    현재 사용자 위치 기준 1km 반경 안의 장소 마커를 조회합니다.
                    
                    - 앱 첫 진입 또는 내 위치 버튼 클릭 시 호출합니다.
                    - PostGIS 거리 검색을 사용합니다.
                    - 삭제된 장소는 제외합니다.
                    - 최대 100개를 거리 가까운 순으로 응답합니다.
                    """
    )
    @GetMapping("/nearby")
    public ResponseEntity<ApiResponse<List<PlaceMarkerResponse>>> getNearbyPlaces(
            @Parameter(description = "현재 위치 위도", example = "37.5512345", required = true)
            @RequestParam("lat")
            @NotNull
            @DecimalMin("-90.0")
            @DecimalMax("90.0")
            BigDecimal latitude,

            @Parameter(description = "현재 위치 경도", example = "126.9234567", required = true)
            @RequestParam("lng")
            @NotNull
            @DecimalMin("-180.0")
            @DecimalMax("180.0")
            BigDecimal longitude
    ) {
        List<PlaceMarkerResponse> response = placeService.getNearbyPlaceMarkers(
                latitude,
                longitude
        );

        return markerSearchSuccess(response);
    }

    @Operation(
            summary = "지도 bounds 기준 장소 조회",
            description = """
                    현재 지도 화면의 좌표 범위 안에 포함되는 장소 마커를 조회합니다.
                    
                    - 지도 이동 또는 줌 변경 후 idle 이벤트에서 호출합니다.
                    - minLat, minLng, maxLat, maxLng는 현재 지도 화면의 끝 좌표입니다.
                    - PostGIS 영역 검색을 사용합니다.
                    - 삭제된 장소는 제외합니다.
                    - 최대 100개를 최신 등록순으로 응답합니다.
                    """
    )
    @GetMapping("/bounds")
    public ResponseEntity<ApiResponse<List<PlaceMarkerResponse>>> getPlacesInBounds(
            @Parameter(description = "지도 화면 최소 위도", example = "37.5400000", required = true)
            @RequestParam("minLat")
            @NotNull
            @DecimalMin("-90.0")
            @DecimalMax("90.0")
            BigDecimal minLat,

            @Parameter(description = "지도 화면 최소 경도", example = "126.9100000", required = true)
            @RequestParam("minLng")
            @NotNull
            @DecimalMin("-180.0")
            @DecimalMax("180.0")
            BigDecimal minLng,

            @Parameter(description = "지도 화면 최대 위도", example = "37.5600000", required = true)
            @RequestParam("maxLat")
            @NotNull
            @DecimalMin("-90.0")
            @DecimalMax("90.0")
            BigDecimal maxLat,

            @Parameter(description = "지도 화면 최대 경도", example = "126.9400000", required = true)
            @RequestParam("maxLng")
            @NotNull
            @DecimalMin("-180.0")
            @DecimalMax("180.0")
            BigDecimal maxLng
    ) {
        BoundsRequest request = new BoundsRequest(
                minLat,
                maxLat,
                minLng,
                maxLng
        );

        List<PlaceMarkerResponse> response = placeService.getPlaceMarkersInBounds(request);

        return markerSearchSuccess(response);
    }

    @Operation(
            summary = "장소 상세 요약 조회",
            description = """
                    마커 클릭 시 바텀시트에 표시할 장소 상세 요약 정보를 조회합니다.
                    
                    - 조회 성공 시 viewCount가 1 증가합니다.
                    - 로그인 사용자는 HttpOnly accessToken Cookie 기준으로 isOwner와 myReactionType을 계산합니다.
                    - 비회원은 X-Guest-Key가 있으면 현재 시간대 myReactionType을 계산합니다.
                    - accessToken Cookie와 X-Guest-Key가 모두 없으면 myReactionType은 CANCELED로 응답합니다.
                    """,
            security = @SecurityRequirement(name = "cookieAuth")
    )
    @GetMapping("/{placeId}/summary")
    public ResponseEntity<ApiResponse<PlaceDetailResponse>> getPlaceSummary(
            @Parameter(description = "요약 정보를 조회할 장소 ID", example = "1", required = true)
            @PathVariable @Positive Long placeId,

            @Parameter(hidden = true)
            @CurrentUser CustomUserDetails userDetails,

            @Parameter(
                    name = "X-Guest-Key",
                    description = "비회원 식별 키. 전달하면 현재 시간대 비회원 반응 상태를 응답합니다.",
                    example = "550e8400-e29b-41d4-a716-446655440000",
                    in = ParameterIn.HEADER
            )
            @RequestHeader(value = "X-Guest-Key", required = false) String guestKey
    ) {
        Long currentUserId = userDetails == null
                ? null
                : userDetails.getUserId();

        PlaceDetailResponse response = placeService.getPlaceDetail(
                placeId,
                currentUserId,
                guestKey
        );

        return ResponseEntity
                .status(PlaceCode.PLACE_SUMMARY_SEARCH_SUCCESS.getHttpStatus())
                .body(ApiResponse.onSuccess(
                        PlaceCode.PLACE_SUMMARY_SEARCH_SUCCESS,
                        response
                ));
    }

    @Operation(
            summary = "장소 등록",
            description = """
                    로그인한 회원이 지도 중앙 핀 좌표 기준으로 장소를 등록합니다.
                    
                    - HttpOnly accessToken Cookie가 필요합니다.
                    - 요청 본문에 작성자 ID를 받지 않습니다.
                    - 서버가 JWT에서 추출한 현재 사용자 ID를 등록자로 저장합니다.
                    - 요청 필드명은 placeName, placeType, latitude, longitude, locationDescription을 사용합니다.
                    """,
            security = @SecurityRequirement(name = "cookieAuth")
    )
    @PostMapping
    public ResponseEntity<ApiResponse<CreatePlaceResponse>> createPlace(
            @CurrentUser CustomUserDetails userDetails,
            @Valid @RequestBody CreatePlaceRequest request
    ) {
        CreatePlaceResponse response = placeService.createPlace(
                userDetails.getUserId(),
                request
        );

        return ResponseEntity
                .status(PlaceCode.PLACE_CREATE_SUCCESS.getHttpStatus())
                .body(ApiResponse.onSuccess(
                        PlaceCode.PLACE_CREATE_SUCCESS,
                        response
                ));
    }

    @Operation(
            summary = "장소 삭제",
            description = """
                    로그인한 회원이 본인이 등록한 장소를 삭제합니다.
                    
                    - HttpOnly accessToken Cookie가 필요합니다.
                    - 장소 등록자 본인만 삭제할 수 있습니다.
                    - 장소와 해당 장소의 댓글, 반응을 모두 hard delete합니다.
                    """,
            security = @SecurityRequirement(name = "cookieAuth")
    )
    @DeleteMapping("/{placeId}")
    public ResponseEntity<ApiResponse<Void>> deletePlace(
            @Parameter(description = "삭제할 장소 ID", example = "1", required = true)
            @PathVariable @Positive Long placeId,

            @CurrentUser CustomUserDetails userDetails
    ) {
        placeService.deletePlace(
                placeId,
                userDetails.getUserId()
        );

        return ResponseEntity
                .status(PlaceCode.PLACE_DELETE_SUCCESS.getHttpStatus())
                .body(ApiResponse.onSuccess(
                        PlaceCode.PLACE_DELETE_SUCCESS,
                        null
                ));
    }

    private ResponseEntity<ApiResponse<List<PlaceMarkerResponse>>> markerSearchSuccess(
            List<PlaceMarkerResponse> response
    ) {
        return ResponseEntity
                .status(PlaceCode.PLACE_MARKER_SEARCH_SUCCESS.getHttpStatus())
                .body(ApiResponse.onSuccess(
                        PlaceCode.PLACE_MARKER_SEARCH_SUCCESS,
                        response
                ));
    }
}
