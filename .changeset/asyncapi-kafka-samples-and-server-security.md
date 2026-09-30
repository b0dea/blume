---
"blume": patch
---

AsyncAPI `kcat` samples now follow the Kafka bindings and the server's security. A channel binding's `topic` replaces the channel address, a message binding's `key` keys the message (`key|payload` with `-K '|'`), and a server that declares a SASL scheme adds the `-X` settings librdkafka needs, reading the credentials from `$KAFKA_USERNAME` and `$KAFKA_PASSWORD`, with TLS for `kafka-secure`. When a channel's servers declare different security, the Authorization section names the servers each scheme applies to and those that need none, instead of marking every scheme required everywhere.
