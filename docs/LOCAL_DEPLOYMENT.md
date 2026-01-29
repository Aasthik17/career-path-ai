# CareerPath AI - Local Deployment Guide

## 🚀 Quick Start

```bash
cd career-path-ai/frontend
npm install
npm run dev
```

Open **http://localhost:3000**

---

## ⚙️ AWS Credentials (Optional - for AI features)

To use Amazon Bedrock models, configure AWS credentials:

```bash
# Option 1: Environment variables
export AWS_ACCESS_KEY_ID=your_access_key
export AWS_SECRET_ACCESS_KEY=your_secret_key
export AWS_REGION=us-east-1

# Option 2: AWS CLI profile
aws configure
```

**Without credentials**: App works in local mode with smart fallback responses.

---

## 🔧 Available Amazon Models

### Text Generation
| Model | ID |
|-------|-----|
| Nova Premier | `amazon.nova-premier-v1:0` |
| Nova Pro (default) | `amazon.nova-pro-v1:0` |
| Nova Lite | `amazon.nova-lite-v1:0` |
| Nova 2 Lite | `amazon.nova-2-lite-v1:0` |
| Nova Micro | `amazon.nova-micro-v1:0` |
| Titan Large | `amazon.titan-tg1-large` |

### Embedding
| Model | ID |
|-------|-----|
| Titan Embed V2 (default) | `amazon.titan-embed-text-v2:0` |
| Titan Embed V1 | `amazon.titan-embed-text-v1` |
| Titan Multimodal | `amazon.titan-embed-image-v1` |
| Nova Multimodal | `amazon.nova-2-multimodal-embeddings-v1:0` |

---

## � Features

| Feature | Local Mode | With Bedrock |
|---------|------------|--------------|
| Resume Upload | ✅ Pattern matching | ✅ AI extraction |
| Chat Responses | ✅ Smart templates | ✅ Nova Pro AI |
| Skill Analysis | ✅ Demo data | ✅ Real analysis |
| Roadmap | ✅ Default plan | ✅ Personalized |

---

## 🎯 Demo Flow

1. **Upload Resume** on landing page
2. **View extracted skills** in profile card
3. **Chat with AI** for career advice
4. **Explore Dashboard** for skill gaps
5. **Follow Roadmap** for 12-week plan

---

## 🛠️ Troubleshooting

**Bedrock not working:**
- Check AWS credentials are set
- Verify models are enabled in us-east-1
- App auto-falls back to local mode

**Port conflict:**
```bash
npm run dev -- -p 3001
```
