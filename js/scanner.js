document.addEventListener("DOMContentLoaded", () => {
  let scannedData = [];

  function startScanner(password) {
    if (password !== "your_password_here") {
      alert("Password errata. Accesso negato.");
      return;
    }
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      alert("Il tuo browser non supporta l'accesso alla fotocamera.");
      return;
    }

    const scanner = new Html5Qrcode("reader");
    scanner.start(
      { facingMode: "environment" },
      { fps: 10, qrbox: 250 },
      onScanSuccess,
      (errorMessage) => {
        console.warn("Errore scanner:", errorMessage);
      }
    ).catch(err => {
      console.error("Errore nell'avvio della fotocamera:", err);
      alert("Errore nell'avvio della fotocamera. Controlla i permessi del browser.");
    });
  }

  function onScanSuccess(decodedText) {
    const extractedData = validateQRCode(decodedText);
    if (extractedData) {
      if (!scannedData.some(item => item.matricola === extractedData.matricola)) {
        extractedData.timestamp = new Date().toLocaleString();
        scannedData.push(extractedData);
        document.getElementById('status').innerText = `QR Registrato: ${extractedData.nome} ${extractedData.cognome}`;
        updateScanList();
      } else {
        document.getElementById('status').innerText = 'QR già registrato.';
      }
    } else {
      document.getElementById('status').innerText = 'Formato QR non valido.';
    }
  }

  function updateScanList() {
    const listElement = document.getElementById('scanned-items');
    listElement.innerHTML = '';
    scannedData.forEach((item, index) => {
      const listItem = document.createElement('li');
      listItem.textContent = `${index + 1}. ${item.nome} ${item.cognome} - ${item.matricola}`;
      listElement.appendChild(listItem);
    });
  }

  function validateQRCode(data) {
    const regex = /^STUDENT\|([A-Za-zÀ-ÖØ-öø-ÿ]+):([A-Za-zÀ-ÖØ-öø-ÿ]+):(\d+)$/;
    const match = data.match(regex);
    return match ? { nome: match[1], cognome: match[2], matricola: match[3] } : null;
  }

  async function sendEmailPDF() {
    const pdfBlob = await generatePDF();
    if (!pdfBlob) return;

    const date = new Date().toLocaleDateString().replace(/\//g, '-');
    const file = new File([pdfBlob], `Scansioni_QR_${date}.pdf`, { type: 'application/pdf' });
    const formData = new FormData();
    formData.append('file', file);

    const button = document.getElementById('send-email');
    button.disabled = true;
    button.textContent = "Invio in corso...";

    try {
      const response = await fetch('http://localhost:3000/send-email', {
        method: 'POST',
        body: formData
      });
      if (!response.ok) throw new Error('Errore nella richiesta');
      alert('Email inviata con successo!');
    } catch (error) {
      alert('Errore nell\'invio della email.');
      console.error(error);
    } finally {
      button.disabled = false;
      button.textContent = "Invia via Email";
    }
  }

  document.getElementById('start-scanner').addEventListener('click', () => {
    const password = prompt("Inserisci la password:");
    startScanner(password);
  });

  document.getElementById('send-email').addEventListener('click', sendEmailPDF);
});
