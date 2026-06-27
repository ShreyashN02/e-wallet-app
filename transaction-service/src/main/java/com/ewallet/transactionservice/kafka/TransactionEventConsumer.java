package com.ewallet.transactionservice.kafka;

import com.ewallet.transactionservice.dto.TransactionEvent;
import com.ewallet.transactionservice.entity.Transaction;
import com.ewallet.transactionservice.repository.TransactionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.kafka.clients.consumer.ConsumerRecord;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.support.Acknowledgment;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
@RequiredArgsConstructor
@Slf4j
public class TransactionEventConsumer {

    private final TransactionRepository transactionRepository;

    /**
     * Consumes events published by wallet-service on the "transaction-events"
     * topic and persists them as transaction history rows. This decouples the
     * wallet's critical balance-update path from history-building: even if
     * this service is briefly down, events sit safely in Kafka and get
     * processed (and the balance change is never blocked by it).
     *
     * Idempotency: each event carries a (transactionId, type) pair; if the
     * same message is redelivered (e.g. after a consumer crash before the
     * offset commit), we skip re-inserting a duplicate row.
     */
    @KafkaListener(topics = "${kafka.topic.transaction-events}", groupId = "${spring.kafka.consumer.group-id}")
    @Transactional
    public void consume(ConsumerRecord<String, TransactionEvent> record, Acknowledgment acknowledgment) {
        TransactionEvent event = record.value();

        try {
            if (event == null) {
                log.warn("Received null transaction event at offset {}, skipping", record.offset());
                acknowledgment.acknowledge();
                return;
            }

            if (transactionRepository.existsByTransactionIdAndType(event.getTransactionId(), event.getType())) {
                log.info("Duplicate event [{} / {}] ignored", event.getTransactionId(), event.getType());
                acknowledgment.acknowledge();
                return;
            }

            Transaction transaction = Transaction.builder()
                    .transactionId(event.getTransactionId())
                    .senderUserId(event.getSenderUserId())
                    .receiverUserId(event.getReceiverUserId())
                    .amount(event.getAmount())
                    .type(event.getType())
                    .status(event.getStatus())
                    .note(event.getNote())
                    .timestamp(event.getTimestamp())
                    .build();

            transactionRepository.save(transaction);
            log.info("Persisted transaction [{} / {}] from partition {} offset {}",
                    event.getTransactionId(), event.getType(), record.partition(), record.offset());

            acknowledgment.acknowledge();
        } catch (Exception e) {
            // Don't acknowledge on failure - the message will be redelivered
            // and retried instead of being silently lost
            log.error("Failed to process transaction event at offset {}: {}", record.offset(), e.getMessage(), e);
        }
    }
}
