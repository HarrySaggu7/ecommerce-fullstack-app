package com.ecommerce.backend.order;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/email-test")
public class EmailTestController {
    @Autowired
    private OrderEmailService orderEmailService;

    @PostMapping
    public String sendTestEmail(@RequestParam String to) {
        orderEmailService.sendOrderConfirmation(to, "This is a test order confirmation email.");
        return "Test email sent to: " + to;
    }
}
