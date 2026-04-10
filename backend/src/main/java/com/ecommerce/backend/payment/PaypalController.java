package com.ecommerce.backend.payment;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.reactive.function.BodyInserters;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.util.Base64;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/paypal")
@CrossOrigin(origins = "http://localhost:3000")
public class PaypalController {

    @Value("${paypal.client.id}")
    private String clientId;

    @Value("${paypal.client.secret}")
    private String clientSecret;

    @Value("${paypal.mode}")
    private String mode;

    private String getBaseUrl() {
        return "sandbox".equalsIgnoreCase(mode)
                ? "https://api-m.sandbox.paypal.com"
                : "https://api-m.paypal.com";
    }

    private String getAccessToken() {
        String auth = clientId + ":" + clientSecret;
        String encoded = Base64.getEncoder().encodeToString(auth.getBytes());
        WebClient webClient = WebClient.builder().baseUrl(getBaseUrl()).build();
        Map<String, String> form = new HashMap<>();
        form.put("grant_type", "client_credentials");
        Map<String, Object> tokenResponse = webClient.post()
                .uri("/v1/oauth2/token")
                .header(HttpHeaders.AUTHORIZATION, "Basic " + encoded)
                .contentType(MediaType.APPLICATION_FORM_URLENCODED)
                .body(BodyInserters.fromFormData("grant_type", "client_credentials"))
                .retrieve()
                .bodyToMono(Map.class)
                .block();
        return tokenResponse.get("access_token").toString();
    }

    @PostMapping("/create-payment")
    public ResponseEntity<?> createPayment(@RequestBody Map<String, Object> data) {
        double total = Double.parseDouble(data.get("total").toString());
        String currency = data.getOrDefault("currency", "USD").toString();
        String description = data.getOrDefault("description", "E-Commerce Order").toString();

        String accessToken = getAccessToken();
        WebClient webClient = WebClient.builder().baseUrl(getBaseUrl()).build();

        Map<String, Object> amount = new HashMap<>();
        amount.put("currency_code", currency);
        amount.put("value", String.format("%.2f", total));

        Map<String, Object> purchaseUnit = new HashMap<>();
        purchaseUnit.put("amount", amount);
        purchaseUnit.put("description", description);

        Map<String, Object> payload = new HashMap<>();
        payload.put("intent", "CAPTURE");
        payload.put("purchase_units", new Object[]{purchaseUnit});
        Map<String, String> appContext = new HashMap<>();
        appContext.put("return_url", "http://localhost:3000/success");
        appContext.put("cancel_url", "http://localhost:3000/cancel");
        payload.put("application_context", appContext);

        Map<String, Object> response = webClient.post()
                .uri("/v2/checkout/orders")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + accessToken)
                .contentType(MediaType.APPLICATION_JSON)
                .body(BodyInserters.fromValue(payload))
                .retrieve()
                .bodyToMono(Map.class)
                .block();

        return ResponseEntity.ok(response);
    }

    @PostMapping("/execute-payment")
    public ResponseEntity<?> capturePayment(@RequestBody Map<String, String> data) {
        String orderId = data.get("orderId");
        String accessToken = getAccessToken();
        WebClient webClient = WebClient.builder().baseUrl(getBaseUrl()).build();

        Map<String, Object> response = webClient.post()
                .uri("/v2/checkout/orders/" + orderId + "/capture")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + accessToken)
                .contentType(MediaType.APPLICATION_JSON)
                .retrieve()
                .bodyToMono(Map.class)
                .block();

        return ResponseEntity.ok(response);
    }
}
