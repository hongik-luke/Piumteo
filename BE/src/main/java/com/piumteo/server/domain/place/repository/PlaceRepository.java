package com.piumteo.server.domain.place.repository;

import com.piumteo.server.domain.place.entity.Place;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

public interface PlaceRepository extends JpaRepository<Place, Long> {

    Optional<Place> findByIdAndDeletedAtIsNull(Long id);

    List<Place> findByDeletedAtIsNullAndLatitudeBetweenAndLongitudeBetween(
            BigDecimal minLatitude,
            BigDecimal maxLatitude,
            BigDecimal minLongitude,
            BigDecimal maxLongitude
    );

    @Query(value = """
            SELECT p.place_id AS "placeId",
                   p.place_name AS "placeName",
                   p.place_type AS "placeType",
                   p.latitude AS "latitude",
                   p.longitude AS "longitude"
            FROM places p
            WHERE p.deleted_at IS NULL
              AND ST_DWithin(
                    CAST(ST_SetSRID(
                        ST_MakePoint(
                            CAST(p.longitude AS double precision),
                            CAST(p.latitude AS double precision)
                        ),
                        4326
                    ) AS geography),
                    CAST(ST_SetSRID(
                        ST_MakePoint(
                            CAST(:longitude AS double precision),
                            CAST(:latitude AS double precision)
                        ),
                        4326
                    ) AS geography),
                    :radiusMeters
              )
            ORDER BY ST_DistanceSphere(
                    ST_SetSRID(
                        ST_MakePoint(
                            CAST(p.longitude AS double precision),
                            CAST(p.latitude AS double precision)
                        ),
                        4326
                    ),
                    ST_SetSRID(
                        ST_MakePoint(
                            CAST(:longitude AS double precision),
                            CAST(:latitude AS double precision)
                        ),
                        4326
                    )
              ) ASC,
              p.place_id DESC
            LIMIT :limit
            """, nativeQuery = true)
    List<PlaceMarkerProjection> findNearbyMarkers(
            @Param("latitude") BigDecimal latitude,
            @Param("longitude") BigDecimal longitude,
            @Param("radiusMeters") int radiusMeters,
            @Param("limit") int limit
    );

    @Query(value = """
            SELECT p.place_id AS "placeId",
                   p.place_name AS "placeName",
                   p.place_type AS "placeType",
                   p.latitude AS "latitude",
                   p.longitude AS "longitude"
            FROM places p
            WHERE p.deleted_at IS NULL
              AND ST_Intersects(
                    ST_SetSRID(
                        ST_MakePoint(
                            CAST(p.longitude AS double precision),
                            CAST(p.latitude AS double precision)
                        ),
                        4326
                    ),
                    ST_MakeEnvelope(
                        CAST(:minLongitude AS double precision),
                        CAST(:minLatitude AS double precision),
                        CAST(:maxLongitude AS double precision),
                        CAST(:maxLatitude AS double precision),
                        4326
                    )
              )
            ORDER BY p.view_count DESC,
                     p.created_at DESC,
                     p.place_id DESC
            LIMIT :limit
            """, nativeQuery = true)
    List<PlaceMarkerProjection> findMarkersInBounds(
            @Param("minLatitude") BigDecimal minLatitude,
            @Param("maxLatitude") BigDecimal maxLatitude,
            @Param("minLongitude") BigDecimal minLongitude,
            @Param("maxLongitude") BigDecimal maxLongitude,
            @Param("limit") int limit
    );

    @Modifying(flushAutomatically = true)
    @Query("""
            UPDATE Place p
            SET p.viewCount = p.viewCount + 1
            WHERE p.id = :placeId
              AND p.deletedAt IS NULL
            """)
    int incrementViewCount(@Param("placeId") Long placeId);

    @Query("""
            SELECT p.viewCount
            FROM Place p
            WHERE p.id = :placeId
              AND p.deletedAt IS NULL
            """)
    Optional<Long> findViewCountByIdAndDeletedAtIsNull(@Param("placeId") Long placeId);
}
