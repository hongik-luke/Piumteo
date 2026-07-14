package com.piumteo.server.domain.auth.service;

import com.piumteo.server.domain.auth.dto.AuthResponse;
import com.piumteo.server.domain.auth.dto.LoginResult;
import com.piumteo.server.domain.auth.dto.DuplicateCheckResponse;
import com.piumteo.server.domain.auth.dto.LoginRequest;
import com.piumteo.server.domain.auth.dto.SignupRequest;
import com.piumteo.server.domain.user.entity.User;
import com.piumteo.server.domain.user.entity.UserStatus;
import com.piumteo.server.domain.user.repository.UserRepository;
import com.piumteo.server.domain.user.service.UserService;
import com.piumteo.server.global.security.CustomUserDetails;
import com.piumteo.server.global.security.exception.SecurityBusinessException;
import com.piumteo.server.global.security.exception.SecurityErrorCode;
import com.piumteo.server.global.security.jwt.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AuthService {

    private final UserRepository userRepository;
    private final UserService userService;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    @Transactional
    public AuthResponse signup(SignupRequest request) {
        userService.validateEmailNotDuplicated(request.email());
        userService.validateNicknameNotDuplicated(request.nickname());

        String passwordHash = passwordEncoder.encode(request.password());
        User user = userRepository.save(
                new User(
                        request.email(),
                        passwordHash,
                        request.nickname()
                )
        );

        return AuthResponse.from(user);
    }

    public LoginResult login(LoginRequest request) {
        User user = userRepository.findByEmailAndStatusAndDeletedAtIsNull(
                        request.email(),
                        UserStatus.ACTIVE
                )
                .orElseThrow(() -> new SecurityBusinessException(SecurityErrorCode.UNAUTHORIZED));

        if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            throw new SecurityBusinessException(SecurityErrorCode.UNAUTHORIZED);
        }

        String accessToken = jwtUtil.createAccessToken(new CustomUserDetails(user));

        return new LoginResult(AuthResponse.from(user), accessToken);
    }

    public DuplicateCheckResponse checkEmail(String email) {
        return new DuplicateCheckResponse(userRepository.existsByEmail(email));
    }

    public DuplicateCheckResponse checkNickname(String nickname) {
        return new DuplicateCheckResponse(userRepository.existsByNickname(nickname));
    }
}
