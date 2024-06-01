const mongoose = require("mongoose");

mongoose.set("strictQuery", true);
mongoose
  .connect(process.env.DATA_BASE)
  .then(() => console.log("Connexion à MongoDB réussie !"))
  .catch((error) => console.log("Connexion à MongoDB échouée !", error));
