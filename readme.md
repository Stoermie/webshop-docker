# 📦 Webshop Deployment mit Helm und k3s

Diese Anleitung beschreibt Schritt für Schritt, wie du den Webshop auf einem neuen Rechner mithilfe von [k3s](https://k3s.io/), [Docker](https://www.docker.com/), [Helm](https://helm.sh/), und [kubectl](https://kubernetes.io/docs/tasks/tools/) installieren und starten kannst – inklusive der Initialisierung der Datenbank mit Beispielartikeln.

---

## ✅ Voraussetzungen

Stelle sicher, dass folgende Tools auf dem System installiert sind:

- [Docker](https://www.docker.com/)
- [k3s](https://k3s.io/)
- [kubectl](https://kubernetes.io/docs/tasks/tools/)
- [Helm](https://helm.sh/)

Alternativ kannst du `k3s` verwenden, das einen Kubernetes-Cluster mit `kubectl` direkt mitliefert.

---

## 🧩 1. k3s installieren

curl -sfL https://get.k3s.io | sh -
Nach der Installation kannst du den Status des Clusters prüfen:

kubectl get nodes
---

## 📁 2. Projekt klonen
Lade den Quellcode auf deinen Rechner:

git clone https://github.com/dein-benutzername/dein-webshop-repo.git
cd dein-webshop-repo
## 📦 3. Helm installieren (falls noch nicht installiert)
Helm auf macOS/Linux:


curl https://raw.githubusercontent.com/helm/helm/master/scripts/get-helm-3 | bash
Für Windows: Offizielle Helm-Dokumentation

## 🚀 4. Helm-Chart deployen
Wechsle ins Helm-Verzeichnis (z. B. ./helm oder ./charts, je nach Struktur) und führe aus:

helm install webshop ./webshop-chart
Hinweis: Falls du Werte anpassen musst (z. B. IP-Adressen, Ports), bearbeite vorher die values.yaml.

Den Status der Pods prüfen:

kubectl get pods
## 🌐 5. Zugriff auf den Webshop
Wenn der Service als NodePort definiert ist, kannst du mit folgender IP darauf zugreifen:

http://<DEINE-K3S-IP>:<NODEPORT>
Die IP findest du mit:

hostname -I
Den Port liest du mit folgendem Befehl aus:

kubectl get service

## 🛠️ 6. Datenbank initialisieren
Sobald der Pod der Datenbank (z. B. catalog-db) läuft, kannst du dich wie folgt mit der Datenbank verbinden:

kubectl exec -it <catalog-db-pod-name> -- mysql -u root -p
Das Passwort entnimmst du ggf. dem Secret oder der values.yaml. Danach gib Folgendes ein:

Datenbank auswählen:
USE catalog-db;
Beispielhafte Artikel einfügen:

INSERT INTO articles (article_id, author, name, price, manufactor, book_category, description, image_url, isbn) VALUES
(1, 'J.K. Rowling', 'Harry Potter und der Stein der Weisen', 9.99, 'Bloomsbury', 'FANTASY', 'Der junge Harry Potter entdeckt, dass er ein Zauberer ist und beginnt sein erstes Jahr in Hogwarts.', 'https://covers.openlibrary.org/b/isbn/9783551354013-L.jpg', '9783551354013'),
(2, 'J.R.R. Tolkien', 'Der Herr der Ringe – Die Gefährten', 12.99, 'Klett-Cotta', 'FANTASY', 'Frodo Beutlin vertritt die Gefährten auf ihrer Mission, den Einen Ring zu zerstören.', 'https://covers.openlibrary.org/b/isbn/9783608939811-L.jpg', '9783608968490'),
(3, 'Michael Ende', 'Die unendliche Geschichte', 11.99, 'Carl-Auer', 'FANTASY', 'Bastian Balthasar Bux taucht in die magische Welt Phantásien ein, um sie vor dem Nichts zu retten.', 'https://covers.openlibrary.org/b/isbn/3522202600-L.jpg', '9783473580910'),
(4, 'Cornelia Funke', 'Tintenherz', 10.99, 'Dressler', 'FANTASY', 'Meggie entdeckt, dass ihr Vater Figuren aus Büchern in die Realität lesen kann.', 'https://covers.openlibrary.org/b/isbn/9783791504650-L.jpg', '9783791518860'),
(5, 'Daniel Kehlmann', 'Die Vermessung der Welt', 9.99, 'Rowohlt', 'POPULÄRE WISSENSCHAFT', 'Das Leben von Humboldt und Gauß als kontrastierende Expedition.', 'https://covers.openlibrary.org/b/isbn/9783499241000-L.jpg', '9783499241000');
🧹 7. Optional: Webshop deinstallieren
Falls du den Webshop wieder entfernen möchtest:

helm uninstall webshop
💡 Tipps
Nutze kubectl get all für eine Übersicht aller Ressourcen.

Anpassungen an der Konfiguration können direkt in values.yaml oder über die helm upgrade-Funktion erfolgen.

Für eine produktive Umgebung sollten Volumes persistiert und Secrets gesichert werden.

📎 Weiterführende Links
K3s Dokumentation

Helm Doku

Kubernetes Basics

Markdown-Guide
