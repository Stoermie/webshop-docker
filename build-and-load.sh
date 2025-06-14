
set -euo pipefail


services=(catalog customer cart order event)
frontend_dir="frontend"

for svc in "${services[@]}"; do
  echo "=== Building ${svc}-service ==="
  cd "${svc}-service"
  docker build -t "${svc}-service:arm64-latest" .
  echo "=== Loading ${svc}-service into k3s ==="
  docker save "${svc}-service:arm64-latest" | sudo k3s ctr image import -
  cd ..
done

echo "=== Building frontend ==="
cd "${frontend_dir}"
docker build -t frontend:arm64-latest .
echo "=== Loading frontend into k3s ==="
docker save frontend:arm64-latest | sudo k3s ctr image import -
cd ..
echo "✅ Alle Images gebaut und in k3s geladen."
