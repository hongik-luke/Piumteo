package com.piumteo.server.global.security;

import com.piumteo.server.domain.user.entity.User;
import com.piumteo.server.domain.user.entity.UserStatus;
import com.piumteo.server.domain.user.repository.UserRepository;
import com.piumteo.server.global.security.exception.SecurityBusinessException;
import com.piumteo.server.global.security.exception.SecurityErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    @Override
    public CustomUserDetails loadUserByUsername(String email) {
        User user = userRepository.findByEmailAndStatusAndDeletedAtIsNull(
                        email,
                        UserStatus.ACTIVE
                )
                .orElseThrow(() -> new SecurityBusinessException(SecurityErrorCode.UNAUTHORIZED));

        return new CustomUserDetails(user);
    }
}
