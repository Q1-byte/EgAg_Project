package com.egag.inquiry;

import lombok.RequiredArgsConstructor;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    @Async
    public void sendInquiryConfirmation(String toEmail, String title) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(toEmail);
        message.setSubject("[이그에그] 문의 접수가 완료되었습니다.");
        message.setText("안녕하세요, 이그에그(EggEgg) 팀입니다.\n\n" +
                "고객님의 문의 '" + title + "'가 정상적으로 접수되었습니다.\n" +
                "영업일 기준 1~3일 내에 답변을 드릴 예정입니다.\n\n" +
                "감사합니다.");

        mailSender.send(message);
    }
}
