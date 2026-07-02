package com.piumteo.server.domain.place.repository;

import java.math.BigDecimal;

public interface PlaceMarkerProjection {

    Long getPlaceId();

    String getPlaceName();

    String getPlaceType();

    BigDecimal getLatitude();

    BigDecimal getLongitude();
}
