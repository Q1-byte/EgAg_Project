package com.egag.inquiry;

import com.egag.inquiry.dto.InquiryRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/inquiries")
@RequiredArgsConstructor
public class InquiryController {

    private final InquiryService inquiryService;

    @PostMapping(consumes = {"multipart/form-data"})
    public ResponseEntity<String> createInquiry(
            @RequestPart("inquiry") InquiryRequest request,
            @RequestPart(value = "file", required = false) MultipartFile file) {

        // TODO: 현재 로그인한 유저 정보를 SecurityContext에서 가져오는 로직 추가 필요
        // User currentUser = ...;

        inquiryService.saveInquiry(request, file, null); // 일단 유저는 null로 전달
        return ResponseEntity.ok("문의가 정상적으로 접수되었습니다.");
    }
}