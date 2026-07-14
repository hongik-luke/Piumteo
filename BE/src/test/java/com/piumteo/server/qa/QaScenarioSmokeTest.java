package com.piumteo.server.qa;

import com.piumteo.server.domain.comment.entity.PlaceComment;
import com.piumteo.server.domain.comment.repository.PlaceCommentRepository;
import com.piumteo.server.domain.place.entity.Place;
import com.piumteo.server.domain.place.entity.PlaceType;
import com.piumteo.server.domain.place.repository.PlaceRepository;
import com.piumteo.server.domain.reaction.entity.PlaceReaction;
import com.piumteo.server.domain.reaction.entity.ReactionType;
import com.piumteo.server.domain.reaction.repository.PlaceReactionRepository;
import com.piumteo.server.domain.user.entity.User;
import com.piumteo.server.domain.user.repository.UserRepository;
import com.piumteo.server.global.util.HashUtils;
import com.piumteo.server.global.util.TimeUtils;
import jakarta.servlet.http.Cookie;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class QaScenarioSmokeTest {

    private static final String PASSWORD = "password1234";

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PlaceRepository placeRepository;

    @Autowired
    private PlaceCommentRepository placeCommentRepository;

    @Autowired
    private PlaceReactionRepository placeReactionRepository;

    @Test
    void authSignupLoginAndDuplicateChecks() throws Exception {
        String suffix = UUID.randomUUID().toString().substring(0, 8);
        String email = "qa-" + suffix + "@test.com";
        String nickname = "qa-" + suffix;

        mockMvc.perform(get("/api/auth/check-email")
                        .param("email", email))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.result.duplicated").value(false));

        mockMvc.perform(post("/api/auth/signup")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "email": "%s",
                                  "password": "%s",
                                  "nickname": "%s"
                                }
                                """.formatted(email, PASSWORD, nickname)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.result.email").value(email))
                .andExpect(jsonPath("$.result.nickname").value(nickname))
                .andExpect(jsonPath("$.result.accessToken").doesNotExist());

        mockMvc.perform(get("/api/auth/check-email")
                        .param("email", email))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.result.duplicated").value(true));

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "email": "%s",
                                  "password": "%s"
                                }
                                """.formatted(email, PASSWORD)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.result.accessToken").doesNotExist())
                .andExpect(result -> {
                    Cookie cookie = result.getResponse().getCookie("accessToken");
                    assertThat(cookie).isNotNull();
                    assertThat(cookie.isHttpOnly()).isTrue();
                    assertThat(cookie.getPath()).isEqualTo("/");
                });
    }

    @Test
    void placeMarkerSummaryCommentReactionAndHardDeleteCascade() throws Exception {
        User owner = saveUser("owner");
        User other = saveUser("other");
        Cookie ownerCookie = login(owner.getEmail());
        Cookie otherCookie = login(other.getEmail());

        Place place = placeRepository.saveAndFlush(new Place(
                owner,
                "QA 흡연구역",
                PlaceType.SMOKING_AREA,
                new BigDecimal("37.5512345"),
                new BigDecimal("126.9234567"),
                "QA 테스트 장소"
        ));

        mockMvc.perform(get("/api/places/nearby")
                        .param("lat", "37.5512345")
                        .param("lng", "126.9234567"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.result").isArray())
                .andExpect(jsonPath("$.result[0].placeId").exists())
                .andExpect(jsonPath("$.result[0].placeName").exists())
                .andExpect(jsonPath("$.result[0].placeType").exists())
                .andExpect(jsonPath("$.result[0].latitude").exists())
                .andExpect(jsonPath("$.result[0].longitude").exists())
                .andExpect(jsonPath("$.result[0].distanceMeters").doesNotExist());

        mockMvc.perform(get("/api/places/bounds")
                        .param("minLat", "37.5400000")
                        .param("minLng", "126.9100000")
                        .param("maxLat", "37.5600000")
                        .param("maxLng", "126.9400000"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.result").isArray())
                .andExpect(jsonPath("$.result[0].placeId").exists())
                .andExpect(jsonPath("$.result[0].distanceMeters").doesNotExist())
                .andExpect(jsonPath("$.result.count").doesNotExist())
                .andExpect(jsonPath("$.result.totalCount").doesNotExist());

        mockMvc.perform(get("/api/places/nearby")
                        .param("lat", "999")
                        .param("lng", "126.9234567"))
                .andExpect(status().isBadRequest());

        mockMvc.perform(get("/api/places/bounds")
                        .param("minLat", "37.5600000")
                        .param("minLng", "126.9100000")
                        .param("maxLat", "37.5400000")
                        .param("maxLng", "126.9400000"))
                .andExpect(status().isBadRequest());

        mockMvc.perform(post("/api/places/%d/comments/member".formatted(place.getId()))
                        .cookie(ownerCookie)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "content": "회원 댓글"
                                }
                                """))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.result.commentAuthorType").value("MEMBER"))
                .andExpect(jsonPath("$.result.displayNickname").value(owner.getNickname()));

        mockMvc.perform(post("/api/places/%d/comments/guest".formatted(place.getId()))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "displayNickname": "비회원",
                                  "guestPassword": "guest1234",
                                  "content": "비회원 댓글"
                                }
                                """))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.result.commentAuthorType").value("GUEST"));

        mockMvc.perform(put("/api/places/%d/reaction/member".formatted(place.getId()))
                        .cookie(ownerCookie)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "reactionType": "LIKE"
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.result.myReactionType").value("LIKE"))
                .andExpect(jsonPath("$.result.likeCount").value(1));

        String guestKey = UUID.randomUUID().toString();
        mockMvc.perform(put("/api/places/%d/reaction/guest".formatted(place.getId()))
                        .header("X-Guest-Key", guestKey)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "reactionType": "DISLIKE"
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.result.myReactionType").value("DISLIKE"))
                .andExpect(jsonPath("$.result.dislikeCount").value(1));

        mockMvc.perform(get("/api/places/%d/summary".formatted(place.getId()))
                        .cookie(ownerCookie))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.result.myReactionType").value("LIKE"))
                .andExpect(jsonPath("$.result.isOwner").value(true))
                .andExpect(jsonPath("$.result.commentCount").value(2))
                .andExpect(jsonPath("$.result.likeCount").value(1))
                .andExpect(jsonPath("$.result.dislikeCount").value(1));

        mockMvc.perform(delete("/api/places/%d".formatted(place.getId()))
                        .cookie(otherCookie))
                .andExpect(status().isForbidden());

        mockMvc.perform(delete("/api/places/%d".formatted(place.getId()))
                        .cookie(ownerCookie))
                .andExpect(status().isOk());

        assertThat(placeRepository.findById(place.getId())).isEmpty();
        assertThat(placeCommentRepository.countByPlace_IdAndDeletedAtIsNull(place.getId())).isZero();
        assertThat(placeReactionRepository.countByPlace_IdAndReactionType(place.getId(), ReactionType.LIKE)).isZero();
        assertThat(placeReactionRepository.countByPlace_IdAndReactionType(place.getId(), ReactionType.DISLIKE)).isZero();
    }

    @Test
    void guestReactionRequiresGuestKeyAndSameHourUpdatesSingleRow() throws Exception {
        User owner = saveUser("reaction-owner");
        Place place = placeRepository.saveAndFlush(new Place(
                owner,
                "QA 반응 장소",
                PlaceType.SMOKING_BOOTH,
                new BigDecimal("37.5512345"),
                new BigDecimal("126.9234567"),
                "반응 테스트 장소"
        ));

        mockMvc.perform(put("/api/places/%d/reaction/guest".formatted(place.getId()))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "reactionType": "LIKE"
                                }
                                """))
                .andExpect(status().isBadRequest());

        String guestKey = UUID.randomUUID().toString();

        mockMvc.perform(put("/api/places/%d/reaction/guest".formatted(place.getId()))
                        .header("X-Guest-Key", guestKey)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "reactionType": "LIKE"
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.result.myReactionType").value("LIKE"));

        mockMvc.perform(put("/api/places/%d/reaction/guest".formatted(place.getId()))
                        .header("X-Guest-Key", guestKey)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "reactionType": "LIKE"
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.result.myReactionType").value("CANCELED"))
                .andExpect(jsonPath("$.result.likeCount").value(0));

        mockMvc.perform(put("/api/places/%d/reaction/guest".formatted(place.getId()))
                        .header("X-Guest-Key", guestKey)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "reactionType": "DISLIKE"
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.result.myReactionType").value("DISLIKE"))
                .andExpect(jsonPath("$.result.dislikeCount").value(1));

        assertThat(placeReactionRepository.countByPlace_IdAndReactionType(place.getId(), ReactionType.LIKE)).isZero();
        assertThat(placeReactionRepository.countByPlace_IdAndReactionType(place.getId(), ReactionType.DISLIKE)).isEqualTo(1);
        assertThat(placeReactionRepository.countByPlace_IdAndReactionType(place.getId(), ReactionType.CANCELED)).isZero();

        PlaceReaction reaction = placeReactionRepository
                .findByPlace_IdAndGuestKeyHashAndReactionHourKey(
                        place.getId(),
                        HashUtils.sha256(guestKey),
                        TimeUtils.currentHourKey()
                )
                .orElseThrow();
        assertThat(reaction.getGuestKeyHash()).isNotEqualTo(guestKey);
        assertThat(reaction.getReactionHourKey()).isEqualTo(TimeUtils.currentHourKey());
    }

    private User saveUser(String label) {
        String suffix = UUID.randomUUID().toString().substring(0, 8);
        return userRepository.saveAndFlush(new User(
                "qa-" + label + "-" + suffix + "@test.com",
                passwordEncoder.encode(PASSWORD),
                "qa-" + label + "-" + suffix
        ));
    }

    private Cookie login(String email) throws Exception {
        Cookie cookie = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "email": "%s",
                                  "password": "%s"
                                }
                                """.formatted(email, PASSWORD)))
                .andExpect(status().isOk())
                .andReturn()
                .getResponse()
                .getCookie("accessToken");

        assertThat(cookie).isNotNull();
        return cookie;
    }
}
