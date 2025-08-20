# Atko Employee Assistant

A Next.js-based AI chat application for Atko Corporation employee support, designed to demonstrate Cross-App Access (CAA) with Okta.

Atko is a fictional technology company focused on innovation and employee well-being. This demo showcases how modern AI assistants can integrate with enterprise systems through secure Cross-App Access protocols.

## Features

- 🤖 **AI Chat Interface** - Powered by OpenAI GPT-4
- 🔐 **Secure Authentication** - User authentication (Phase 2)
- 📄 **Document Management** - Search and retrieve company documents 
- 🔗 **Cross-App Access** - Secure token exchange between applications 
- 🛠️ **MCP Integration** - Model Context Protocol for tool access 

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **AI**: OpenAI GPT-4
- **Authentication**: OIDC (Phase 2)
- **Protocol**: Model Context Protocol (MCP)
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+ 
- OpenAI API key
- Authentication provider (for Phase 2)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd employee-assistant
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.local.example .env.local
   ```
   
   Edit `.env.local` and add your OpenAI API key:
   ```bash
   OPENAI_API_KEY=your_openai_api_key_here
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Project Structure

```
employee-assistant/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   └── chat/
│   │   │       └── route.ts          # Chat API endpoint
│   │   ├── page.tsx                  # Main chat interface
│   │   ├── layout.tsx                # App layout
│   │   └── globals.css               # Global styles
│   └── ...
├── .env.local                        # Environment variables
└── package.json                      # Dependencies
```


## API Endpoints

### Chat API
- **POST** `/api/chat` - Send messages to the Atko AI assistant

## Environment Variables

### Required for Production
Configure these environment variables in your Vercel dashboard:

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXTAUTH_URL` | Your deployed app URL (e.g., https://your-app.vercel.app) | Yes |
| `NEXTAUTH_SECRET` | A long, random secret for NextAuth.js | Yes |
| `OKTA_ISSUER` | Your Okta domain URL | Yes |
| `OKTA_CLIENT_ID` | Okta OIDC client ID | Yes |
| `OKTA_CLIENT_SECRET` | Okta OIDC client secret | Yes |
| `OPENAI_API_KEY` | OpenAI API key for GPT-4 access | Yes |
| `MCP_SERVER_URL` | MCP Document Server URL (via proxy) | Yes |
| `MCP_AUTH_SERVER_URL` | MCP Auth Server URL (via proxy) | Yes |
| `OKTA_BASE_URL` | Okta base URL for ID-JAG token exchange and public access | Yes |
| `ID_JAG_AUDIENCE` | ID-JAG token audience | Yes |
| `ID_JAG_CLIENT_ID` | ID-JAG client ID (same as OKTA_CLIENT_ID) | Yes |
| `ID_JAG_CLIENT_SECRET` | ID-JAG client secret (same as OKTA_CLIENT_SECRET) | Yes |

### Example Configuration
```bash
# NextAuth Configuration
NEXTAUTH_URL=https://your-employee-assistant.vercel.app
NEXTAUTH_SECRET=your-long-random-nextauth-secret

# Okta Configuration
OKTA_ISSUER=https://your-domain.okta.com
OKTA_CLIENT_ID=your_okta_client_id
OKTA_CLIENT_SECRET=your_okta_client_secret

# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key

# MCP Server URLs (via proxy)
MCP_SERVER_URL=https://your-mcp-proxy.vercel.app/mcp
MCP_AUTH_SERVER_URL=https://your-mcp-proxy.vercel.app/mcp/auth

# ID-JAG Configuration
OKTA_BASE_URL=https://your-domain.okta.com
ID_JAG_AUDIENCE=https://your-mcp-audience
ID_JAG_CLIENT_ID=your_okta_client_id
ID_JAG_CLIENT_SECRET=your_okta_client_secret
```

## 🚀 Deployment

### Vercel Deployment
1. **Connect Repository**: Link your GitHub repository to Vercel
2. **Configure Environment Variables**: Set all required environment variables in Vercel dashboard
3. **Deploy**: Vercel will automatically build and deploy the application

### Environment Variables in Vercel
- Go to your Vercel project dashboard
- Navigate to **Settings** → **Environment Variables**
- Add all the required environment variables listed above
- Set them for **Production** environment
- Redeploy the application

### Prerequisites for Deployment
- ✅ Deployed MCP Document Server
- ✅ Deployed MCP Auth Server  
- ✅ Deployed MCP Proxy
- ✅ Configured Okta OIDC application
- ✅ OpenAI API key

## License

MIT License - see LICENSE file for details
