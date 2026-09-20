#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
source deploy/tool-versions.env
if [[ "$(kubectl config current-context)" != lessgooo-lab ]]; then
  echo "Select the dedicated lessgooo-lab context before installing." >&2
  exit 1
fi
kubectl -n monitoring get secret grafana-admin >/dev/null
helm repo add traefik https://traefik.github.io/charts
helm repo add argo https://argoproj.github.io/argo-helm
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo update
kubectl apply -f deploy/eks/storageclass.yaml
helm upgrade --install monitoring prometheus-community/kube-prometheus-stack --namespace monitoring --create-namespace --version "$MONITORING_CHART_VERSION" -f deploy/helm/monitoring-values.yaml --wait --timeout 15m
helm upgrade --install blackbox prometheus-community/prometheus-blackbox-exporter --namespace monitoring --version "$BLACKBOX_CHART_VERSION" -f deploy/helm/blackbox-values.yaml --wait --timeout 5m
helm upgrade --install traefik traefik/traefik --namespace traefik --create-namespace --version "$TRAEFIK_CHART_VERSION" -f deploy/helm/traefik-values.yaml --wait --timeout 5m
helm upgrade --install argocd argo/argo-cd --namespace argocd --create-namespace --version "$ARGOCD_CHART_VERSION" -f deploy/helm/argocd-values.yaml --wait --timeout 10m
kubectl apply -f deploy/monitoring/
