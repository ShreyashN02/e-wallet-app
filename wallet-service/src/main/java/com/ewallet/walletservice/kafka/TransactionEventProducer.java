package com.ewallet.walletservice.kafka;

import com.ewallet.walletservice.dto.TransactionEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class TransactionEventProducer {

    private final KafkaTemplate<String, Object> kafkaTemplate;

    @Value("${kafka.topic.transaction-events}")
    private String topic;

    /**
     * Publishes a transaction event asynchronously. The wallet/balance update
     * has already been committed to the database by this point - Kafka is used
     * purely to decouple "record this transaction in history" from the critical
     * balance-update path, so a slow consumer never blocks a money transfer.
     */
    public void publish(TransactionEvent event) {
        // Partition key = receiverUserId so all events for the same wallet
        // land on the same partition and are processed in order
        String key = String.valueOf(event.getReceiverUserId());

        kafkaTemplate.send(topic, key, event).whenComplete((result, ex) -> {
            if (ex != null) {
                log.error("Failed to publish transaction event [{}]: {}", event.getTransactionId(), ex.getMessage());
            } else {
                log.info("Published transaction event [{}] to partition {}",
                        event.getTransactionId(), result.getRecordMetadata().partition());
            }
        });
    }
}
