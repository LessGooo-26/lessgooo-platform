#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
source deploy/tool-versions.env
destination="$(pwd)/.local-data/devsecops-tools/bin"
mkdir -p "$destination"
install_release() {
  local repo="$1" version="$2" asset="$3" checksum="$4" binary="$5"
  local archive
  archive="$(mktemp)"
  curl --fail --silent --show-error --location --retry 3 "https://github.com/$repo/releases/download/v$version/$asset" -o "$archive"
  printf '%s  %s\n' "$checksum" "$archive" | sha256sum --check --status
  tar -xzf "$archive" -C "$destination" "$binary"
  rm "$archive"
}
install_release aquasecurity/trivy "$TRIVY_VERSION" "trivy_${TRIVY_VERSION}_Linux-64bit.tar.gz" "$TRIVY_SHA256" trivy
install_release gitleaks/gitleaks "$GITLEAKS_VERSION" "gitleaks_${GITLEAKS_VERSION}_linux_x64.tar.gz" "$GITLEAKS_SHA256" gitleaks
install_release yannh/kubeconform "$KUBECONFORM_VERSION" kubeconform-linux-amd64.tar.gz "$KUBECONFORM_SHA256" kubeconform
install_release rhysd/actionlint "$ACTIONLINT_VERSION" "actionlint_${ACTIONLINT_VERSION}_linux_amd64.tar.gz" "$ACTIONLINT_SHA256" actionlint
helm_archive="$(mktemp)"
curl --fail --silent --show-error --location --retry 3 "https://get.helm.sh/helm-v${HELM_VERSION}-linux-amd64.tar.gz" -o "$helm_archive"
printf '%s  %s\n' "$HELM_SHA256" "$helm_archive" | sha256sum --check --status
tar -xzf "$helm_archive" -C "$destination" linux-amd64/helm
mv "$destination/linux-amd64/helm" "$destination/helm"
rm "$helm_archive"
curl --fail --silent --show-error --location --retry 3 "https://dl.k8s.io/release/v${KUBECTL_VERSION}/bin/linux/amd64/kubectl" -o "$destination/kubectl"
printf '%s  %s\n' "$KUBECTL_SHA256" "$destination/kubectl" | sha256sum --check --status
chmod +x "$destination/kubectl"
if [[ -n "${GITHUB_PATH:-}" ]]; then printf '%s\n' "$destination" >> "$GITHUB_PATH"; fi
printf 'Installed verified tools in %s\n' "$destination"
