Um den Webshop auf einem neuen Rechner zum Laufen zu bringen, benötigt man eine funktionierende Kubernetes-Umgebung. In diesem Fall wird das leichtgewichtige Kubernetes-Setup k3s verwendet. Zuerst müssen die erforderlichen Tools installiert werden. Dazu gehören Docker, k3s, kubectl und Helm. Docker wird benötigt, um die Container zu betreiben. k3s bietet eine einfache Kubernetes-Distribution, kubectl dient zur Steuerung des Clusters, und Helm wird verwendet, um den Webshop per Chart zu deployen.

Zunächst sollte Docker auf dem Rechner installiert werden. Je nach Betriebssystem erfolgt dies über die offizielle Docker-Website oder einen Paketmanager (z. B. über apt oder brew). Nach der Docker-Installation kann k3s über einen einfachen Einzeiler installiert werden, nämlich mit dem Befehl
curl -sfL https://get.k3s.io | sh -.
Nach erfolgreicher Installation ist der Cluster sofort einsatzbereit. Damit kubectl korrekt mit dem k3s-Cluster verbunden ist, wird in der Shell der Befehl
export KUBECONFIG=/etc/rancher/k3s/k3s.yaml
ausgeführt. Dieser Schritt kann optional auch dauerhaft in der .bashrc oder .zshrc hinterlegt werden, um ihn nicht bei jedem Neustart erneut einzugeben.

Anschließend wird die ZIP-Datei des Projekts (zum Beispiel webshop-docker-main.zip) auf dem neuen Rechner entpackt, und man wechselt per Terminal in das Projektverzeichnis. Dies geschieht durch den Befehl
cd webshop-docker-main.
Im Verzeichnis befindet sich der Ordner helm/webshop, in dem sich das Helm-Chart für den Webshop befindet. Bevor das Chart deployed wird, sollte überprüft werden, ob im File values.yaml IP-Adressen oder externe URLs verwendet werden, die auf eine bestimmte Maschine zugeschnitten sind (z. B. 192.168.1.x). Diese IPs müssen ggf. durch die eigene IP-Adresse oder localhost ersetzt werden. Die IP-Adresse des Rechners lässt sich unter Linux oder macOS mit dem Befehl ip a oder ifconfig, unter Windows mit ipconfig herausfinden.

Sobald die Konfiguration angepasst ist, wird der Webshop per Helm installiert. Dazu wird im Terminal der Befehl
helm install webshop ./helm/webshop
ausgeführt. Optional kann eine spezifische Konfiguration mit übergeben werden, zum Beispiel durch
helm install webshop ./helm/webshop --set ingress.host=<DEINE_IP>.
Nach erfolgreichem Deployment werden die Services automatisch im k3s-Cluster gestartet.

Für den Zugriff auf den Webshop im Browser kann entweder ein lokaler Portforward verwendet oder direkt die externe IP mit dem Kubernetes-Service-Port aufgerufen werden. Ein lokaler Portforward wird beispielsweise durch den Befehl
kubectl port-forward svc/webshop-frontend 8080:80
aktiviert, woraufhin der Webshop unter http://localhost:8080 erreichbar ist. Alternativ kann man mit dem Befehl kubectl get services die aktuell vergebenen NodePorts und Cluster-IP-Adressen einsehen.

Damit im Webshop Artikel angezeigt werden, muss die Datenbank catalog-db mit Inhalten befüllt werden. Dazu verbindet man sich zunächst mit dem Datenbank-Pod. Den Namen des Pods findet man mit
kubectl get pods.
Ist der Name bekannt, z. B. catalog-db-7f9d7b75d5-xxxx, öffnet man eine Shell im Container mit dem Befehl
kubectl exec -it <pod-name> -- sh.
Dort wird der MySQL-Client gestartet, indem man
mysql -u <benutzername> -p
ausführt und das Passwort eingibt (dieses findet sich entweder direkt in der Helm-Konfiguration values.yaml oder kann mit kubectl get secret ausgelesen werden). Innerhalb der SQL-Shell wählt man dann die Datenbank catalog durch den Befehl
USE catalog;.
Nun kann folgender SQL-Befehl vollständig eingefügt werden, um die Artikeldaten zu laden:

