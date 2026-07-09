CREATE EXTENSION IF NOT EXISTS postgis;

CREATE TABLE users (
    user_id BIGSERIAL PRIMARY KEY,
    email VARCHAR(320) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    nickname VARCHAR(50) NOT NULL,
    user_role VARCHAR(20) NOT NULL,
    user_status VARCHAR(20) NOT NULL,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL,
    CONSTRAINT uk_users_email UNIQUE (email),
    CONSTRAINT uk_users_nickname UNIQUE (nickname),
    CONSTRAINT chk_users_role CHECK (user_role IN ('MEMBER', 'ADMIN')),
    CONSTRAINT chk_users_status CHECK (user_status IN ('ACTIVE', 'WITHDRAWN', 'BANNED'))
);

CREATE TABLE places (
    place_id BIGSERIAL PRIMARY KEY,
    created_by_user_id BIGINT NOT NULL,
    place_name VARCHAR(100) NOT NULL,
    place_type VARCHAR(30) NOT NULL,
    latitude NUMERIC(10, 7) NOT NULL,
    longitude NUMERIC(10, 7) NOT NULL,
    location GEOGRAPHY(Point, 4326),
    location_description VARCHAR(255),
    view_count BIGINT NOT NULL DEFAULT 0,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL,
    CONSTRAINT fk_places_created_by_user
        FOREIGN KEY (created_by_user_id) REFERENCES users (user_id),
    CONSTRAINT chk_places_type CHECK (
        place_type IN (
            'SMOKING_BOOTH',
            'SMOKING_AREA',
            'IMPLICIT_SMOKING_AREA',
            'NON_SMOKING_AREA'
        )
    )
);

CREATE OR REPLACE FUNCTION set_place_location()
RETURNS TRIGGER AS $$
BEGIN
    NEW.location := ST_SetSRID(
        ST_MakePoint(
            NEW.longitude::double precision,
            NEW.latitude::double precision
        ),
        4326
    )::geography;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_places_set_location
BEFORE INSERT OR UPDATE OF latitude, longitude
ON places
FOR EACH ROW
EXECUTE FUNCTION set_place_location();

CREATE TABLE place_comments (
    place_comment_id BIGSERIAL PRIMARY KEY,
    place_id BIGINT NOT NULL,
    comment_author_type VARCHAR(20) NOT NULL,
    member_user_id BIGINT,
    display_nickname VARCHAR(50) NOT NULL,
    guest_password_hash VARCHAR(255),
    content VARCHAR(500) NOT NULL,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL,
    CONSTRAINT fk_place_comments_place
        FOREIGN KEY (place_id) REFERENCES places (place_id),
    CONSTRAINT fk_place_comments_member_user
        FOREIGN KEY (member_user_id) REFERENCES users (user_id),
    CONSTRAINT chk_place_comments_author_type CHECK (comment_author_type IN ('MEMBER', 'GUEST')),
    CONSTRAINT chk_place_comments_member_shape CHECK (
        (comment_author_type = 'MEMBER' AND member_user_id IS NOT NULL AND guest_password_hash IS NULL)
        OR
        (comment_author_type = 'GUEST' AND member_user_id IS NULL AND guest_password_hash IS NOT NULL)
    )
);

CREATE TABLE place_reactions (
    place_reaction_id BIGSERIAL PRIMARY KEY,
    place_id BIGINT NOT NULL,
    reaction_author_type VARCHAR(20) NOT NULL,
    member_user_id BIGINT,
    guest_key_hash VARCHAR(255),
    reaction_type VARCHAR(20) NOT NULL,
    reaction_hour_key BIGINT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL,
    CONSTRAINT fk_place_reactions_place
        FOREIGN KEY (place_id) REFERENCES places (place_id),
    CONSTRAINT fk_place_reactions_member_user
        FOREIGN KEY (member_user_id) REFERENCES users (user_id),
    CONSTRAINT chk_place_reactions_author_type CHECK (reaction_author_type IN ('MEMBER', 'GUEST')),
    CONSTRAINT chk_place_reactions_type CHECK (reaction_type IN ('LIKE', 'DISLIKE', 'CANCELED')),
    CONSTRAINT chk_place_reactions_member_shape CHECK (
        (reaction_author_type = 'MEMBER' AND member_user_id IS NOT NULL AND guest_key_hash IS NULL)
        OR
        (reaction_author_type = 'GUEST' AND member_user_id IS NULL AND guest_key_hash IS NOT NULL)
    )
);

CREATE UNIQUE INDEX uk_place_reactions_member_hour
    ON place_reactions (place_id, member_user_id, reaction_hour_key)
    WHERE member_user_id IS NOT NULL;

CREATE UNIQUE INDEX uk_place_reactions_guest_hour
    ON place_reactions (place_id, guest_key_hash, reaction_hour_key)
    WHERE guest_key_hash IS NOT NULL;

CREATE INDEX idx_places_location
    ON places USING GIST (location);

CREATE INDEX idx_places_deleted_lat_lng
    ON places (deleted_at, latitude, longitude);

CREATE INDEX idx_places_created_by_user
    ON places (created_by_user_id);

CREATE INDEX idx_place_comments_place_deleted_id
    ON place_comments (place_id, deleted_at, place_comment_id DESC);

CREATE INDEX idx_place_comments_member_user
    ON place_comments (member_user_id);

CREATE INDEX idx_place_reactions_place_type
    ON place_reactions (place_id, reaction_type);

CREATE INDEX idx_place_reactions_member_user
    ON place_reactions (member_user_id);
