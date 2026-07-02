package com.piumteo.server.domain.reaction.repository;

import com.piumteo.server.domain.reaction.entity.PlaceReaction;
import com.piumteo.server.domain.reaction.entity.ReactionType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface PlaceReactionRepository extends JpaRepository<PlaceReaction, Long> {

    Optional<PlaceReaction> findByPlace_IdAndMember_IdAndReactionHourKey(
            Long placeId,
            Long memberId,
            Long reactionHourKey
    );

    Optional<PlaceReaction> findByPlace_IdAndGuestKeyHashAndReactionHourKey(
            Long placeId,
            String guestKeyHash,
            Long reactionHourKey
    );

    long countByPlace_IdAndReactionType(
            Long placeId,
            ReactionType reactionType
    );

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("""
            DELETE FROM PlaceReaction r
            WHERE r.place.id = :placeId
            """)
    int deleteByPlaceId(@Param("placeId") Long placeId);
}
