package com.ewallet.walletservice.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Event published to Kafka topic "transaction-events" whenever a wallet
 * operation occurs (ADD_MONEY, TRANSFER_SENT, TRANSFER_RECEIVED).
 * Consumed asynchronously by transaction-service to build transaction history.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TransactionEvent {

    private String transactionId;     // UUID generated at creation time
    private Long senderUserId;        // null for ADD_MONEY
    private Long receiverUserId;      // the wallet owner that's affected
    private BigDecimal amount;
    private String type;              // ADD_MONEY, TRANSFER_SENT, TRANSFER_RECEIVED
    private String status;            // SUCCESS, FAILED
    private String note;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime timestamp;
}
