package com.ewallet.transactionservice.repository;

import com.ewallet.transactionservice.entity.Transaction;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface TransactionRepository extends JpaRepository<Transaction, Long> {

    // A user's history includes transactions where they are either the sender or receiver
    @Query("SELECT t FROM Transaction t WHERE t.senderUserId = :userId OR t.receiverUserId = :userId " +
           "ORDER BY t.timestamp DESC")
    Page<Transaction> findByUserId(@Param("userId") Long userId, Pageable pageable);

    boolean existsByTransactionIdAndType(String transactionId, String type);
}
