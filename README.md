<!-- OmniQueue README • v0.2.x -->
<p align="center">
  <img src="https://dummyimage.com/400x120/000/fff&text=OmniQueue" alt="OmniQueue logo" />
</p>

> **One API – every queue.**  
> Ship messages through RabbitMQ, AWS SQS, Azure Service Bus, ActiveMQ, Kafka *(kafkajs or librdkafka)*, and NATS / JetStream without changing a line of business code. Plug in “magic” add-ons—delays, DLQ time-travel, tracing, idempotency, zero-drop reliability—when you need them.

---

## ✨ Key points

| 🔹 Core | 🔹 Magic add-ons |
|--------|----------------|
| Unified `Broker` interface with `send`, `receive`, explicit `ack()/nack()` | `later()` – cross-broker delayed messages |
| Queue autoprovisioning (streams / topics / queues) | Time-travel DLQ replay |
| Opt-in adapters (peerDeps) → *zero unused bytes* | OpenTelemetry auto-trace |
| Type-safe payloads, pluggable serializers | Idempotent consumer decorator |
| Tiny core (<10 kB) | Zero-Drop outbox for exactly-once publish |

---

## 🛠️ Install

```bash
# core + one adapter
npm i @omniqueue/core @omniqueue/rabbitmq amqplib

# Kafka with kafkajs driver
npm i @omniqueue/core @omniqueue/kafka @omniqueue/kafka-kafkajs kafkajs

# Kafka with native librdkafka
npm i @omniqueue/core @omniqueue/kafka @omniqueue/kafka-rdkafka node-rdkafka

# NATS / JetStream
npm i @omniqueue/core @omniqueue/nats @omniqueue/nats-natsjs nats
````

*Adapters use peer dependencies—install only what you need, nothing else is downloaded or bundled.*

---

## 🚀 Quick start

```ts
import { create } from "@omniqueue/core";
import "@omniqueue/rabbitmq";    // side-effect: registers adapter

const mq = await create("rabbitmq", { url: "amqp://localhost" });

await mq.send("tasks", { body: { id: 1 } });

await mq.receive("tasks", async msg => {
  console.log("got", msg.body);
  await msg.ack();              // explicit success
});
```

---

## ⚡ Turn on the magic

```ts
import { withScheduler }   from "@omniqueue/magic-scheduler";
import { withIdempotency } from "@omniqueue/magic-dlq";
import { withTracing }     from "@omniqueue/magic-trace";

const raw   = await create("kafka", { brokers: ["k:9092"] });
let broker  = withScheduler(raw);                 // later()
broker      = withIdempotency(broker, redis);     // dup-killer
broker      = withTracing(broker, { serviceName: "billing" });

await broker.later("emails", { body: payload }, "tomorrow 09:00");
```

### Extra reliability

```ts
import { withZeroDrop } from "@omniqueue/magic-zero-drop";

broker = withZeroDrop(broker, { outbox: "leveldb://./outbox" });
await broker.sendGuaranteed("orders", { body: order });
```

---

## 📦 Adapters

| Package                     | Broker                       | Notes                                       |
| --------------------------- | ---------------------------- | ------------------------------------------- |
| `@omniqueue/rabbitmq`       | RabbitMQ                     | needs `amqplib`                             |
| `@omniqueue/sqs`            | AWS SQS (Standard + FIFO)    | modular AWS SDK v3                          |
| `@omniqueue/azuresb`        | Azure Service Bus            | queues, topics, sessions                    |
| `@omniqueue/activemq`       | ActiveMQ (Artemis / Classic) | STOMP                                       |
| `@omniqueue/kafka` + driver | Kafka                        | pick `kafka-kafkajs` **or** `kafka-rdkafka` |
| `@omniqueue/nats` + driver  | NATS / JetStream             | pick `nats-natsjs`                          |

All adapters expose the same `send / receive / ack / nack` contract.

---

## 💡 Advanced snippets

<details>
<summary><strong>Delayed FIFO on SQS</strong></summary>

```ts
await broker.later("payments.fifo",
                   { body: {...}, id: "o-123" },
                   12 * 60 * 1000,                // 12 min
                   { groupId: "user-42" });
```

</details>

<details>
<summary><strong>Replay DLQ from last 24 h</strong></summary>

```ts
import { TimeTravelDLQ } from "@omniqueue/magic-dlq";

const dlq   = new TimeTravelDLQ(broker);
const stats = await dlq.replay({ since: "-24h" });
console.log(`Restored ${stats.restored}/${stats.scanned}`);
```

</details>

<details>
<summary><strong>OpenTelemetry sampling</strong></summary>

```ts
import { TraceIdRatioBasedSampler } from "@opentelemetry/sdk-trace-node";
broker = withTracing(broker, {
  serviceName: "search-svc",
  sampler: new TraceIdRatioBasedSampler(0.05)   // 5 %
});
```

</details>

---

## 🗺️ Roadmap

* CLI: `omniqueue doctor`, `omniqueue apply queues.yaml`
* gRPC/HTTP code-gen stubs
* Delay-topic poller container templates
* Dashboard plugin for Grafana / Prom-metrics

---

## 🤝 Contributing

1. Fork → `pnpm i` → `pnpm -r build`
2. Add tests (`pnpm test`) – Docker compose spins local RabbitMQ, LocalStack, etc.
3. Submit PR. All adapters follow the same driver interface; lint passes = merge.
