package com.egag.inquiry;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface InquiryRepository extends JpaRepository<Inquiry, String> {
    // 특정 유저의 문의 내역만 가져오는 기능 (마이페이지용)
    List<Inquiry> findByUserIdOrderByCreatedAtDesc(String userId);
}