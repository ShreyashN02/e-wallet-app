# E-Wallet Application

A full-stack digital wallet built with a true microservices architecture. Users can register, log in, add money to their wallet, and transfer funds to other users by email — with transaction history processed asynchronously through Kafka.

## Architecture

```
                              ┌─────────────────┐
                              │   React (3000)  │
                              └────────┬────────┘
                                       │
                              ┌────────▼────────┐
                              │  API Gateway     │  (8080)
                              │  Spring Cloud GW  │
                              └───┬─────┬─────┬──┘
                  ┌───────────────┘     │     └───────────────┐
                  ▼                     ▼                     ▼
         ┌─────────────────┐  ┌─────────────────┐  ┌──────────────────────┐
         │  user-service    │  │  wallet-service  │  │  transaction-service │
         │  (8081)          │  │  (8082)          │  │  (8083)              │
         │  Register/Login  │  │  Balance         │  │  History (consumer)  │
         │  JWT issuing     │  │  Add money       │  │                      │
         │                  │  │  Transfer        │  │                      │
         └────────┬─────────┘  └────────┬─────────┘  └──────────┬───────────┘
                  │                     │                       │
            ┌─────▼─────┐         ┌─────▼─────┐                 │
            │  MySQL     │         │  MySQL     │           ┌────▼────┐
            │ user_db    │         │ wallet_db  │           │  MySQL   │
            └───────────┘         └─────┬─────┘            │ txn_db   │
                                        │ produces           └─────────┘
                                        ▼                       ▲
                                 ┌─────────────┐  consumes      │
                                 │   Kafka      │───────────────┘
                                 │ "transaction-│
                                 │   events"    │
                                 └─────────────┘
```

Each service has its own database and runs independently — `user-service` issues JWTs that `wallet-service` and `transaction-service` validate (shared secret, no shared session state). `wallet-service` publishes an event to Kafka after every balance change; `transaction-service` consumes those events asynchronously to build transaction history, so a slow or temporarily-down history service never blocks a transfer.

## Tech stack

**Backend:** Spring Boot 3, Spring Security + JWT, Spring Data JPA, Spring Kafka, Spring Cloud Gateway, MySQL, Maven, Lombok, springdoc-openapi (Swagger UI)

**Frontend:** React 19, React Router, Axios, Vite

## Project structure

```
ewallet-app/
├── user-service/          # Registration, login, JWT issuing — port 8081
├── wallet-service/        # Balance, add money, transfer, Kafka producer — port 8082
├── transaction-service/   # Kafka consumer, transaction history — port 8083
├── api-gateway/           # Single entry point, routes to all 3 services — port 8080
└── frontend/              # React app — port 5173 (dev) / served separately in prod
```

## Prerequisites

- Java 17+
- Maven 3.8+
- Node.js 18+
- MySQL 8 running locally (or update the connection URLs)
- Kafka running locally on `localhost:9092` (or update `spring.kafka.bootstrap-servers`)

## Running it

### 1. Start MySQL and Kafka

If you don't already have Kafka running, the quickest way is Docker:

```bash
docker run -d --name mysql -p 3306:3306 -e MYSQL_ROOT_PASSWORD=root mysql:8

# Kafka (KRaft mode, no Zookeeper needed) - using bitnami's image as an example
docker run -d --name kafka -p 9092:9092 \
  -e KAFKA_CFG_NODE_ID=0 \
  -e KAFKA_CFG_PROCESS_ROLES=controller,broker \
  -e KAFKA_CFG_LISTENERS=PLAINTEXT://:9092,CONTROLLER://:9093 \
  -e KAFKA_CFG_ADVERTISED_LISTENERS=PLAINTEXT://localhost:9092 \
  -e KAFKA_CFG_CONTROLLER_QUORUM_VOTERS=0@kafka:9093 \
  -e KAFKA_CFG_CONTROLLER_LISTENER_NAMES=CONTROLLER \
  bitnami/kafka:latest
```

Databases (`ewallet_user_db`, `ewallet_wallet_db`, `ewallet_transaction_db`) and the `transaction-events` topic are created automatically on first run.

If your MySQL root password isn't `root`, update `spring.datasource.password` in each service's `application.properties`.

### 2. Start the backend services (each in its own terminal, in this order)

```bash
cd user-service && mvn spring-boot:run
cd wallet-service && mvn spring-boot:run
cd transaction-service && mvn spring-boot:run
cd api-gateway && mvn spring-boot:run
```

### 3. Start the frontend

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173`.

### 4. Try it out

1. Register a new account → you're issued a JWT and a zero-balance wallet is created.
2. Click **Add money** to top up your balance.
3. Register a second account in another browser/incognito window.
4. From the first account, click **Send money**, enter the second user's email, and send a transfer.
5. Check **History** on both accounts — the transfer shows up on both sides, built from the Kafka events `wallet-service` published.

## API reference

Each service exposes Swagger UI once running:

- `http://localhost:8081/swagger-ui.html` — user-service
- `http://localhost:8082/swagger-ui.html` — wallet-service
- `http://localhost:8083/swagger-ui.html` — transaction-service

Or go through the gateway at `http://localhost:8080/api/...` (see `API.md` for example requests).

## Design notes (for interview talking points)

- **Why microservices, not a monolith?** Each domain (identity, money movement, history) scales and fails independently. `transaction-service` can go down without blocking a single transfer, because the wallet write path doesn't wait on it.
- **Why Kafka instead of a direct REST call to record history?** Decoupling. The critical path (debit sender, credit recipient) commits in one DB transaction and returns immediately; building history is fire-and-forget. If `transaction-service` is restarted, it picks up exactly where it left off — Kafka retains the events.
- **Consistency:** the debit+credit happens inside a single `@Transactional` method using pessimistic row locks, with sender/recipient locked in a consistent (lower-id-first) order to avoid deadlocks on simultaneous mutual transfers.
- **Idempotency:** every Kafka event carries a transaction ID; `transaction-service` checks for an existing `(transactionId, type)` pair before inserting, so a redelivered message after a consumer crash doesn't create a duplicate history row.
- **At-least-once delivery:** the consumer uses manual offset acknowledgment, only committing after the DB write succeeds — so a crash mid-processing replays the event instead of silently dropping it.
- **JWT across services:** `user-service` issues tokens signed with a shared secret; `wallet-service` and `transaction-service` validate them locally without calling back to `user-service` on every request (stateless auth, no session store).

## Notes

- The JWT secret in `application.properties` is for local development only — in any real deployment, move it to an environment variable or a secrets manager, and use a different secret per environment.
- `wallet-service` calls `user-service` synchronously over REST to resolve a recipient's user ID by email during a transfer. In a larger system this would go through a service registry (e.g. Eureka) instead of a hardcoded `localhost` URL.
