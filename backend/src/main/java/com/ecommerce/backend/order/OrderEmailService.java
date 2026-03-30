package com.ecommerce.backend.order;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class OrderEmailService {
    @Autowired
    private JavaMailSender mailSender;

    public void sendOrderConfirmation(String to, String orderDetails) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setSubject("Order Confirmation");
        message.setText("Thank you for your order!\n\n" + orderDetails);
        mailSender.send(message);
    }
}
