package com.ewallet.transactionservice.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Mirrors wallet-service's TransactionEvent exactly - this is the contract
 * between the two services over the "transaction-events" Kafka topic.
 * In a larger system this would live in a shared library/schema registry
 * (e.g. Avro + Confluent Schema Registry) to enforce the contract at build time.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class TransactionEvent {

    private String transactionId;
    private Long senderUserId;
    private Long receiverUserId;
    private BigDecimal amount;
    private String type;
    private String status;
    private String note;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime timestamp;
}
