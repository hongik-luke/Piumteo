package com.piumteo.server.domain.place.service;

import com.piumteo.server.domain.comment.repository.PlaceCommentRepository;
import com.piumteo.server.domain.place.dto.BoundsRequest;
import com.piumteo.server.domain.place.dto.CreatePlaceRequest;
import com.piumteo.server.domain.place.dto.CreatePlaceResponse;
import com.piumteo.server.domain.place.dto.PlaceDetailResponse;
import com.piumteo.server.domain.place.dto.PlaceMarkerResponse;
import com.piumteo.server.domain.place.dto.PlaceSummaryResponse;
import com.piumteo.server.domain.place.entity.Place;
import com.piumteo.server.domain.place.exception.PlaceErrorCode;
import com.piumteo.server.domain.place.repository.PlaceRepository;
import com.piumteo.server.domain.reaction.entity.ReactionType;
import com.piumteo.server.domain.reaction.repository.PlaceReactionRepository;
import com.piumteo.server.domain.user.entity.User;
import com.piumteo.server.domain.user.service.UserService;
import com.piumteo.server.global.exception.BusinessException;
import com.piumteo.server.global.exception.ErrorCode;
import com.piumteo.server.global.util.HashUtils;
import com.piumteo.server.global.util.TimeUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Objects;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PlaceService {

    private static final int NEARBY_RADIUS_METERS = 1000;
    private static final int MARKER_SEARCH_LIMIT = 100;
    private static final BigDecimal MIN_LATITUDE = BigDecimal.valueOf(-90);
    private static final BigDecimal MAX_LATITUDE = BigDecimal.valueOf(90);
    private static final BigDecimal MIN_LONGITUDE = BigDecimal.valueOf(-180);
    private static final BigDecimal MAX_LONGITUDE = BigDecimal.valueOf(180);

    private final PlaceRepository placeRepository;
    private final UserService userService;
    private final PlaceReactionRepository placeReactionRepository;
    private final PlaceCommentRepository placeCommentRepository;

    @Transactional
    public CreatePlaceResponse createPlace(
            Long userId,
            CreatePlaceRequest request
    ) {
        User user = userService.getActiveUser(userId);

        Place place = new Place(
                user,
                request.placeName(),
                request.placeType(),
                request.latitude(),
                request.longitude(),
                request.locationDescription()
        );

        Place savedPlace = placeRepository.save(place);

        return CreatePlaceResponse.from(savedPlace);
    }

    public List<PlaceSummaryResponse> getPlacesInBounds(BoundsRequest request) {
        validateBounds(request);

        return placeRepository
                .findByDeletedAtIsNullAndLatitudeBetweenAndLongitudeBetween(
                        request.minLatitude(),
                        request.maxLatitude(),
                        request.minLongitude(),
                        request.maxLongitude()
                )
                .stream()
                .map(PlaceSummaryResponse::from)
                .toList();
    }

    public List<PlaceMarkerResponse> getNearbyPlaceMarkers(
            BigDecimal latitude,
            BigDecimal longitude
    ) {
        validateLatitude(latitude);
        validateLongitude(longitude);

        return placeRepository.findNearbyMarkers(
                        latitude,
                        longitude,
                        NEARBY_RADIUS_METERS,
                        MARKER_SEARCH_LIMIT
                )
                .stream()
                .map(PlaceMarkerResponse::from)
                .toList();
    }

    public List<PlaceMarkerResponse> getPlaceMarkersInBounds(BoundsRequest request) {
        validateBounds(request);

        return placeRepository.findMarkersInBounds(
                        request.minLatitude(),
                        request.maxLatitude(),
                        request.minLongitude(),
                        request.maxLongitude(),
                        MARKER_SEARCH_LIMIT
                )
                .stream()
                .map(PlaceMarkerResponse::from)
                .toList();
    }

    @Transactional
    public void deletePlace(
            Long placeId,
            Long currentUserId
    ) {
        Place place = getActivePlace(placeId);

        if (!isOwner(place, currentUserId)) {
            throw new BusinessException(PlaceErrorCode.UNAUTHORIZED_PLACE_DELETE);
        }

        placeCommentRepository.deleteByPlaceId(placeId);
        placeReactionRepository.deleteByPlaceId(placeId);
        placeRepository.deleteById(placeId);
    }

    @Transactional
    public PlaceDetailResponse getPlaceDetail(
            Long placeId,
            Long currentUserId,
            String guestKey
    ) {
        Place place = getActivePlace(placeId);
        int updatedRows = placeRepository.incrementViewCount(placeId);
        if (updatedRows == 0) {
            throw new BusinessException(ErrorCode.PLACE_NOT_FOUND);
        }

        long viewCount = placeRepository.findViewCountByIdAndDeletedAtIsNull(placeId)
                .orElseThrow(() -> new BusinessException(ErrorCode.PLACE_NOT_FOUND));

        long likeCount = placeReactionRepository.countByPlace_IdAndReactionType(
                placeId,
                ReactionType.LIKE
        );

        long dislikeCount = placeReactionRepository.countByPlace_IdAndReactionType(
                placeId,
                ReactionType.DISLIKE
        );

        long commentCount = placeCommentRepository.countByPlace_IdAndDeletedAtIsNull(placeId);
        long reactionHourKey = TimeUtils.currentHourKey();
        ReactionType myReactionType = findMyReactionType(
                placeId,
                currentUserId,
                guestKey,
                reactionHourKey
        );

        return PlaceDetailResponse.of(
                place,
                likeCount,
                dislikeCount,
                commentCount,
                viewCount,
                myReactionType,
                isOwner(place, currentUserId)
        );
    }

    public Place getActivePlace(Long placeId) {
        return placeRepository.findByIdAndDeletedAtIsNull(placeId)
                .orElseThrow(() -> new BusinessException(ErrorCode.PLACE_NOT_FOUND));
    }

    private void validateBounds(BoundsRequest request) {
        validateLatitude(request.minLatitude());
        validateLatitude(request.maxLatitude());
        validateLongitude(request.minLongitude());
        validateLongitude(request.maxLongitude());

        if (isGreaterThan(request.minLatitude(), request.maxLatitude())) {
            throw new BusinessException(
                    ErrorCode.INVALID_BOUNDS,
                    "최소 위도는 최대 위도보다 클 수 없습니다."
            );
        }

        if (isGreaterThan(request.minLongitude(), request.maxLongitude())) {
            throw new BusinessException(
                    ErrorCode.INVALID_BOUNDS,
                    "최소 경도는 최대 경도보다 클 수 없습니다."
            );
        }
    }

    private void validateLatitude(BigDecimal latitude) {
        if (latitude == null
                || latitude.compareTo(MIN_LATITUDE) < 0
                || latitude.compareTo(MAX_LATITUDE) > 0) {
            throw new BusinessException(ErrorCode.INVALID_PLACE_COORDINATE);
        }
    }

    private void validateLongitude(BigDecimal longitude) {
        if (longitude == null
                || longitude.compareTo(MIN_LONGITUDE) < 0
                || longitude.compareTo(MAX_LONGITUDE) > 0) {
            throw new BusinessException(ErrorCode.INVALID_PLACE_COORDINATE);
        }
    }

    private boolean isGreaterThan(BigDecimal left, BigDecimal right) {
        return left.compareTo(right) > 0;
    }

    private boolean isOwner(
            Place place,
            Long currentUserId
    ) {
        return currentUserId != null
                && Objects.equals(place.getCreatedBy().getId(), currentUserId);
    }

    private ReactionType findMyReactionType(
            Long placeId,
            Long currentUserId,
            String guestKey,
            long reactionHourKey
    ) {
        if (currentUserId != null) {
            return placeReactionRepository
                    .findByPlace_IdAndMember_IdAndReactionHourKey(
                            placeId,
                            currentUserId,
                            reactionHourKey
                    )
                    .map(reaction -> reaction.getReactionType())
                    .orElse(ReactionType.CANCELED);
        }

        if (guestKey != null && !guestKey.isBlank()) {
            return placeReactionRepository
                    .findByPlace_IdAndGuestKeyHashAndReactionHourKey(
                            placeId,
                            HashUtils.sha256(guestKey),
                            reactionHourKey
                    )
                    .map(reaction -> reaction.getReactionType())
                    .orElse(ReactionType.CANCELED);
        }

        return ReactionType.CANCELED;
    }
}
