package com.ewallet.transactionservice.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "transactions", indexes = {
        @Index(name = "idx_sender_user_id", columnList = "senderUserId"),
        @Index(name = "idx_receiver_user_id", columnList = "receiverUserId"),
        @Index(name = "idx_transaction_id", columnList = "transactionId")
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Transaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 64)
    private String transactionId;

    private Long senderUserId;

    private Long receiverUserId;

    @Column(nullable = false, precision = 19, scale = 2)
    private BigDecimal amount;

    // ADD_MONEY, TRANSFER_SENT, TRANSFER_RECEIVED
    @Column(nullable = false, length = 30)
    private String type;

    // SUCCESS, FAILED
    @Column(nullable = false, length = 20)
    private String status;

    @Column(length = 255)
    private String note;

    @Column(nullable = false)
    private LocalDateTime timestamp;

    @Column(updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
}
