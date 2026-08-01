# Filip Jovanov

Senior back-end engineer in Skopje. At Heart for Health ICT I work across three things: LLM features,
finance and billing systems, and the internal tooling the rest of the team builds on.

I tend to reach for a tool when a process is the bottleneck, which is where most of the work below
came from.

**Most of my commits are on a work account**
([@filip-jovanov-h4h](https://github.com/filip-jovanov-h4h), 575 contributions in the last year), so
the graph on this profile is quieter than the work has been.

---

## LLM Runner

**TypeScript · LangGraph · Ink · SQLite**

An orchestrator that turns a written ticket into reviewed, tested, merged code. A team of LLM agents
implements the change, writes tests, and reviews it from independent perspectives, while a human
approves only the moments that matter: the interface contract and the final review.

It is a LangGraph state machine with durable interrupts checkpointed to SQLite, so a run can pause at
a human gate for hours and resume exactly where it stopped. Each ticket runs in its own git worktree,
so many run in parallel against one repo without collisions, and nothing merges until lint, typecheck
and tests pass.

Developed by running it on itself. Roughly 100 tickets have gone through it to merge, across its own
codebase and a separate project.

---

## Also built

**DepGraph** · Go, PostgreSQL, gonum, React
Nightly scan of every Java repo in a GitHub org, parsing Maven manifests into a first-party
dependency graph stored as an immutable snapshot per scan. Two numbers per module, in-degree and
out-degree, classify it and map that class to an action: delete, merge into its single caller, or
keep. Currently 600 modules across 109 repositories, 1,959 dependencies, 97 live consolidation
candidates. The output is a ranked backlog, not a picture.

**CDF Runner** · Rust, tokio, sqlx, PostgreSQL
A dependency-aware scheduler for Google Cloud Data Fusion, 870 lines across 7 modules. 194 pipelines
with 221 dependencies, previously sequenced by hand. Validates the graph before any API call so an
impossible plan aborts rather than stalls, propagates failure transitively so no compute is spent on
input that will never arrive, and writes every state transition to Postgres so a run is resumable
rather than restartable.

**Liquibase toolchain** · Rust, Go
Two tools for two halves of one problem. The Rust one classifies every changeset as DDL, DML or
combined and reorganises an ad-hoc changelog tree into ordered categories. The Go one applies it
across many tenants in parallel, with an adaptive rate limit driven by live database performance.

**CI pipeline optimisation** · Maven, GitHub Actions
Build caching, cache scoping and cost-based integration-test sharding. Wall time 12.7 to 8.5–9.1
minutes, runner-minutes 65.8 to 47–49.5, cache written per run 7.9 GB to about 945 MB.

---

## [CVE-2026-9704](https://www.cve.org/CVERecord?id=CVE-2026-9704)

Privilege escalation in Keycloak's OAuth 2.0 token exchange. CVSS 6.8, CWE-1284.

It surfaced in production as roles not applying correctly. After rolling back, I spent three days
reproducing it: an oversized `subject_token` JWT, past a 4,000-character limit, was silently dropped
rather than rejected, so the request fell back to client credentials and the caller gained the
permissions of the client's service account. Reported upstream with a reproducible test, and patched
in Keycloak 26.6.3, 26.4.13 and 26.7.0.

---

## Elsewhere

**Optimization and Parallelization of Object-Relational Mappers**, IEEE, June 2023. Optimising Spring
Boot libraries that generate poor queries, and adding parallelism to query execution.

[LinkedIn](https://www.linkedin.com/in/filip-jovanov-a84403225/) · Go and Rust for tools, Java and
Spring Boot at work, TypeScript where a UI is needed, PostgreSQL underneath most of it.