sql
Kopieren
Bearbeiten
INSERT INTO articles (article_id, author, name, price, manufactor, book_category, description, image_url, isbn) VALUES
(1, 'J.K. Rowling', 'Harry Potter und der Stein der Weisen', 9.99, 'Bloomsbury', 'FANTASY', 'Der junge Harry Potter entdeckt, dass er ein Zauberer ist und beginnt sein erstes Jahr in Hogwarts.', 'https://covers.openlibrary.org/b/isbn/9783551354013-L.jpg', '9783551354013'),
(2, 'J.R.R. Tolkien', 'Der Herr der Ringe – Die Gefährten', 12.99, 'Klett-Cotta', 'FANTASY', 'Frodo Beutlin vertritt die Gefährten auf ihrer Mission, den Einen Ring zu zerstören.', 'https://covers.openlibrary.org/b/isbn/9783608939811-L.jpg', '9783608968490'),
(3, 'Michael Ende', 'Die unendliche Geschichte', 11.99, 'Carl-Auer', 'FANTASY', 'Bastian Balthasar Bux taucht in die magische Welt Phantásien ein, um sie vor dem Nichts zu retten.', 'https://covers.openlibrary.org/b/isbn/3522202600-L.jpg', '9783473580910'),
(4, 'Cornelia Funke', 'Tintenherz', 10.99, 'Dressler', 'FANTASY', 'Meggie entdeckt, dass ihr Vater Figuren aus Büchern in die Realität lesen kann.', 'https://covers.openlibrary.org/b/isbn/9783791504650-L.jpg', '9783791518860'),
(5, 'Daniel Kehlmann', 'Die Vermessung der Welt', 9.99, 'Rowohlt', 'POPULÄRE WISSENSCHAFT', 'Das Leben von Alexander von Humboldt und Carl Friedrich Gauß als kontrastierende Expedition.', 'https://covers.openlibrary.org/b/isbn/9783499241000-L.jpg', '9783499241000'),
(6, 'Frank Schätzing', 'Der Schwarm', 8.99, 'Bastei Lübbe', 'SCIENCE FICTION', 'Vor Peru verschwindet ein Fischer. Norwegische Ölbohrexperten stoßen auf merkwürdige Organismen, während Wale an der Küste von British Columbia unheimlich reagieren. Nichts scheint zusammenzuhängen – doch Biologe Sigur Johanson glaubt nicht an Zufälle.', 'https://covers.openlibrary.org/b/isbn/9783462033748-L.jpg', '3596294312'),
(7, 'Thomas Mann', 'Buddenbrooks', 7.99, 'Fischer Klassik', 'KLASSIK', 'Mit dem Ende von Hanno Buddenbrook stirbt eine Kaufmannsfamilie aus Lübeck aus – und beginnt zugleich Thomas Manns literarischer Aufstieg.', 'https://covers.openlibrary.org/b/isbn/3596294312-L.jpg', '3596294312'),
(8, 'Paulo Coelho', 'Der Alchimist', 21.99, 'Diogenes', 'PHILOSOPHIE', 'Der Hirte Santiago träumt von einem Schatz in Ägypten. Auf seiner Reise erkennt er, dass der wahre Schatz in seiner persönlichen Legende liegt.', 'https://covers.openlibrary.org/b/isbn/9783257237276-L.jpg', '9783257237276'),
(9, 'Sten Nadolny', 'Die Entdeckung der Langsamkeit', 22.99, 'Piper', 'BIOGRAFIE', 'Fiktive Biografie des britischen Polarforschers John Franklin, dessen Langsamkeit zur Stärke wird.', 'https://covers.openlibrary.org/b/isbn/9783492207003-L.jpg', '9783492207003'),
(10, 'Philip Pullman', 'Der Goldene Kompass', 24.99, 'Carlsen', 'FANTASY', 'Lyra entdeckt in einer parallelen Welt eine gefährliche Verschwörung. Mit Mut und Neugier kämpft sie für die Wahrheit.', 'https://covers.openlibrary.org/b/isbn/9783551351234-L.jpg', '9783551351234'),
(11, 'J.R.R. Tolkien', 'Der Herr der Ringe', 39.99, 'Klett-Cotta', 'FANTASY', 'Tolkiens Klassiker mit Illustrationen von Alan Lee: Die epische Reise von Frodo zur Vernichtung des Einen Rings beginnt.', 'https://covers.openlibrary.org/b/isbn/360896035X-L.jpg', '360896035X'),
(12, 'Patrick Süskind', 'Das Parfum: Die Geschichte eines Mörders', 18.99, 'Diogenes', 'ROMAN', 'Jean-Baptiste Grenouille strebt nach dem perfekten Duft – um jeden Preis.', 'https://covers.openlibrary.org/b/isbn/9783257228007-L.jpg', '9783257228007'),
(13, 'Gabriel García Márquez', 'Hundert Jahre Einsamkeit', 18.99, 'Fischer', 'MAGISCHER_REALISMUS', 'Sieben Generationen der Familie Buendía in Macondo – eine Geschichte von Magie, Einsamkeit und Wiederholung.', 'https://covers.openlibrary.org/b/isbn/3596509815-L.jpg', '3596509815'),
(14, 'Jane Austen', 'Stolz und Vorurteil', 12.99, 'Anaconda', 'KLASSIKER', 'Elizabeth Bennet und Mr. Darcy kämpfen mit Stolz und Vorurteilen auf dem Weg zur wahren Liebe.', 'https://covers.openlibrary.org/b/isbn/3868206388-L.jpg', '9783866473560'),
(15, 'Cornelia Funke', 'Tintenblut', 22.90, 'Dressler', 'FANTASY', 'Meggie kehrt in die Tintenwelt zurück und muss entscheiden, wie sie ihre Gabe einsetzt, um das Gleichgewicht zu wahren.', 'https://covers.openlibrary.org/b/isbn/9783791504674-L.jpg', '9783791504674'),
(16, 'George R. R. Martin', 'Das Lied von Eis und Feuer – Die dunkle Königin', 18.00, 'Blanvalet', 'FANTASY', 'Intrigen, Macht und Krieg in Westeros – Cersei kämpft um die Kontrolle über das Reich.', 'https://covers.openlibrary.org/b/isbn/9783442244164-L.jpg', '9783442244164'),
(17, 'William Shakespeare', 'Romeo und Julia', 12.99, 'Galiani', 'KLASSIKER', 'Die wohl berühmteste Liebesgeschichte aller Zeiten – über Liebe, Hass und tragisches Schicksal.', 'https://covers.openlibrary.org/b/isbn/9783869711423-L.jpg', '9783869711423');
Nachdem diese Daten eingefügt sind, ist der Webshop einsatzbereit. Alle Services laufen im k3s-Cluster, der Shop ist erreichbar, und die Produktdaten sind verfügbar. Falls zu einem späteren Zeitpunkt Änderungen notwendig sind, lässt sich das Deployment mit dem Befehl helm upgrade webshop ./helm/webshop aktualisieren. Möchte man das Deployment vollständig entfernen, nutzt man den Befehl helm uninstall webshop. Für Debugging stehen die Kommandos kubectl logs <pod-name> sowie kubectl describe pod <pod-name> zur Verfügung, um mögliche Probleme bei der Ausführung zu identifizieren.

Damit ist der gesamte Webshop auf einem neuen Rechner erfolgreich installiert, konfiguriert, befüllt und lauffähig – alles auf Basis von Docker, k3s, Helm und Kubernetes.