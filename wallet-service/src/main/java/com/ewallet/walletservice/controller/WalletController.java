package com.ewallet.walletservice.controller;

import com.ewallet.walletservice.dto.AddMoneyRequest;
import com.ewallet.walletservice.dto.TransferRequest;
import com.ewallet.walletservice.dto.WalletResponse;
import com.ewallet.walletservice.service.WalletService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/wallet")
@RequiredArgsConstructor
@Tag(name = "Wallet", description = "Wallet balance, add money and transfer endpoints")
public class WalletController {

    private final WalletService walletService;

    @GetMapping("/balance")
    @Operation(summary = "Get the authenticated user's wallet balance")
    public ResponseEntity<WalletResponse> getBalance(HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        return ResponseEntity.ok(walletService.getWalletByUserId(userId));
    }

    @PostMapping("/create")
    @Operation(summary = "Create a wallet for the authenticated user (idempotent, normally called right after registration)")
    public ResponseEntity<WalletResponse> createWallet(HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        return ResponseEntity.ok(walletService.createWalletForUser(userId));
    }

    @PostMapping("/add-money")
    @Operation(summary = "Add money to the authenticated user's wallet")
    public ResponseEntity<WalletResponse> addMoney(HttpServletRequest request,
                                                    @Valid @RequestBody AddMoneyRequest addMoneyRequest) {
        Long userId = (Long) request.getAttribute("userId");
        return ResponseEntity.ok(walletService.addMoney(userId, addMoneyRequest));
    }

    @PostMapping("/transfer")
    @Operation(summary = "Transfer money from the authenticated user's wallet to a recipient identified by email")
    public ResponseEntity<WalletResponse> transfer(HttpServletRequest request,
                                                    @Valid @RequestBody TransferRequest transferRequest) {
        Long userId = (Long) request.getAttribute("userId");
        String bearerToken = request.getHeader("Authorization");
        return ResponseEntity.ok(walletService.transfer(userId, bearerToken, transferRequest));
    }
}
