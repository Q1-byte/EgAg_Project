package com.egag.admin;

import com.egag.common.domain.UserRepository; // 👈 유저 수 조회를 위해 추가
import lombok.Builder;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.Setter;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;
    private final UserRepository userRepository; // 👈 DB 조회를 위해 주입

    // ✅ [추가] 대시보드 통계 데이터 API
    @GetMapping("/dashboard/stats")
    public ResponseEntity<AdminDashboardStatsResponse> getDashboardStats() {
        // 실제 유저 수 조회
        long totalUsers = userRepository.count();

        // 💡 실시간 데이터 연동 (매출 등은 나중에 서비스 레이어에서 가져오시면 됩니다)
        AdminDashboardStatsResponse stats = AdminDashboardStatsResponse.builder()
                .totalUsers(totalUsers)
                .todayNewUsers(3)        // TODO: 실제 로직 구현 필요
                .totalSales(1250000)     // TODO: 실제 로직 구현 필요
                .todaySales(35000)       // TODO: 실제 로직 구현 필요
                .suspendedUsers(1)       // TODO: 실제 로직 구현 필요
                .activeUsers(totalUsers - 1)
                .build();

        return ResponseEntity.ok(stats);
    }

    // 💰 기존 수동 토큰 지급 API (유지)
    @PostMapping("/tokens/manual")
    public ResponseEntity<String> giveToken(@RequestBody TokenRequest request) {
        String currentAdminId = "admin_01";
        adminService.giveManualToken(
                currentAdminId,
                request.getUserId(),
                request.getAmount(),
                request.getReason()
        );
        return ResponseEntity.ok("토큰 지급 및 로그 기록 완료!");
    }
}

// --- DTO 객체들 ---

@Getter
@Builder // ✅ 대시보드 응답용 빌더 추가
class AdminDashboardStatsResponse {
    private long totalUsers;
    private long todayNewUsers;
    private long totalSales;
    private long todaySales;
    private long suspendedUsers;
    private long activeUsers;
}

@Getter
@Setter
class TokenRequest {
    private String userId;
    private Integer amount;
    private String reason;
}