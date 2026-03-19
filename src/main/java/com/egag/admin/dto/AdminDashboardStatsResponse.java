package com.egag.admin.dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class AdminDashboardStatsResponse {
    private long totalUsers;
    private long todayNewUsers;
    private long totalSales;
    private long todaySales;
    private long suspendedUsers;
    private long activeUsers;
}