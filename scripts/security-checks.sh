#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
source deploy/tool-versions.env
export PATH="$(pwd)/.local-data/devsecops-tools/bin:$PATH"
mkdir -p reports
actionlint
gitleaks git --redact --no-banner --report-format json --report-path reports/gitleaks.json
docker run --rm --user "$(id -u):$(id -g)" -e SEMGREP_SEND_METRICS=off -e SEMGREP_ENABLE_VERSION_CHECK=0 -e HOME=/tmp -v "$PWD:/src:ro" -w /src "$SEMGREP_IMAGE" semgrep scan --config security/semgrep.yaml --error --metrics off --json src server > reports/semgrep.json
trivy fs --include-dev-deps --scanners vuln,secret,misconfig --severity HIGH,CRITICAL --exit-code 1 --skip-dirs 'node_modules,.local-data,.git,dist,dist-server,reports,.reference-*,backups' --format json --output reports/trivy-source.json .
kubectl kustomize deploy/k8s/overlays/eks > reports/campus.yaml
kubeconform -strict -summary -kubernetes-version 1.35.0 reports/campus.yaml deploy/eks/storageclass.yaml
trivy config --severity HIGH,CRITICAL --exit-code 1 reports/campus.yaml

# Render official pinned infrastructure charts without contacting a cluster.
helm repo add traefik https://traefik.github.io/charts
helm repo add argo https://argoproj.github.io/argo-helm
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm template traefik traefik/traefik --version "$TRAEFIK_CHART_VERSION" --namespace traefik --api-versions monitoring.coreos.com/v1 -f deploy/helm/traefik-values.yaml > reports/traefik.yaml
helm template monitoring prometheus-community/kube-prometheus-stack --version "$MONITORING_CHART_VERSION" --namespace monitoring -f deploy/helm/monitoring-values.yaml > reports/monitoring.yaml
helm template blackbox prometheus-community/prometheus-blackbox-exporter --version "$BLACKBOX_CHART_VERSION" --namespace monitoring -f deploy/helm/blackbox-values.yaml > reports/blackbox.yaml
helm template argocd argo/argo-cd --version "$ARGOCD_CHART_VERSION" --namespace argocd -f deploy/helm/argocd-values.yaml > reports/argocd.yaml
