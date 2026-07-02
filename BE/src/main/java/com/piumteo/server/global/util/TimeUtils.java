package com.piumteo.server.global.util;

import java.time.Instant;
import java.time.OffsetDateTime;
import java.time.ZoneId;

public final class TimeUtils {

    private TimeUtils() {
    }

    public static long currentHourKey() {
        return Instant.now().getEpochSecond() / 3600;
    }

    public static OffsetDateTime nextHourStartAt(long hourKey) {
        return Instant.ofEpochSecond((hourKey + 1) * 3600)
                .atZone(ZoneId.systemDefault())
                .toOffsetDateTime();
    }
}
