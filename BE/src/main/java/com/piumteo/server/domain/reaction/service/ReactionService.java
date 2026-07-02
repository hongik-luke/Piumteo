package com.piumteo.server.domain.reaction.service;

import com.piumteo.server.domain.place.entity.Place;
import com.piumteo.server.domain.place.service.PlaceService;
import com.piumteo.server.domain.reaction.dto.ReactPlaceRequest;
import com.piumteo.server.domain.reaction.dto.ReactionSummaryResponse;
import com.piumteo.server.domain.reaction.entity.PlaceReaction;
import com.piumteo.server.domain.reaction.entity.ReactionType;
import com.piumteo.server.domain.reaction.exception.ReactionErrorCode;
import com.piumteo.server.domain.reaction.exception.ReactionException;
import com.piumteo.server.domain.reaction.repository.PlaceReactionRepository;
import com.piumteo.server.domain.user.entity.User;
import com.piumteo.server.domain.user.service.UserService;
import com.piumteo.server.global.util.HashUtils;
import com.piumteo.server.global.util.TimeUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ReactionService {

    private final PlaceReactionRepository placeReactionRepository;
    private final PlaceService placeService;
    private final UserService userService;

    @Transactional
    public ReactionSummaryResponse reactAsMember(
            Long placeId,
            Long userId,
            ReactPlaceRequest request
    ) {
        validateReactionType(request.reactionType());

        Place place = placeService.getActivePlace(placeId);
        User user = userService.getActiveUser(userId);
        long currentHourKey = TimeUtils.currentHourKey();

        Optional<PlaceReaction> optionalReaction =
                placeReactionRepository.findByPlace_IdAndMember_IdAndReactionHourKey(
                        placeId,
                        userId,
                        currentHourKey
                );

        ReactionType myReactionType = applyReaction(
                optionalReaction,
                place,
                user,
                null,
                request.reactionType(),
                currentHourKey
        );

        return getReactionSummary(placeId, myReactionType, currentHourKey);
    }

    @Transactional
    public ReactionSummaryResponse reactAsGuest(
            Long placeId,
            String guestKey,
            ReactPlaceRequest request
    ) {
        validateReactionType(request.reactionType());
        validateGuestKey(guestKey);

        Place place = placeService.getActivePlace(placeId);
        String guestKeyHash = HashUtils.sha256(guestKey);
        long currentHourKey = TimeUtils.currentHourKey();

        Optional<PlaceReaction> optionalReaction =
                placeReactionRepository.findByPlace_IdAndGuestKeyHashAndReactionHourKey(
                        placeId,
                        guestKeyHash,
                        currentHourKey
                );

        ReactionType myReactionType = applyReaction(
                optionalReaction,
                place,
                null,
                guestKeyHash,
                request.reactionType(),
                currentHourKey
        );

        return getReactionSummary(placeId, myReactionType, currentHourKey);
    }

    public ReactionSummaryResponse getReactionSummary(
            Long placeId,
            ReactionType myReactionType,
            long reactionHourKey
    ) {
        long likeCount = placeReactionRepository.countByPlace_IdAndReactionType(
                placeId,
                ReactionType.LIKE
        );

        long dislikeCount = placeReactionRepository.countByPlace_IdAndReactionType(
                placeId,
                ReactionType.DISLIKE
        );

        return ReactionSummaryResponse.of(
                placeId,
                likeCount,
                dislikeCount,
                myReactionType,
                reactionHourKey,
                TimeUtils.nextHourStartAt(reactionHourKey)
        );
    }

    private ReactionType applyReaction(
            Optional<PlaceReaction> optionalReaction,
            Place place,
            User user,
            String guestKeyHash,
            ReactionType requestedType,
            long currentHourKey
    ) {
        if (optionalReaction.isPresent()) {
            PlaceReaction reaction = optionalReaction.get();
            ReactionType nextType = reaction.isSameReaction(requestedType)
                    ? ReactionType.CANCELED
                    : requestedType;

            reaction.changeReactionType(nextType);
            return nextType;
        }

        if (requestedType == ReactionType.CANCELED) {
            return ReactionType.CANCELED;
        }

        PlaceReaction reaction = user != null
                ? PlaceReaction.createMemberReaction(place, user, requestedType, currentHourKey)
                : PlaceReaction.createGuestReaction(place, guestKeyHash, requestedType, currentHourKey);

        try {
            placeReactionRepository.saveAndFlush(reaction);
        } catch (DataIntegrityViolationException exception) {
            throw new ReactionException(ReactionErrorCode.REACTION_TOO_FAST);
        }

        return requestedType;
    }

    private void validateReactionType(ReactionType reactionType) {
        if (reactionType == null) {
            throw new ReactionException(ReactionErrorCode.INVALID_REACTION_TYPE);
        }
    }

    private void validateGuestKey(String guestKey) {
        if (guestKey == null || guestKey.isBlank()) {
            throw new ReactionException(ReactionErrorCode.GUEST_KEY_REQUIRED);
        }
    }
}
