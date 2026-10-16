# AI Travel Advisor (Vercel version)

Static frontend (`public/index.html`) + Python serverless functions (`api/*.py`).
Streamlit's `st.session_state` is replaced by browser state: the page sends the
full history, summary and summarized-message count with every `/api/chat` call.

## Deploy

1. Push this folder to GitHub (replace the Streamlit files, or use a new repo/branch).
2. vercel.com > Add New Project > import the repo. No framework preset, no build command.
3. Settings > Environment Variables:
   - `OPENAI_API_KEY` (required)
   - `MODEL_NAME` (optional, default `gpt-6-luna`; use a model your account can access)
   - `INPUT_PRICE_PER_M`, `OUTPUT_PRICE_PER_M` (optional, enables the cost display)
4. Deploy.

## Local test

npm i -g vercel && vercel dev (reads .env)
