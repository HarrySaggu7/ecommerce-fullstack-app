package com.ecommerce.backend.controller;

import org.springframework.web.bind.annotation.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;

@RestController
@RequestMapping("/api/contact")
@CrossOrigin(origins = "http://localhost:3000")
public class ContactController {
    @Autowired
    private JavaMailSender mailSender;

    @PostMapping
    public String sendContactMessage(@RequestBody ContactMessage message) {
        SimpleMailMessage mail = new SimpleMailMessage();
        mail.setTo("support@yourshop.com"); // Change to your support email
        mail.setSubject("Contact Us: " + message.getName());
        mail.setText("From: " + message.getName() + " <" + message.getEmail() + ">\n\n" + message.getMessage());
        mailSender.send(mail);
        return "Message sent";
    }

    public static class ContactMessage {
        private String name;
        private String email;
        private String message;
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getMessage() { return message; }
        public void setMessage(String message) { this.message = message; }
    }
}
