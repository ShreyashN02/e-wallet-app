# API Reference

All requests below go through the API Gateway at `http://localhost:8080`. You can also hit each service directly on its own port (8081/8082/8083).

## Auth (user-service)

### Register

```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Asha Rao",
    "email": "asha@example.com",
    "password": "secret123",
    "phoneNumber": "9876543210"
  }'
```

Response:
```json
{
  "token": "eyJhbGciOiJIUzI1NiJ9...",
  "userId": 1,
  "fullName": "Asha Rao",
  "email": "asha@example.com",
  "tokenType": "Bearer"
}
```

### Login

```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{ "email": "asha@example.com", "password": "secret123" }'
```

Save the `token` from the response — every request below needs it in the `Authorization` header.

```bash
export TOKEN="eyJhbGciOiJIUzI1NiJ9..."
```

## Wallet (wallet-service)

### Create wallet (idempotent — call once after registering)

```bash
curl -X POST http://localhost:8080/api/wallet/create \
  -H "Authorization: Bearer $TOKEN"
```

### Get balance

```bash
curl http://localhost:8080/api/wallet/balance \
  -H "Authorization: Bearer $TOKEN"
```

### Add money

```bash
curl -X POST http://localhost:8080/api/wallet/add-money \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "amount": 1000, "note": "Initial top-up" }'
```

### Transfer money

```bash
curl -X POST http://localhost:8080/api/wallet/transfer \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "recipientEmail": "friend@example.com",
    "amount": 250,
    "note": "Lunch split"
  }'
```

## Transactions (transaction-service)

### Get history (paginated)

```bash
curl "http://localhost:8080/api/transactions/history?page=0&size=10" \
  -H "Authorization: Bearer $TOKEN"
```

Response:
```json
{
  "transactions": [
    {
      "id": 5,
      "transactionId": "a1b2c3d4-...",
      "senderUserId": 1,
      "receiverUserId": 2,
      "amount": 250.00,
      "type": "TRANSFER_SENT",
      "status": "SUCCESS",
      "note": "Lunch split",
      "timestamp": "2026-06-26T10:15:00"
    }
  ],
  "currentPage": 0,
  "totalPages": 1,
  "totalElements": 1
}
```

Note there's a short delay between the transfer call returning and the transaction showing up in history — that's the Kafka round-trip (producer → broker → consumer → DB insert) happening asynchronously.
