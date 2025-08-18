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

| Variable | Description | Required |
|----------|-------------|----------|
| `OPENAI_API_KEY` | OpenAI API key for GPT-4 access | Yes |
| `AUTH_ISSUER` | Authentication provider URL | Phase 2 |
| `AUTH_CLIENT_ID` | Authentication client ID | Phase 2 |
| `AUTH_CLIENT_SECRET` | Authentication client secret | Phase 2 |

## License

MIT License - see LICENSE file for details
