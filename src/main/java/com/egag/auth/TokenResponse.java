package com.egag.auth;

import lombok.Getter;

@Getter
public class TokenResponse {

    private final String accessToken;
    private final String refreshToken;
    private final String tokenType = "Bearer";
    private final String userId;
    private final String nickname;
    private final String role;           // ✅ 추가된 권한 정보
    private final int tokenBalance;
    private final boolean needsOnboarding; // ✅ 추가된 온보딩 여부

    public TokenResponse(String accessToken, String refreshToken, String userId,
                         String nickname, String role, int tokenBalance, boolean needsOnboarding) {
        this.accessToken = accessToken;
        this.refreshToken = refreshToken;
        this.userId = userId;
        this.nickname = nickname;
        this.role = role;
        this.tokenBalance = tokenBalance;
        this.needsOnboarding = needsOnboarding;
    }
}