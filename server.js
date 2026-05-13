import express from "express";
import axios from "axios";
import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";

const app = express();
app.use(express.json());

const TOKEN = process.env.META_ACCESS_TOKEN;
const API = "https://graph.facebook.com/v25.0";

function createMcpServer() {
  const server = new McpServer({
    name: "Meta Ads MCP",
    version: "1.0.0"
  });

  server.registerTool(
    "get_ad_accounts",
    {
      title: "Get Meta ad accounts",
      description: "List Meta ad accounts available to the connected user.",
      inputSchema: {}
    },
    async () => {
      const res = await axios.get(`${API}/me/adaccounts`, {
        params: {
          access_token: TOKEN,
          fields: "id,name,account_id,currency,timezone_name"
        }
      });

      return {
        content: [{ type: "text", text: JSON.stringify(res.data, null, 2) }]
      };
    }
  );

  server.registerTool(
    "get_campaigns",
    {
      title: "Get Meta campaigns",
      description: "List campaigns from a Meta ad account.",
      inputSchema: {
        adAccountId: z.string().describe("Ad account ID without act_")
      }
    },
    async ({ adAccountId }) => {
      const res = await axios.get(`${API}/act_${adAccountId}/campaigns`, {
        params: {
          access_token: TOKEN,
          fields: "id,name,status,objective,created_time,updated_time"
        }
      });

      return {
        content: [{ type: "text", text: JSON.stringify(res.data, null, 2) }]
      };
    }
  );

  server.registerTool(
    "get_ad_insights",
    {
      title: "Get Meta ad insights",
      description: "Get spend, impressions, clicks, CPM, CPC, CTR, and results.",
      inputSchema: {
        adAccountId: z.string().describe("Ad account ID without act_"),
        datePreset: z.string().default("last_7d").describe("Example: today, yesterday, last_7d, last_30d"),
        level: z.string().default("campaign").describe("campaign, adset, or ad")
      }
    },
    async ({ adAccountId, datePreset, level }) => {
      const res = await axios.get(`${API}/act_${adAccountId}/insights`, {
        params: {
          access_token: TOKEN,
          date_preset: datePreset,
          level,
          fields: "campaign_name,adset_name,ad_name,spend,impressions,clicks,cpm,cpc,ctr,actions"
        }
      });

      return {
        content: [{ type: "text", text: JSON.stringify(res.data, null, 2) }]
      };
    }
  );

  return server;
}

app.get("/", (req, res) => {
  res.send("Meta Ads MCP server is running. Use /mcp for Claude.");
});

app.post("/mcp", async (req, res) => {
  const server = createMcpServer();
  const transport = new StreamableHTTPServerTransport({
    sessionIdGenerator: undefined
  });

  await server.connect(transport);
  await transport.handleRequest(req, res, req.body);
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Meta Ads MCP running on port ${PORT}`);
});
