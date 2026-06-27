package com.ewallet.walletservice.client;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

import java.util.Map;

/**
 * Thin REST client wallet-service uses to call user-service.
 * In a real deployment this URL would normally be resolved via a service
 * registry (e.g. Eureka) or the API gateway; here it's read from config
 * so each service can be started and tested independently.
 */
@Component
@Slf4j
public class UserServiceClient {

    private final RestClient restClient;

    public UserServiceClient(@Value("${services.user-service.url}") String userServiceUrl) {
        this.restClient = RestClient.builder().baseUrl(userServiceUrl).build();
    }

    /**
     * Looks up a user's id by email. Returns null if not found.
     * The Authorization header is forwarded so user-service's JWT filter
     * accepts the call (it is itself a protected endpoint apart from /api/auth/**).
     */
    public Long findUserIdByEmail(String email, String bearerToken) {
        try {
            Map<?, ?> response = restClient.get()
                    .uri("/api/users/by-email?email={email}", email)
                    .header("Authorization", bearerToken)
                    .retrieve()
                    .body(Map.class);

            if (response == null || response.get("id") == null) {
                return null;
            }
            Object id = response.get("id");
            return id instanceof Number ? ((Number) id).longValue() : Long.parseLong(id.toString());
        } catch (RestClientException e) {
            log.warn("Could not resolve user by email [{}]: {}", email, e.getMessage());
            return null;
        }
    }
}
