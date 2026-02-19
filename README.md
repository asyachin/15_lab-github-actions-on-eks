# Frontend ⇄ Backend on EKS with API Gateway & CI/CD

Short summary of what this lab did, what’s in place, and the main decisions made.

---

## What we built

- **Frontend** (static HTML/CSS/JS behind nginx) and **backend** (Node.js, `/api/ping`, health checks) running on **EKS**.
- **Traefik** as API Gateway: one hostname, path-based routing — `/` → frontend, `/api/*` → backend.
- **GitHub Actions** pipeline: build images → push to Docker Hub → deploy to EKS (apply manifests, set image tags, wait for rollouts).

So: push to the configured branch → images are built and the app is updated in the cluster.

---

## Tasks done

1. Set up EKS access (kubeconfig, namespace).
2. Installed and configured **Traefik** via Helm (Gateway API: Gateway + HTTPRoute).
3. Deployed app manifests from **`k8/`** (services, deployments, gateway, httproute).
4. Wired **CI/CD** so that build and deploy run on push; images are tagged with commit SHA and `latest`.
5. Verified routing locally (and optionally via public DNS): one URL for both UI and API.

---

## What’s in the repo

- **`backend/`** — Node app (Express), Dockerfile.
- **`frontend/`** — static site + nginx, Dockerfile.
- **`k8/`** — Kubernetes manifests (services, deployments, Gateway, HTTPRoute, optional Ingress). **Not** `k8s/`; the workflow uses `k8/` everywhere.
- **`.github/workflows/cicd.yml`** — build (matrix: backend, frontend) and deploy (AWS auth, kubectl apply, set image, rollout status, optional smoke test).

Secrets (AWS, Docker Hub, cluster name, namespace, host) are in GitHub Actions secrets; no `.env` in the repo.

---

## Decisions and fixes

- **Manifest paths:** All apply commands use **`k8/`** (e.g. `k8/gateway.yaml`). Using `k8s/` would break the workflow because that folder doesn’t exist.
- **Traefik Gateway API:** Used Gateway + HTTPRoute instead of (or in addition to) classic Ingress. Helm values for Traefik use **object-style** `gateway.listeners` (e.g. `web: { port: 80 }`), not an array, to avoid “no matching entryPoint” errors.
- **Apply syntax:** Always **`kubectl apply -f <file>`** (with `-f`). Without `-f`, filenames are treated as invalid arguments.
- **Smoke test:** The pipeline can call `http://${HOST}/api/ping` from the runner. If the domain isn’t reachable from the internet (e.g. only in `/etc/hosts` locally), that step fails. Options: set up public DNS for the host, or add **`continue-on-error: true`** to the smoke step so the workflow still succeeds when the app is only reachable inside your network.
- **Variables vs secrets:** Workflow env names (e.g. `K8S_NAMESPACE`, `HOST`, `DOCKERHUB_USERNAME`) match the GitHub secrets used; image names use the same username/org so `kubectl set image` works.

---

## Quick run

- **Deploy:** Push to the branch that triggers the workflow (e.g. `main` or `labs/dev`). Pipeline builds, pushes, and deploys.
- **Local check (with Host header):**  
  `curl -H "Host: alex.diogohack.shop" http://<Traefik-LB-hostname>/api/ping`  
  or, if DNS or `/etc/hosts` points the host to the LB:  
  `curl http://alex.diogohack.shop/api/ping`
- **Browser:** Open `http://<your-host>` (same as `HOST` in secrets) to see the frontend and use “Check backend” for the API.

A more detailed, step-by-step and troubleshooting guide is in **`conspects/api_gateway-cicd.md`** in the parent workspace (if available).
