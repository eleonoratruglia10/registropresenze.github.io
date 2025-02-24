const express = require("express");
const nodemailer = require("nodemailer");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

app.post("/send-email", async (req, res) => {
  const { email, content } = req.body;

  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "TUO_EMAIL@gmail.com",
        pass: "TUA_PASSWORD_APP", // Usa password applicativa o token
      },
    });

    const mailContent = `
      <h3>Elenco Codici QR Scansionati:</h3>
      <ul>
        ${content.map((item) => `<li>${item}</li>`).join("")}
      </ul>
    `;

    await transporter.sendMail({
      from: "TUO_EMAIL@gmail.com",
      to: email,
      subject: "Scansioni QR",
      html: mailContent,
    });

    res.status(200).send("Email inviata.");
  } catch (error) {
    console.error(error);
    res.status(500).send("Errore invio email.");
  }
});

app.listen(3000, () => console.log("Server in esecuzione su http://localhost:3000"));
