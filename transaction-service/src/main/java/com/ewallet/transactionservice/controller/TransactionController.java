package com.ewallet.transactionservice.controller;

import com.ewallet.transactionservice.dto.TransactionHistoryResponse;
import com.ewallet.transactionservice.dto.TransactionResponse;
import com.ewallet.transactionservice.entity.Transaction;
import com.ewallet.transactionservice.repository.TransactionRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/transactions")
@RequiredArgsConstructor
@Tag(name = "Transactions", description = "Transaction history endpoints")
public class TransactionController {

    private final TransactionRepository transactionRepository;

    @GetMapping("/history")
    @Operation(summary = "Get the authenticated user's transaction history (paginated)")
    public ResponseEntity<TransactionHistoryResponse> getHistory(
            HttpServletRequest request,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        Long userId = (Long) request.getAttribute("userId");

        Page<Transaction> result = transactionRepository.findByUserId(
                userId, PageRequest.of(page, size, Sort.by("timestamp").descending())
        );

        List<TransactionResponse> transactions = result.getContent().stream()
                .map(this::mapToResponse)
                .toList();

        TransactionHistoryResponse response = TransactionHistoryResponse.builder()
                .transactions(transactions)
                .currentPage(result.getNumber())
                .totalPages(result.getTotalPages())
                .totalElements(result.getTotalElements())
                .build();

        return ResponseEntity.ok(response);
    }

    private TransactionResponse mapToResponse(Transaction t) {
        return TransactionResponse.builder()
                .id(t.getId())
                .transactionId(t.getTransactionId())
                .senderUserId(t.getSenderUserId())
                .receiverUserId(t.getReceiverUserId())
                .amount(t.getAmount())
                .type(t.getType())
                .status(t.getStatus())
                .note(t.getNote())
                .timestamp(t.getTimestamp())
                .build();
    }
}
