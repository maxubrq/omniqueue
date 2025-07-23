<!-- OmniQueue README v0.1.0 -->

<p align="center">
  <a href="#" target="_blank">
    <img src="https://dummyimage.com/600x200/000/fff&text=OmniQueue" alt="OmniQueue logo" />
  </a>
</p>

<h1 align="center">OmniQueue</h1>

<p align="center">
  <em>One API – any queue.</em><br>
  Unified, plug‑in message‑queue client for TypeScript covering RabbitMQ, AWS SQS, Azure Service Bus & ActiveMQ.
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/@omniqueue/core"><img src="https://img.shields.io/npm/v/@omniqueue/core?color=cb3837" alt="npm version" /></a>
  <img src="https://img.shields.io/badge/TypeScript-5.5-blue" alt="TypeScript" />
  <img src="https://img.shields.io/badge/License-MIT-green" alt="MIT license" />
</p>

---

## ✨ Why OmniQueue?

* **One surface.** Swap out the broker, keep the code.
* **Tiny core.** < 10 kB, adapters opt‑in via peer dependencies.
* **Retries & DLQ** baked in via decorators.
* **Serializer plug‑ins.** JSON by default, Avro/Protobuf optional.
* **Instrumentation hooks.** OpenTelemetry‑ready without coupling.

---

## 📦 Monorepo layout

| Package               | Description                  | Peer Deps         |
| --------------------- | ---------------------------- | ----------------- |
| `@omniqueue/core`     | Contracts, registry, factory | —                 |
| `@omniqueue/rabbitmq` | RabbitMQ adapter (amqplib)   | `@omniqueue/core` |
| `@omniqueue/sqs`      | AWS SQS adapter (AWS SDK v3) | `@omniqueue/core` |
| `@omniqueue/azuresb`  | Azure Service Bus adapter    | `@omniqueue/core` |
| `@omniqueue/activemq` | ActiveMQ adapter (STOMP)     | `@omniqueue/core` |

---

## 🚀 Quick start

```bash
# choose only the adapter you need
npm i @omniqueue/core @omniqueue/rabbitmq amqplib
```

```ts
import { create } from "@omniqueue/core"
import "@omniqueue/rabbitmq"          // side‑effect: registers adapter

(async () => {
  const mq = await create("rabbitmq", { url: "amqp://localhost" })

  await mq.send("jobs", { body: { id: "42" } })

  await mq.receive("jobs", async m => {
    console.log("got", m.body)
  })
})();
```

> 🔄 Switch to SQS? Install `@omniqueue/sqs` + `@aws-sdk/client-sqs`, change provider string to `"sqs"` – done.

---

## 🛠 Concepts & API

```ts
interface Message<T = unknown> { id?: string; body: T }
interface Broker {
  send(queue: string, msg: Message): Promise<void>
  receive(queue: string, handler: (m: Message) => Promise<void>): Promise<void>
  close(): Promise<void>
}
```

* **Retries** – wrap with `RetryBroker` (exponential back‑off default).
* **Dead‑letter** – specify `deadLetter` in `QueueDefinition`; adapters auto‑wire DLQ.
* **Fan‑out** – use `produce()` / `subscribe()` on brokers that support topics.
* **Serializer** – implement `{ serialize, deserialize }` and pass to factory.

---

## 🪄 Dynamic loading

Adapters self‑register via `register()` during import. Core falls back to dynamic `import("@omniqueue/${provider}")` if registry miss – giving you **fail‑fast** errors when a package is missing.

---

## 📈 Roadmap

* [ ] Delayed/ scheduled messages (Rabbit x‑delay, SQS delay, Azure SB scheduled).
* [ ] Testcontainers‑powered integration test suite.
* [ ] CLI (`npx omniqueue`) to purge, peek, DLQ re‑drive.
* [ ] Exactly‑once helpers (Rabbit publisher confirms, SQS FIFO dedup).

---

## 🤝 Contributing

1. `pnpm i`
2. `pnpm -r build`
3. Run `pnpm test`
4. Submit PR – remember **one feature per PR**.

We operate under the [Contributor Covenant](CODE_OF_CONDUCT.md).

---

## 📜 License

MIT © 2025 OmniQueue Contributors
