require("dotenv").config();

const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

const TOKEN = process.env.META_ACCESS_TOKEN;
const API = "https://graph.facebook.com/v25.0";

app.get("/", (req, res) => {
  res.send("Meta Ads MCP Running");
});

app.get("/adaccounts", async (req, res) => {
  try {
    const response = await axios.get(
      `${API}/me/adaccounts`,
      {
        params: {
          access_token: TOKEN
        }
      }
    );

    res.json(response.data);
  } catch (err) {
    res.status(500).json(err.response?.data || err.message);
  }
});

app.get("/campaigns/:adAccountId", async (req, res) => {
  try {
    const response = await axios.get(
      `${API}/act_${req.params.adAccountId}/campaigns`,
      {
        params: {
          access_token: TOKEN
        }
      }
    );

    res.json(response.data);
  } catch (err) {
    res.status(500).json(err.response?.data || err.message);
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});
