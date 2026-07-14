                                                                                                   package com.piumteo.server.domain.auth.controller;

import com.piumteo.server.domain.auth.dto.AuthResponse;
import com.piumteo.server.domain.auth.dto.CurrentUserResponse;
import com.piumteo.server.domain.auth.dto.DuplicateCheckResponse;
import com.piumteo.server.domain.auth.dto.LoginResult;
import com.piumteo.server.domain.auth.dto.LoginRequest;
import com.piumteo.server.domain.auth.dto.SignupRequest;
import com.piumteo.server.domain.auth.exception.AuthCode;
import com.piumteo.server.domain.auth.service.AuthService;
import com.piumteo.server.global.response.ApiResponse;
import com.piumteo.server.global.security.CurrentUser;
import com.piumteo.server.global.security.CustomUserDetails;
import com.piumteo.server.global.security.jwt.AuthCookieService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@Tag(
        name = "인증",
        description = "회원가입, 로그인, 이메일/닉네임 중복 확인 API"
)
@Validated
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;
    private final AuthCookieService authCookieService;

    @Operation(
            summary = "회원가입",
            description = """
                    이메일, 비밀번호, 닉네임으로 신규 회원을 생성합니다.
                    
                    - Authorization 헤더 없이 호출합니다.
                    - 이메일과 닉네임은 각각 중복될 수 없습니다.
                    - 비밀번호는 서버에서 BCrypt로 해시 처리하여 저장합니다.
                    - 회원가입은 로그인 쿠키를 발급하지 않습니다. 가입 후 로그인을 호출합니다.
                    """
    )
    @PostMapping("/signup")
    public ResponseEntity<ApiResponse<AuthResponse>> signup(
            @Valid @RequestBody SignupRequest request
    ) {
        AuthResponse response = authService.signup(request);

        return ResponseEntity
                .status(AuthCode.SIGNUP_SUCCESS.getHttpStatus())
                .body(ApiResponse.onSuccess(
                        AuthCode.SIGNUP_SUCCESS,
                        response
                ));
    }

    @Operation(
            summary = "로그인",
            description = """
                    이메일과 비밀번호를 검증한 뒤 JWT Access Token을 HttpOnly Cookie로 발급합니다.
                    
                    - 성공 시 accessToken Cookie가 Set-Cookie로 내려갑니다.
                    - 응답 body에는 Access Token을 포함하지 않습니다.
                    - 이후 인증 요청은 브라우저가 Cookie를 자동 포함합니다.
                    """
    )
    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(
            @Valid @RequestBody LoginRequest request,
            HttpServletResponse servletResponse
    ) {
        LoginResult result = authService.login(request);
        authCookieService.addAccessTokenCookie(servletResponse, result.accessToken());

        return ResponseEntity
                .status(AuthCode.LOGIN_SUCCESS.getHttpStatus())
                .body(ApiResponse.onSuccess(
                        AuthCode.LOGIN_SUCCESS,
                        result.response()
                ));
    }

    @Operation(
            summary = "현재 로그인한 회원 조회",
            description = "HttpOnly accessToken Cookie를 기준으로 현재 로그인한 회원의 최소 정보를 반환합니다."
    )
    @GetMapping("/me")
    public ResponseEntity<ApiResponse<CurrentUserResponse>> me(
            @CurrentUser CustomUserDetails userDetails
    ) {
        return ResponseEntity.ok(
                ApiResponse.onSuccess(
                        AuthCode.LOGIN_SUCCESS,
                        CurrentUserResponse.from(userDetails)
                )
        );
    }

    @Operation(
            summary = "로그아웃",
            description = "HttpOnly accessToken Cookie를 즉시 만료시킵니다."
    )
    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<Void>> logout(
            HttpServletResponse servletResponse
    ) {
        authCookieService.expireAccessTokenCookie(servletResponse);

        return ResponseEntity.ok(
                ApiResponse.onSuccess(
                        AuthCode.LOGIN_SUCCESS,
                        null
                )
        );
    }

    @Operation(
            summary = "이메일 중복 확인",
            description = """
                    회원가입 전에 이메일 사용 가능 여부를 확인합니다.
                    
                    - duplicated=false이면 사용 가능한 이메일입니다.
                    - duplicated=true이면 이미 가입된 이메일입니다.
                    """
    )
    @GetMapping("/check-email")
    public ResponseEntity<ApiResponse<DuplicateCheckResponse>> checkEmail(
            @Parameter(
                    description = "중복 여부를 확인할 이메일",
                    example = "luke0985@naver.com",
                    required = true
            )
            @RequestParam
            @NotBlank(message = "Email is required.")
            @Email(message = "Email format is invalid.")
            @Size(max = 320, message = "Email must be 320 characters or less.")
            String email
    ) {
        DuplicateCheckResponse response = authService.checkEmail(email);

        return ResponseEntity
                .status(AuthCode.DUPLICATE_CHECK_SUCCESS.getHttpStatus())
                .body(ApiResponse.onSuccess(
                        AuthCode.DUPLICATE_CHECK_SUCCESS,
                        response
                ));
    }

    @Operation(
            summary = "닉네임 중복 확인",
            description = """
                    회원가입 전에 닉네임 사용 가능 여부를 확인합니다.
                    
                    - duplicated=false이면 사용 가능한 닉네임입니다.
                    - duplicated=true이면 이미 사용 중인 닉네임입니다.
                    """
    )
    @GetMapping("/check-nickname")
    public ResponseEntity<ApiResponse<DuplicateCheckResponse>> checkNickname(
            @Parameter(
                    description = "중복 여부를 확인할 닉네임",
                    example = "luke",
                    required = true
            )
            @RequestParam
            @NotBlank(message = "Nickname is required.")
            @Size(max = 50, message = "Nickname must be 50 characters or less.")
            String nickname
    ) {
        DuplicateCheckResponse response = authService.checkNickname(nickname);

        return ResponseEntity
                .status(AuthCode.DUPLICATE_CHECK_SUCCESS.getHttpStatus())
                .body(ApiResponse.onSuccess(
                        AuthCode.DUPLICATE_CHECK_SUCCESS,
                        response
                ));
    }
}
