package com.ewallet.walletservice.service;

import com.ewallet.walletservice.client.UserServiceClient;
import com.ewallet.walletservice.dto.*;
import com.ewallet.walletservice.entity.Wallet;
import com.ewallet.walletservice.exception.InsufficientBalanceException;
import com.ewallet.walletservice.exception.InvalidTransferException;
import com.ewallet.walletservice.exception.UserNotFoundException;
import com.ewallet.walletservice.exception.WalletNotFoundException;
import com.ewallet.walletservice.kafka.TransactionEventProducer;
import com.ewallet.walletservice.repository.WalletRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class WalletService {

    private final WalletRepository walletRepository;
    private final TransactionEventProducer transactionEventProducer;
    private final UserServiceClient userServiceClient;

    /**
     * Called once at registration time (or lazily on first access) to give
     * every user a wallet with a zero balance.
     */
    @Transactional
    public WalletResponse createWalletForUser(Long userId) {
        if (walletRepository.existsByUserId(userId)) {
            return getWalletByUserId(userId);
        }
        Wallet wallet = Wallet.builder()
                .userId(userId)
                .balance(BigDecimal.ZERO)
                .currency("INR")
                .build();
        return mapToResponse(walletRepository.save(wallet));
    }

    public WalletResponse getWalletByUserId(Long userId) {
        Wallet wallet = walletRepository.findByUserId(userId)
                .orElseThrow(() -> new WalletNotFoundException("Wallet not found for this user"));
        return mapToResponse(wallet);
    }

    /**
     * Adds money to the caller's own wallet (e.g. simulated top-up from a bank/card).
     * Wrapped in a transaction so the balance update is atomic; the Kafka event
     * is published only after the DB commit succeeds.
     */
    @Transactional
    public WalletResponse addMoney(Long userId, AddMoneyRequest request) {
        Wallet wallet = walletRepository.findByUserIdForUpdate(userId)
                .orElseGet(() -> walletRepository.save(
                        Wallet.builder().userId(userId).balance(BigDecimal.ZERO).currency("INR").build()
                ));

        wallet.setBalance(wallet.getBalance().add(request.getAmount()));
        Wallet saved = walletRepository.save(wallet);

        publishEvent(null, null, userId, request.getAmount(), "ADD_MONEY", request.getNote());

        log.info("User [{}] added {} to wallet. New balance: {}", userId, request.getAmount(), saved.getBalance());
        return mapToResponse(saved);
    }

    /**
     * Transfers money from the authenticated user's wallet to a recipient's
     * wallet, identified by email. Debit and credit happen in the same DB
     * transaction so the transfer is all-or-nothing; pessimistic locks on
     * both rows prevent a lost update if two transfers touch the same wallet
     * concurrently.
     */
    @Transactional
    public WalletResponse transfer(Long senderUserId, String senderBearerToken, TransferRequest request) {
        Long recipientUserId = userServiceClient.findUserIdByEmail(request.getRecipientEmail(), senderBearerToken);
        if (recipientUserId == null) {
            throw new UserNotFoundException("No user found with email: " + request.getRecipientEmail());
        }
        if (recipientUserId.equals(senderUserId)) {
            throw new InvalidTransferException("You cannot transfer money to yourself");
        }

        // Lock sender first, then recipient, in a consistent order (lower id first)
        // to avoid deadlocks when two users transfer to each other simultaneously
        Long firstLockId = senderUserId < recipientUserId ? senderUserId : recipientUserId;
        Long secondLockId = senderUserId < recipientUserId ? recipientUserId : senderUserId;

        Wallet firstLocked = walletRepository.findByUserIdForUpdate(firstLockId)
                .orElseThrow(() -> new WalletNotFoundException("Wallet not found"));
        Wallet secondLocked = walletRepository.findByUserIdForUpdate(secondLockId)
                .orElseThrow(() -> new WalletNotFoundException("Wallet not found"));

        Wallet senderWallet = senderUserId.equals(firstLockId) ? firstLocked : secondLocked;
        Wallet recipientWallet = senderUserId.equals(firstLockId) ? secondLocked : firstLocked;

        if (senderWallet.getBalance().compareTo(request.getAmount()) < 0) {
            throw new InsufficientBalanceException("Insufficient balance to complete this transfer");
        }

        senderWallet.setBalance(senderWallet.getBalance().subtract(request.getAmount()));
        recipientWallet.setBalance(recipientWallet.getBalance().add(request.getAmount()));

        walletRepository.save(senderWallet);
        walletRepository.save(recipientWallet);

        String sharedTxnId = UUID.randomUUID().toString();
        publishEvent(sharedTxnId, senderUserId, recipientUserId, request.getAmount(), "TRANSFER_SENT", request.getNote());
        publishEvent(sharedTxnId, senderUserId, recipientUserId, request.getAmount(), "TRANSFER_RECEIVED", request.getNote());

        log.info("Transferred {} from user [{}] to user [{}]", request.getAmount(), senderUserId, recipientUserId);
        return mapToResponse(senderWallet);
    }

    private void publishEvent(String existingTxnId, Long senderUserId, Long receiverUserId, BigDecimal amount, String type, String note) {
        TransactionEvent event = TransactionEvent.builder()
                .transactionId(existingTxnId != null ? existingTxnId : UUID.randomUUID().toString())
                .senderUserId(senderUserId)
                .receiverUserId(receiverUserId)
                .amount(amount)
                .type(type)
                .status("SUCCESS")
                .note(note)
                .timestamp(LocalDateTime.now())
                .build();
        transactionEventProducer.publish(event);
    }

    private WalletResponse mapToResponse(Wallet wallet) {
        return WalletResponse.builder()
                .id(wallet.getId())
                .userId(wallet.getUserId())
                .balance(wallet.getBalance())
                .currency(wallet.getCurrency())
                .updatedAt(wallet.getUpdatedAt())
                .build();
    }
}
