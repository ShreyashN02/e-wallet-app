package com.ewallet.transactionservice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TransactionResponse {
    private Long id;
    private String transactionId;
    private Long senderUserId;
    private Long receiverUserId;
    private BigDecimal amount;
    private String type;
    private String status;
    private String note;
    private LocalDateTime timestamp;
}
