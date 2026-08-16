# Deploying the Ask Tangi assistant

The website stays on GitHub Pages. This small Cloudflare Worker keeps the Groq API key secret and answers the chat widget's requests.

## 1. Create a Cloudflare account

Sign in at https://dash.cloudflare.com and open **Workers & Pages**.

## 2. Create the Worker

Select **Create** > **Worker**, name it `tangi-portfolio-assistant`, then deploy the starter Worker. Open **Edit code** and replace its contents with `worker/worker.js` from this project. Click **Deploy**.

## 3. Add the two secrets

In the Worker, open **Settings** > **Variables and Secrets** > **Add**. Add both values as **Secrets**:

| Name | Value |
| --- | --- |
| `GROQ_API_KEY` | Your Groq key (starts with `gsk_`) |
| `ALLOWED_ORIGIN` | Your exact GitHub Pages address, for example `https://your-github-username.github.io` |

Never place the Groq key in `assistant-config.js`, GitHub, or a public chat message.

## 4. Connect the website

Copy the Worker URL shown after deployment, usually in this form:

`https://tangi-portfolio-assistant.<your-subdomain>.workers.dev/api/chat`

Paste it into the `endpoint` value in `assistant-config.js`. Commit that file to GitHub along with the rest of the portfolio.

## 5. Test it

Open the live portfolio and select **Ask Tangi** in the lower-right corner. Try: “What projects has Tangi worked on?”

If the widget says that it is being connected, the Worker URL is missing from `assistant-config.js`. If it says that the request failed, check the Worker secrets and make sure `ALLOWED_ORIGIN` exactly matches the live portfolio address (without a trailing slash).
