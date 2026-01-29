/**
 * Amazon Bedrock Client for CareerPath AI
 * Supports both text generation and embedding models
 */

import {
    BedrockRuntimeClient,
    InvokeModelCommand,
    InvokeModelCommandInput,
} from '@aws-sdk/client-bedrock-runtime';

// Available Amazon Models
export const MODELS = {
    // Text Generation Models
    generation: {
        NOVA_PREMIER: 'amazon.nova-premier-v1:0',
        NOVA_PRO: 'amazon.nova-pro-v1:0',
        NOVA_LITE: 'amazon.nova-lite-v1:0',
        NOVA_2_LITE: 'amazon.nova-2-lite-v1:0',
        NOVA_MICRO: 'amazon.nova-micro-v1:0',
        TITAN_LARGE: 'amazon.titan-tg1-large',
    },
    // Embedding Models
    embedding: {
        TITAN_EMBED_V2: 'amazon.titan-embed-text-v2:0',
        TITAN_EMBED_V1: 'amazon.titan-embed-text-v1',
        TITAN_MULTIMODAL: 'amazon.titan-embed-image-v1',
        NOVA_MULTIMODAL: 'amazon.nova-2-multimodal-embeddings-v1:0',
    },
};

// Default model selections
export const DEFAULT_GENERATION_MODEL = MODELS.generation.NOVA_PRO;
export const DEFAULT_EMBEDDING_MODEL = MODELS.embedding.TITAN_EMBED_V2;

// Region for Bedrock (hackathon requirement)
const BEDROCK_REGION = 'us-east-1';

// Create Bedrock client
let bedrockClient: BedrockRuntimeClient | null = null;

function getBedrockClient(): BedrockRuntimeClient {
    if (!bedrockClient) {
        bedrockClient = new BedrockRuntimeClient({
            region: BEDROCK_REGION,
            // Credentials will be picked up from environment or AWS config
        });
    }
    return bedrockClient;
}

/**
 * Invoke a text generation model (Nova/Titan)
 */
export async function invokeGenerationModel(
    prompt: string,
    modelId: string = DEFAULT_GENERATION_MODEL,
    options: {
        maxTokens?: number;
        temperature?: number;
        topP?: number;
    } = {}
): Promise<string> {
    const client = getBedrockClient();

    const { maxTokens = 4096, temperature = 0.7, topP = 0.9 } = options;

    // Format request based on model type
    let requestBody: Record<string, unknown>;

    if (modelId.includes('nova')) {
        // Amazon Nova format
        requestBody = {
            messages: [
                {
                    role: 'user',
                    content: [{ text: prompt }]
                }
            ],
            inferenceConfig: {
                maxTokens,
                temperature,
                topP,
            }
        };
    } else if (modelId.includes('titan')) {
        // Titan Text format
        requestBody = {
            inputText: prompt,
            textGenerationConfig: {
                maxTokenCount: maxTokens,
                temperature,
                topP,
            }
        };
    } else {
        throw new Error(`Unsupported model: ${modelId}`);
    }

    const input: InvokeModelCommandInput = {
        modelId,
        contentType: 'application/json',
        accept: 'application/json',
        body: JSON.stringify(requestBody),
    };

    try {
        const response = await client.send(new InvokeModelCommand(input));
        const responseBody = JSON.parse(new TextDecoder().decode(response.body));

        // Extract text from response based on model type
        if (modelId.includes('nova')) {
            return responseBody.output?.message?.content?.[0]?.text || '';
        } else if (modelId.includes('titan')) {
            return responseBody.results?.[0]?.outputText || '';
        }

        return '';
    } catch (error) {
        console.error('Bedrock generation error:', error);
        throw error;
    }
}

/**
 * Invoke an embedding model
 */
export async function invokeEmbeddingModel(
    text: string,
    modelId: string = DEFAULT_EMBEDDING_MODEL
): Promise<number[]> {
    const client = getBedrockClient();

    let requestBody: Record<string, unknown>;

    if (modelId.includes('titan-embed-text-v2')) {
        requestBody = {
            inputText: text,
            dimensions: 1024,
            normalize: true,
        };
    } else if (modelId.includes('titan-embed')) {
        requestBody = {
            inputText: text,
        };
    } else if (modelId.includes('nova')) {
        requestBody = {
            texts: [text],
        };
    } else {
        throw new Error(`Unsupported embedding model: ${modelId}`);
    }

    const input: InvokeModelCommandInput = {
        modelId,
        contentType: 'application/json',
        accept: 'application/json',
        body: JSON.stringify(requestBody),
    };

    try {
        const response = await client.send(new InvokeModelCommand(input));
        const responseBody = JSON.parse(new TextDecoder().decode(response.body));

        if (modelId.includes('titan')) {
            return responseBody.embedding || [];
        } else if (modelId.includes('nova')) {
            return responseBody.embeddings?.[0] || [];
        }

        return [];
    } catch (error) {
        console.error('Bedrock embedding error:', error);
        throw error;
    }
}

/**
 * Check if Bedrock is available (credentials configured)
 */
export async function isBedrockAvailable(): Promise<boolean> {
    try {
        const client = getBedrockClient();
        // Try a minimal call to check credentials
        await client.config.credentials();
        return true;
    } catch {
        return false;
    }
}
