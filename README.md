# Filip Jovanov

Senior back-end engineer in Skopje. At Heart for Health ICT I work across three things: LLM features,
finance and billing systems, and the internal tooling the rest of the team builds on.

I tend to reach for a tool when a process is the bottleneck, which is where most of the work below
came from.

> **Most of my commits are on a work account**, so the contribution graph here is quieter than the
> work has been. The write-ups below cover what I actually spend my time on.

---

## Selected work

### LLM Runner · TypeScript, LangGraph, Ink, SQLite

An orchestrator that turns a written ticket into reviewed, tested, merged code. A team of LLM agents
implements the change, writes tests, and reviews it from independent perspectives, while a human
approves only the moments that matter: the interface contract and the final review.

Built as a LangGraph state machine with durable interrupts checkpointed to SQLite, so a run can pause
at a human gate for hours and resume exactly where it stopped. Each ticket runs in its own git
worktree, so many run in parallel against one repo without collisions, and nothing merges until lint,
typecheck and tests pass.

Developed by running it on itself. Roughly 100 tickets have gone through it to merge, across its own
codebase and a separate project.

### DepGraph · Go, Gin, sqlc, PostgreSQL, gonum, React, React Flow

A dependency graph service for a multi-repository organisation. A nightly job walks every Java
repository in the GitHub org, parses the Maven manifests, and builds a first-party dependency graph,
stored as an immutable snapshot per scan so trends can be compared over time.

The point is not visualisation but a decision. Two numbers per module, how many things depend on it
and how many it depends on, place it in a category that maps straight to an action: delete, merge
into its single caller, or keep. The front end renders the whole graph interactively and turns the
classification into a ranked consolidation backlog rather than a picture.

Currently 600 modules across 109 repositories with 1,959 dependencies, and 97 live consolidation
candidates.

### CDF Runner · Rust, tokio, sqlx, PostgreSQL

A dependency-aware scheduler for Google Cloud Data Fusion, in 870 lines of Rust across 7 modules.

A migration meant running 194 pipelines with 221 dependencies between them in a strict order,
previously sequenced by hand. The runner reads the graph from YAML, starts whatever is ready, sleeps
two minutes, reconciles against what actually happened, and repeats.

Three decisions make it safe to walk away from: the graph is validated before any API call, so a plan
naming a dependency that can never run aborts rather than silently stalling; a failure propagates
transitively in the same tick, so no compute is spent on input that will never arrive; and every
state transition is written to PostgreSQL, so a run is resumable rather than restartable.

### Liquibase toolchain · Rust, Go

Two tools for two halves of one problem: applying a very large changelog to every tenant of a
multi-tenant platform.

The first, in Rust, walks every Liquibase changeset, classifies it as DDL, DML or combined, and
reorganises an ad-hoc per-module changelog tree into ordered categories that apply cleanly to a fresh
tenant. The second, in Go, applies that changelog across many tenants in parallel with an adaptive
rate limit that scales concurrency based on live database performance, so the migration runs as fast
as the database allows without tipping it over.

---

## Security

**[CVE-2026-9704](https://www.cve.org/CVERecord?id=CVE-2026-9704)** · privilege escalation in
Keycloak's OAuth 2.0 token exchange (CVSS 6.8, CWE-1284).

It surfaced in production as roles not applying correctly. After rolling back, I spent three days
reproducing it and tracing the cause: an oversized `subject_token` JWT, past a 4,000-character limit,
was silently dropped rather than rejected, so the request fell back to client credentials and the
caller gained the permissions of the client's service account.

Reported upstream with a reproducible test. Patched in Keycloak 26.6.3, 26.4.13 and 26.7.0.

---

## Writing

**Optimization and Parallelization of Object-Relational Mappers** · IEEE, June 2023.
Optimising Spring Boot libraries that generate poor queries, and adding parallelism to query
execution.

---

## What I reach for

**Go** and **Rust** for tools and services · **Java / Spring Boot** at work · **TypeScript** where a
UI is needed · **PostgreSQL** underneath most of it · **LangGraph** for agent workflows.

Interests run from how drivers work to high-level design, and from C and Rust to Java and TypeScript.

---

## Elsewhere

[LinkedIn](https://www.linkedin.com/in/filip-jovanov-a84403225/)
